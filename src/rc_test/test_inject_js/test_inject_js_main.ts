import { app, BrowserWindow, ipcMain } from "electron";
import * as electron from "electron";

export const test_handle_main_signals = () => {
  const window = electron.BrowserWindow;

  /*const focusedWindow = window.getFocusedWindow();
  focusedWindow.webContents.once("did-finish-load", () => {
    inject();
  });*/

  ipcMain.on(
    "user:injectJS",
    (event: Electron.IpcMainEvent, data: undefined) => {
      inject();
    }
  );

  const inject = () => {
    const focusedWindow = window.getFocusedWindow();
      console.log("[M] got data:");
      //console.log(data);

      focusedWindow.webContents.executeJavaScript('alert(document.title);');
    
  }
};
