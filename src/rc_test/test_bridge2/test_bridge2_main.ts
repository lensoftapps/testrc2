import { contextBridge, ipcMain, ipcRenderer } from "electron";
import * as electron from "electron";

export const test_bridge2_handle_signals = () => {
  

  ipcMain.on(
    "user:bridge2",
    (event: Electron.IpcMainEvent, data: undefined) => {
      console.log("[M] got bridge2 data:");
      console.log(data);
      event.reply("NaToWc", "This is some APP_STATE");
    }
  );
};
