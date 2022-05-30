import axios from "axios";
import CommonDataManager from "./CommonDataManager";
import * as fs from "fs";
import * as path from "path";
import { BrowserWindow } from "electron";
import { RcMsg } from "../model/RcMsg";
import * as tunnel from 'tunnel';
import { stringIsNullOrEmpty } from "./util";
import { showProxyCredInput } from "./ControllerProxy";

export default class ControllerDownload {

  static myInstance: ControllerDownload = null;
  
  controller = new AbortController();
  downloading = false;

  /**
   * @returns {ControllerDownload}
   */
  static getInstance() {
      if (ControllerDownload.myInstance == null) {
        ControllerDownload.myInstance = new ControllerDownload();
      }

      return this.myInstance;
  }

  downloadBook(bookId: string, url: string) {
    console.log("started download");
    const tmpDir = path.join(CommonDataManager.getInstance().getAppDataPathBooks(), 'tmp');
    if (!fs.existsSync(tmpDir))
      fs.mkdirSync(tmpDir);
    else
      emptyDir(tmpDir);  
    const fpath = path.join(tmpDir, bookId + ".pdf");
    
    prepareDownload(url, fpath);
    //download(url, fpath, this.controller);
  }

  cancelDownload() {
    console.log("canceling...");
    //this.controller.abort();
    this.setDownloading(false);
  }

  isDownloading(){
    return this.downloading;
  }

  setDownloading(b: boolean){
    this.downloading = b;
  }
}

/*export const downloadBook = (bookId: string, url: string) => {
  console.log("started download");
  const fpath = path.join(CommonDataManager.getInstance().getAppDataPathCommon(), bookId + ".pdf");

  download(url, fpath);
}*/

async function prepareDownload(url: string, fpath_tmp: string){
  let proxy:any = null;
  const focusedWindow = BrowserWindow.getAllWindows()[0];
  const session = focusedWindow.webContents.session;
  // resolve the proxy for a known URL. This could be the URL you expect to use or a known good url like google.com
  session.resolveProxy(url).then(proxyUrl=> {
    console.log("proxy url: " + proxyUrl); // PROXY ryzen.local:3128
    if(proxyUrl && proxyUrl.indexOf('PROXY ') === 0){
      if(stringIsNullOrEmpty(CommonDataManager.getInstance().getProxyPassword())){
        showProxyCredInput(focusedWindow);
        return;
      }

      const purl = proxyUrl.substring('PROXY '.length);
      proxy = {
        host: purl.split(':')[0], //'ryzen.local',
        port: purl.split(':')[1], //3128,
        proxyAuth: CommonDataManager.getInstance().getProxyUserName() + ':' + CommonDataManager.getInstance().getProxyPassword(), // 'user:tt15qq7'
      };
    }
    // DIRECT means no proxy is configured
    if (proxyUrl !== 'DIRECT') {
      // retrieve the parts of the proxy from the string returned
      // the url would look something like: 'PROXY http-proxy.mydomain.com:8080'
      ;
    }
    download(url, fpath_tmp, proxy);
  });
}

async function download (url: string, fpath_tmp: string, _proxy:any) {

  try{
    const tunnel_ = tunnel.httpsOverHttp({
      proxy: _proxy /*{
        host: 'ryzen.local',
        port: 3128,
        proxyAuth: 'user:tt15qq7'
      },*/
    });

    ControllerDownload.getInstance().setDownloading(true);
    console.log('Connecting')
    const { data, headers } = await axios({
      url,
      method: 'GET',
      responseType: 'stream',
      headers: {
        'Authorization': "Bearer " + CommonDataManager.getInstance().getAccessToken()
      },
      httpsAgent: _proxy ? tunnel_ : null,
      proxy: false,
      /*proxy: {
        host: 'ryzen.local',
        port: 3128,
        auth: {username: 'user', password: 'tt15qq7'}
      }*/
      //signal: controller.signal
      //cancelToken: cancelTokenSource.token
    });
    const totalLength = headers['content-length'];
    const len = +totalLength;
  
    console.log('Starting download, len=' + len);
  
    const writer = fs.createWriteStream(fpath_tmp);
  
    let totalDownloaded = 0;
  
    data.on('data', (chunk:any) => {
        totalDownloaded += chunk.length;
        //console.log((totalDownloaded / len) * 100);
        sendProgressToRenderer(Math.floor((totalDownloaded / len) * 100), null);
      }
    );
    data.on('end', () => {
      console.log("data end");
      if(totalDownloaded === len){
        var oldPath = fpath_tmp;
        var newPath = oldPath.replace('\\tmp', '').replace('/tmp', '');
        fs.rename(oldPath, newPath, function (err) {
          if (err) throw err;
          //console.log('Successfully renamed - AKA moved!')
        })
      }
      ControllerDownload.getInstance().setDownloading(false);
      //console.log("finished")
      sendProgressToRenderer(-1, 'finished');
    });
    
    //console.log(data);
    data.pipe(writer);


    // download error watch, timeout 10 sec
    let td = -1;
    const downloadErrorWatch = () => {
      if(!ControllerDownload.getInstance().isDownloading())
        data.req.abort();
      //  throw new Error("Canceled by request");
      if(td !== totalDownloaded){
        td = totalDownloaded;
        setTimeout(downloadErrorWatch, 10000);
        //console.log("123");        
        //cancelTokenSource.cancel();
      }
      else{
        ControllerDownload.getInstance().setDownloading(false);
        data.req.abort();
        sendProgressToRenderer(-1, "Error timeout");
      }
    }
    downloadErrorWatch();


    // download cancel watch, timeout 0.5 sec
    const downloadCancelWatch = () => {
      //console.log('downloading=' + ControllerDownload.getInstance().isDownloading());
      if(!ControllerDownload.getInstance().isDownloading()){
        data.req.abort();
        sendProgressToRenderer(-1, "Canceled by request");
      }
      else
        setTimeout(downloadCancelWatch, 500);
    }
    downloadCancelWatch();

  }
  catch(error){
    ControllerDownload.getInstance().setDownloading(false);
    console.log("download error");
    if(error && error.response){
      console.log(error.response.status + " " + error.response.statusText);
      sendProgressToRenderer(-1, error.response.status + " " + error.response.statusText);
    }
    else
      console.log(error.message);
  }

}

const sendProgressToRenderer = (percent: number, status: string) => {
  const m = new RcMsg();
  m.msgtype = 'downloadBook';
  m.data = {prc: percent, stat: status};
  const focusedWindow = BrowserWindow.getAllWindows()[0]; // .getFocusedWindow();
  if(focusedWindow)
    focusedWindow.webContents.send('rc:msg', m);
}

function emptyDir(dirPath: string) {
  const dirContents = fs.readdirSync(dirPath); // List dir content

  for (const fileOrDirPath of dirContents) {
    try {
      // Get Full path
      const fullPath = path.join(dirPath, fileOrDirPath);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        // It's a sub directory
        if (fs.readdirSync(fullPath).length) emptyDir(fullPath);
        // If the dir is not empty then remove it's contents too(recursively)
        fs.rmdirSync(fullPath);
      } else fs.unlinkSync(fullPath); // It's a file
    } catch (ex) {
      console.error(ex.message);
    }
  }
}