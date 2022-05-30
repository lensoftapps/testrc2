// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process unless
// nodeIntegration is set to true in webPreferences.
// Use preload.js to selectively enable features
// needed in the renderer process.

import { ipcRenderer, shell } from "electron";
import CommonDataManager from "./controller/CommonDataManager";
import { LoginData } from "./model/LoginData";
import { RcMsg } from "./model/RcMsg";
import {TestSelectorRenderer, test_selector_execute_renderer} from "./rc_test/test_selector/test_selector_renderer";

/*document.body.addEventListener('click', () => {
    //console.log('hello vscode!')    
});*/

document.addEventListener('rc:DOMContentLoaded', function (e:CustomEvent) {
    console.log('Got Message rc:DOMContentLoaded');
    const msg: RcMsg = new RcMsg();
    msg.msgtype = "getUserInfo";
    ipcRenderer.send("rc:msg", msg);
    //console.log(e.detail) 
}, false);


const logout = () => {

    const msg: RcMsg = new RcMsg();
    msg.msgtype = "logout";
    ipcRenderer.send("rc:msg", msg);
  
    //test_selector_execute_renderer(TestSelectorRenderer.TS_JS_INJECT);
    //test_selector_execute_renderer(TestSelectorRenderer.TS_BRIDGE);
    //test_selector_execute_renderer(TestSelectorRenderer.TS_INJECT_JS_TO_ACTIVE_TAB);
    //test_selector_execute_renderer(TestSelectorRenderer.TS_LOGOUT_TO_BROWSER);
    //require("shell").openExternal("http://www.google.com");
    //shell.openExternal("http://www.google.com"); // open in the default browser
}

const downloadBook = () => {
  const msg: RcMsg = new RcMsg();
  msg.msgtype = "downloadBook";
  msg.data = {bookId: "1", url: "http://api.readcloud.com/uploaded_books/531dbb2629f011114a421b04/8fa92849-09de-4fbc-8088-58610204feb3.pdf"}; // 2 mb
  //msg.data = {bookId: "4", url: "https://readcloud.citipointe.qld.edu.au/GeographyAlive10.pdf"}; // 162 mb
  ipcRenderer.send("rc:msg", msg);
}

document.getElementById("btn-logout").addEventListener("click", logout);
document.getElementById("btn-downloadBook").addEventListener("click", downloadBook);

const displayUserInfo = (ld: LoginData) => {
  const element1 = document.getElementById("info_div");
  if (element1) {
    //console.log(ld);
    if(ld)
        element1.innerHTML += "<p>" + ld.email + "</p>" + "<p>" + ld.role + "</p>" + "<p>" + ld.userId + "</p>";
  };
}

ipcRenderer.on("rc:msg", (event: Electron.IpcRendererEvent, data: RcMsg) => {
  if(data.msgtype === 'getUserInfo'){
    displayUserInfo(data.data);
  }
  else if(data.msgtype === 'downloadBook'){
    const element1 = document.getElementById("lbl-download");
    if (element1) {
      if(data.data.prc > -1){
        element1.innerHTML = data.data.prc + '%';
        document.getElementById("btn-downloadBook").innerHTML = "Cancel";
      }
      else {
        element1.innerHTML = data.data.stat;
        document.getElementById("btn-downloadBook").innerHTML = "Download book";
      }
    };
  }
});

