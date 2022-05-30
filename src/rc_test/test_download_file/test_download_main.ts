import axios from "axios";
import { BrowserWindow, dialog, SaveDialogOptions, session } from "electron";
import * as fs from "fs";

export const test_download_handle_session = () => {
  //urls: ['https://*/*'] //, 'https://*.github.com/*', '*://electron.github.io']
  session.defaultSession.webRequest.onBeforeSendHeaders({urls: ['https://*/*']}, (details:Electron.OnBeforeSendHeadersListenerDetails, callback) => {
    console.log(details.url);
    if(details.url.indexOf(".txt") > 0){
      //details.webContents.downloadURL(details.url);
      downloadFile(details.url);
      return;
    }
    /*if (details.uploadData) {
        const buffer = Array.from(details.uploadData)[0].bytes;
        console.log('Request body: ', buffer.toString());
    }*/
    callback(details);
  });
}

async function downloadFile(
  fileUrl: string
) {
  const fName = fileUrl.substring(fileUrl.lastIndexOf('/') + 1);
  
  let options:SaveDialogOptions = {
    title: "Save file",
    defaultPath : fName,
    //buttonLabel : "Save Electron File",
    filters :[
     /*{name: 'Images', extensions: ['jpg', 'png', 'gif']},
     {name: 'Movies', extensions: ['mkv', 'avi', 'mp4']},
     {name: 'Custom File Type', extensions: ['as']},*/
     {name: 'All Files', extensions: ['*']}
    ]
   };

   const window = BrowserWindow.getFocusedWindow();
   
   //Synchronous
   dialog.showSaveDialog(window, options)
   .then(result => {
    const filePath = result.filePath;
    if (filePath === undefined || filePath.length === 0) {
      return;
    }
    //console.log(filePath);
    axios({
      method: "get",
      url: fileUrl,
      responseType: "stream",
    }).then(function (response) {
      response.data.pipe(fs.createWriteStream(filePath));
    });
  }).catch(err => {
    console.log(err);
  })
}