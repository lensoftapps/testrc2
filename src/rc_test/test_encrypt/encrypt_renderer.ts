// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process unless
// nodeIntegration is set to true in webPreferences.
// Use preload.js to selectively enable features
// needed in the renderer process.

import { ipcRenderer } from "electron";

document.getElementById("button-save").addEventListener("click", onClickSave);
document.getElementById("button-load").addEventListener("click", onClickLoad);

function onClickSave(){
    ipcRenderer.send("user:save", null);
}

function onClickLoad(){
    ipcRenderer.send("user:load", null);
}