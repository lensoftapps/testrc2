import { app, /*autoUpdater,*/ BrowserWindow, dialog, ipcMain, systemPreferences } from "electron";
import * as path from "path";
import { logEverywhere, logToFile } from "./main_log";
import { TestSelectorMain, test_selector_execute_main } from "./rc_test/test_selector/test_selector_main";
import CommonDataManager from "./controller/CommonDataManager";
import ControllerFlow from "./controller/ControllerFlow";
import { getTokensDefault, redirectUrl } from "./controller/auth";
import { RcMsg } from "./model/RcMsg";
import ControllerDownload from "./controller/ControllerDownload";
import { showProxyCredInput } from "./controller/ControllerProxy";
import { getAppCustomProtocol, is_Dev } from "./controller/util";

const { autoUpdater } = require('electron-updater');
const cmgr = CommonDataManager.getInstance();

export const executeMain = () => {
  test_selector_execute_main(TestSelectorMain.TS_PROTOCOL_REGISTER_PRIVILEGED); // protocol book://
  accessCamMic();
  app.setPath('userData', CommonDataManager.getInstance().getAppDataPathCommon());

  //test_selector_execute_main(TestSelectorMain.TS_INJECT_JS);
  //test_selector_execute_main(TestSelectorMain.TS_BRIDGE);
  //test_selector_execute_main(TestSelectorMain.TS_BRIDGE2);
  //test_selector_execute_main(TestSelectorMain.TS_RELOGIN);
  //test_selector_execute_main(TestSelectorMain.TS_ENCRYPT);

  // OSX Define custom protocol handler. Deep linking works on packaged versions of the application!
  //if (process.platform == "darwin")
  //  app.setAsDefaultProtocolClient('readcloud')
  // remove so we can register each time as we run the app.
  const customProtocolScheme = getAppCustomProtocol();
  app.removeAsDefaultProtocolClient(customProtocolScheme);
  // If we are running a non-packaged version of the app && on windows
  const isDev = false;
  if(isDev /*process.env.NODE_ENV === 'development'*/ && process.platform === 'win32') {
    console.log("setting development mode protocol");
    // Set the path of electron.exe and your app.
    // These two additional parameters are only available on windows.
    app.setAsDefaultProtocolClient(customProtocolScheme, process.execPath, [path.resolve(process.argv[1])]);        
  } else {
    app.setAsDefaultProtocolClient(customProtocolScheme);
  }

  if(!is_Dev()){
    autoUpdate();
  }
}

export const appOnReady = (event: Electron.Event, launchInfo: Record<string, any> | Electron.NotificationResponse) => {
  const mw = createWindow(event, launchInfo);

  test_selector_execute_main(TestSelectorMain.TS_PROTOCOL_REGISTER_BUFFER);
  //test_selector_execute_main(TestSelectorMain.TS_DOWNLOAD_FILE);

  //testProxy(mw);
  

  return mw;
}

export const appOnActivate = () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0)
    return createWindow(null, null);
}

export const appOnSecondInstance = (mainWindow: BrowserWindow, commandLine: string[]) => {
  logToFile("Second instance. Has Main Window? " + mainWindow);
  // Someone tried to run a second instance, we should focus our window.
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
    //processArguments(mainWindow, commandLine);
  }
}

export const appOnOpenUrl = (mainWindow: BrowserWindow, event: Electron.Event, url: string) => {
  event.preventDefault();
  if(mainWindow){
    //logEverywhere("-app-open-url", mainWindow);
    //logEverywhere(url, mainWindow);
  }
  return url;
}

const accessCamMic = () => {
  // access cam & mic in macos
  if (process.platform == "darwin") {
    systemPreferences.askForMediaAccess("camera").then((ac: boolean) => {});
    systemPreferences.askForMediaAccess("microphone").then((ac: boolean) => {
      /*const window = BrowserWindow.getFocusedWindow();
   dialog.showMessageBox(window, {
    title: 'Permission',
    buttons: ['Dismiss'],
    type: 'info',
    message: 'has access: ' + ac,
   });*/
    });
    //const s = systemPreferences.getMediaAccessStatus("microphone");
    //console.log(s);
  }
};

