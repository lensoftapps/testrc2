import { app, BrowserWindow, ipcMain } from "electron";
import { appOnActivate, appOnLogin, appOnOpenUrl, appOnReady, appOnSecondInstance, executeMain, mwOnDidFailLoad, processArguments, processExternalUrl } from "./main_helpers";
import { logEverywhere, logToFile } from "./main_log";
import * as path from "path";


/*declare global {
  interface Window {
    electron: any;
  }
}

global.exports = {};*/

//test_selector_execute_main(TestSelectorMain.TS_PROTOCOL_REGISTER_PRIVILEGED);

// Deep linked url
let deeplinkingUrl: string;
let mainWindow: BrowserWindow;

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  logToFile("quit");
  app.quit();
} else {

  // OSX
  app.on('open-url', function (event: Electron.Event, url: string) {
    deeplinkingUrl = appOnOpenUrl(mainWindow, event, url);    
    deeplinkingUrl = processExternalUrl(mainWindow, deeplinkingUrl);
  });

  app.on("second-instance", (event, commandLine, workingDirectory) => {
    appOnSecondInstance(mainWindow, commandLine);
    deeplinkingUrl = processArguments(mainWindow, commandLine);
    deeplinkingUrl = processExternalUrl(mainWindow, deeplinkingUrl);
  });


  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on("ready", (event: Electron.Event, launchInfo: Record<string, any> | Electron.NotificationResponse) => {
    mainWindow = appOnReady(event, launchInfo); // create window

    /*mainWindow.webContents.on('did-finish-load', () => {
      logEverywhere("did-finish-load", mainWindow);
    });*/

    mainWindow.webContents.on('did-fail-load', (
      event: Event,
      errorCode: number,
      errorDescription: string,
      validatedURL: string,
      isMainFrame: boolean,
      frameProcessId: number,
      frameRoutingId: number) => {
        mwOnDidFailLoad(mainWindow, event, errorCode, errorDescription, validatedURL, isMainFrame, frameProcessId, frameRoutingId);
    });
    ipcMain.on("user:tab-fail-load", (event: Electron.IpcMainEvent, data: undefined) => {
      mwOnDidFailLoad(mainWindow, event, -1, null, null, null, null, null);
    });

    if(!deeplinkingUrl)
      deeplinkingUrl = processArguments(mainWindow, process.argv);

    if(deeplinkingUrl){
      deeplinkingUrl = processExternalUrl(mainWindow, deeplinkingUrl);
    }

    logToFile("app is ready. Main window? " + mainWindow);

    app.on("activate", function () {
      const mw = appOnActivate();
      if(mw)
        mainWindow = mw;
        logToFile("app is activated. Main window? " + mainWindow);
    });
  });

  // Quit when all windows are closed, except on macOS. There, it's common
  // for applications and their menu bar to stay active until the user quits
  // explicitly with Cmd + Q.
  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit();
    }
  });
 
  app.on('login', function(event, webContents, request, authInfo, callback) {
    if(authInfo.isProxy) {     
      appOnLogin(callback);
      //callback(proxyUserName, proxyPassword);
      //callback('user', 't19x8$c7');
    }
  });

  // In this file you can include the rest of your app"s specific main process
  // code. You can also put them in separate files and require them here.
  executeMain();
}

