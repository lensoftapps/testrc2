// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.

import { contextBridge, ipcMain, ipcRenderer } from "electron";
import CommonDataManager from "./controller/CommonDataManager";



window.addEventListener("DOMContentLoaded", () => {
  // renderer process
  const replaceText = (selector: string, text: string) => {
    const element = document.getElementById(selector);
    if (element) {
      element.innerText = text;
    }
  };

  for (const type of ["chrome", "node", "electron"]) {
    replaceText(`${type}-version`, process.versions[type as keyof NodeJS.ProcessVersions]);
  }

  document.dispatchEvent(
    new CustomEvent("rc:DOMContentLoaded", { detail: "" })
  );
});


// bridge 2
// need to set contextIsolation: true
/*
contextBridge.exposeInMainWorld("electron", {
  messageWcToNa: (data: unknown) => ipcRenderer.send("user:bridge2", data),
});
ipcRenderer.on("NaToWc", (event, message) => {
  document.dispatchEvent(
    new CustomEvent("onMessageNaToWc", { detail: message })
  );
});
*/
// end bridge 2