const createWindow = (event: Electron.Event, launchInfo: Record<string, any> | Electron.NotificationResponse) => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      webviewTag: true, /* needs to make electron-tabs and webview working */
      nodeIntegration: true,
      contextIsolation: false, // true for bridge2; for other tests was false
      //partition:"persist:user0"
    },
    width: 1200,
  });

  // and load the index.html of the app.
  //mainWindow.loadFile(path.join(__dirname, "../index.html"));
  mainWindow.loadURL(ControllerFlow.getInstance().getUrl());
  //mainWindow.loadFile(path.join(__dirname, "../src/rc_test/test_encrypt/encrypt.html")); // test ENCRYPT
  //mainWindow.loadFile(path.join(__dirname, "../src/rc_test/test_bridge2/bridge2.html")); // test BRIDGE2
  //mainWindow.loadURL("https://www.onlinemictest.com/webcam-test/"); // test CAMERA
  //mainWindow.loadURL("https://www.onlinemictest.com/"); // test MICROPHONE
  //mainWindow.loadURL("https://www.gutenberg.org/files/84/"); // test DOWNLOAD FILE
  //mainWindow.loadURL("https://www.cambridge.org/go/login"); // test INJECT JS
  //mainWindow.loadFile(path.join(__dirname, "../test_webview.html"));
  //const p = path.join(__dirname, "../test_webview.html");
  //mainWindow.loadURL("file://" + p);

  /*mainWindow.loadURL(url.format ({
    pathname: path.join(__dirname, '../test_webview.html'),
    protocol: 'file:',
    slashes: true
 }))*/

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  // logging in
  const filter = {
    urls: [
      redirectUrl + '*',
      "https://accounts.readcloud.com/session/end/success"
    ]
  };
  mainWindow.webContents.session.webRequest.onBeforeRequest(filter, async ({ url }: any) => {
    if(url.indexOf(redirectUrl) > -1){
      // get access token and load bundle
      const accessToken = await getTokensDefault(url);
      CommonDataManager.getInstance().setAccessToken(accessToken);
      mainWindow.loadURL(ControllerFlow.getInstance().getUrl());
    }
    else if(url.indexOf("readcloud.com/session/end/success") > -1){
      // logout success
      CommonDataManager.getInstance().logoutClearData();
      mainWindow.webContents.session.clearCache();
      mainWindow.webContents.session.clearStorageData();
      mainWindow.webContents.session.cookies.get({})
        .then((cookies) => {
          console.log(cookies);
          for(const c of cookies){
            mainWindow.webContents.session.cookies.remove(c.domain, c.name);
          }
        }).catch((error) => {
          console.log(error)
        })
      mainWindow.loadURL(ControllerFlow.getInstance().getUrl());
    }
    //createWindow();
    //return destroyAuthWin();
  });

  //processArguments(mainWindow, process.argv);
  /*if(event){
    console.log(event);
  }
  if(launchInfo)  
    logToFile(launchInfo.toString());*/

  // INJECT JS IN CAMBRIDGE
  /*mainWindow.webContents.once("did-finish-load", () => {
    let str = readFileSync(
      path.join(__dirname, "../src/rc_test/test_inject_js/cambridge.txt"),
      "utf-8"
    );
    str = str
      .replace("%U%", "C.Black@chisholmcc.wa.edu.au")
      .replace("%P%", "callyblack");
    console.log("inject");
    mainWindow.webContents.executeJavaScript(str);
  });*/

  return mainWindow;
}

export const processArguments = (mainWindow: BrowserWindow, args: string[]) => {
  logToFile("arguments length = : " + args.length);
  for(let i = 0; i < args.length; i++){
    if(args[i].indexOf(getAppCustomProtocol()) === 0)
      return args[i];
    //logToFile("arg: " + args[i]);
    //if(mainWindow)
      //logEverywhere("arg: " + args[i], mainWindow);
  }
  return null;
}

export const processExternalUrl = (mainWindow: BrowserWindow, eurl: string) => {
  if(eurl){
    if(mainWindow){
      logEverywhere("external url: " + eurl, mainWindow);
      eurl = null;
    }
  }
  return eurl;
}

const autoUpdate = () => {
  setInterval(() => {
    logToFile("auto updater timer");
    autoUpdater.checkForUpdatesAndNotify();    
  }, 30000); // every minute
  
}

autoUpdater.on('error', () => {
  logToFile('error');
});

autoUpdater.on('update-available', () => {
  logToFile('update available');
});

autoUpdater.on('update-downloaded', () => {
  logToFile('update_downloaded');
  autoUpdater.quitAndInstall();
});

