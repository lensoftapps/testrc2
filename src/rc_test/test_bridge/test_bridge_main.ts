import { app, BrowserWindow, ipcMain } from "electron";
import * as electron from "electron";

export const test_bridge_handle_signals = () => {
    ipcMain.on("user:bridgeWcToNa", (event:Electron.IpcMainEvent, data:undefined) => {
      console.log("[M] got bridge data:");
      console.log(data);
      event.reply("user:bridgeNaToWc", "This is some APP_STATE");
    });
}