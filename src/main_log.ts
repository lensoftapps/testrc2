import { BrowserWindow } from "electron";
import * as log from "electron-log";

// Log both at dev console and at running node console instance
export const logEverywhere = (s: string, mainWindow: BrowserWindow) => {
  try{
    console.log(s)
    if (mainWindow && mainWindow.webContents) {
        mainWindow.webContents.executeJavaScript(`console.log("${s}")`)
    }
  }
  catch(e) {}
}

export const logToFile = (s: string) => {
  log.transports.console.format = '{h}:{i}:{s} {text}';
  log.transports.file.resolvePath = () => process.platform === "darwin" ? "/Users/dlreader10/Documents/tmp/app_log.txt" :  "C:\\tmp\\1\\app_log.txt"; //path.join(APP_DATA, 'logs/main.log');
  log.info(s);
}