/*const autoUpdate = () => {
  //const opt:Electron.FeedURLOptions = {url: "https://github.com/lensoftapps/testrc/releases"};
  const opt:Electron.FeedURLOptions = {url: "file://D:/tmp/rc_electron/WinceBooks-5.0.7-full.nupkg"};
  autoUpdater.setFeedURL(opt);
  setInterval(() => {
    autoUpdater.checkForUpdates()
    logToFile("auto updater timer");
  }, 30000); // every minute
  autoUpdater.on('update-available', ()=>{
    logToFile("update available");
  });
  autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
    logToFile("update downloaded");
    const dialogOpts = {
      type: 'info',
      buttons: ['Restart', 'Later'],
      title: 'Application Update',
      message: process.platform === 'win32' ? releaseNotes : releaseName,
      detail: 'A new version has been downloaded. Restart the application to apply the updates.'
    }
  
    dialog.showMessageBox(dialogOpts).then((returnValue) => {
      if (returnValue.response === 0) autoUpdater.quitAndInstall()
    })
  });
  autoUpdater.on('error', message => {
    logToFile('There was a problem updating the application')
    logToFile(message.toString());
    logToFile(message.message);
  });
}*/

// not working
const testProxy = (mainWindow: BrowserWindow) => {
  const session = mainWindow.webContents.session;
  // resolve the proxy for a known URL. This could be the URL you expect to use or a known good url like google.com
session.resolveProxy('https://www.google.com').then(proxyUrl=> {
  // DIRECT means no proxy is configured
  if (proxyUrl !== 'DIRECT') {
    // retrieve the parts of the proxy from the string returned
    // the url would look something like: 'PROXY http-proxy.mydomain.com:8080'
    const proxyUrlComponents = proxyUrl.split(':');
    logEverywhere(proxyUrl, mainWindow);

      //const proxyHost = proxyUrlComponents[0].split(' ')[1];
      //const proxyPort = parseInt(proxyParts[1], 10);

      // do something with proxy details
      //Electron.Session.fromPartition("persist:user0")
        session.setProxy({ proxyRules: proxyUrl }).then(()=> {
          console.log("using the proxy  " + proxyUrl);
          mainWindow.reload();
        });
  }
});
}

export const mwOnDidFailLoad = (
  mainWindow: BrowserWindow,
  event: Event,
  errorCode: number,
  errorDescription: string,
  validatedURL: string,
  isMainFrame: boolean,
  frameProcessId: number,
  frameRoutingId: number
) => {
  try {
    logEverywhere("network error", mainWindow);
    logEverywhere(errorCode.toString(), mainWindow);
    //logEverywhere(errorDescription, mainWindow);
    showProxyCredInput(mainWindow);
  } catch (err) {
  }
}

/*const showProxyCredInput = (mainWindow: BrowserWindow) => {
  
  const prompt = require('electron-prompt');

      prompt({
          title: 'Proxy username',
          label: 'Username:',
          value: cmgr.getProxyUserName(),
          inputAttrs: {
              type: 'text'
          },
          type: 'input',
          alwaysOnTop:true
      })
      .then((r:any) => {
          if(r === null) {
              console.log('user cancelled');
          } else {
              console.log('result', r);
              cmgr.setProxyUserName(r);
              prompt({
                title: 'Proxy password',
                label: 'Password:',
                value: cmgr.getProxyPassword(),
                inputAttrs: {
                    type: 'text'
                },
                type: 'input',
                alwaysOnTop:true
            })
            .then((r:any) => {
                if(r === null) {
                    console.log('user cancelled');
                } else {
                    console.log('result', r);
                    cmgr.setProxyPassword(r);
                    //callback(proxyUserName, proxyPassword);
                    if(mainWindow)
                      mainWindow.reload();
                }
            })
            .catch(console.error);
          }
      })
      .catch(console.error);
}*/

export const appOnLogin = (callback: any) => {
  //console.log(cmgr.getProxyUserName() + " " + cmgr.getProxyPassword());
  callback(cmgr.getProxyUserName(), cmgr.getProxyPassword());
}

ipcMain.on("rc:msg", (event: Electron.IpcMainEvent, data: RcMsg) => {
  if(data.msgtype === 'getUserInfo'){
    const m = new RcMsg();
    m.msgtype = data.msgtype;
    m.data = CommonDataManager.getInstance()._loginData;
    event.reply("rc:msg", m);
  }
  else if(data.msgtype === 'logout'){    
    const focusedWindow = BrowserWindow.getFocusedWindow();
    focusedWindow.loadURL(ControllerFlow.getInstance().getUrlLogout(redirectUrl));
    /*ControllerFlow.getInstance().doLogout().then(() => {        
      const focusedWindow = BrowserWindow.getFocusedWindow();
      focusedWindow.loadURL(ControllerFlow.getInstance().getUrl());
    });*/
  }
  else if(data.msgtype === 'downloadBook'){
    if(!ControllerDownload.getInstance().isDownloading())
      ControllerDownload.getInstance().downloadBook(data.data.bookId, data.data.url);
    else
      ControllerDownload.getInstance().cancelDownload();  
  }
});