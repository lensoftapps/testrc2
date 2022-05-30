// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process unless
// nodeIntegration is set to true in webPreferences.
// Use preload.js to selectively enable features
// needed in the renderer process.

import { ipcRenderer } from "electron";
import * as TabGroup from "electron-tabs";

window.addEventListener("DOMContentLoaded", () => {
  console.log("DOMContentLoaded");
  ipcRenderer.send("getUserData");
});

document
  .getElementById("button-logout")
  .addEventListener("click", sendDataFromWcToNa);

function sendDataFromWcToNa() {
  ipcRenderer.send("user:logout", null);
}

ipcRenderer.on(
  "returnUserData",
  (event: Electron.IpcRendererEvent, data: undefined) => {
    const userId = data as string;
    console.log("[R] userId=" + userId);
    if (userId.length > 0) drawTabs(userId);
  }
);

const drawTabs = (userId: string) => {
  const tabGroup = new TabGroup({
    /*newTab: {
          title: 'New Tab'
        }*/
  });

  const tab = tabGroup.addTab({
    title: "Google",
    src: "https://google.com",
    webviewAttributes: { partition: "persist:" + userId },
    //visible: true,
  });
  tabGroup.addTab({
    title: "SO",
    src: "https://stackoverflow.com",
    webviewAttributes: { partition: "persist:" + userId },
    //visible: true,
  });

  tab.activate();

  tab.webview.addEventListener('did-fail-load', (e) => {
    console.log("tab fail load");
    ipcRenderer.send("user:tab-fail-load", null);
  });
};
