import { ipcMain, safeStorage } from "electron";
import * as electron from "electron";
import * as path from "path";
import * as fs from "fs";

export const test_encrypt = () => {
  const window = electron.BrowserWindow;

  ipcMain.on("user:save", (event: Electron.IpcMainEvent, data: undefined) => {
    saveData();
  });

  ipcMain.on("user:load", (event: Electron.IpcMainEvent, data: undefined) => {
    loadData();
  });
};

const saveData = () => {
  if(safeStorage.isEncryptionAvailable()){
    const buf:Buffer = safeStorage.encryptString("some data");
    fs.writeFile(__dirname + '/file.dat', buf, ()=>{}/* callback will go here */);
    console.log("saved to file.dat");
  }
}

const loadData = () => {
  console.log(__dirname);
  var stats = fs.statSync(__dirname + '/file.dat')
  var fileSizeInBytes = stats.size;
  let buf: Buffer = Buffer.alloc(fileSizeInBytes);
  const fd = fs.openSync(__dirname + '/file.dat', 'r');  
  fs.readSync(fd, buf);
  fs.closeSync(fd);
  if(safeStorage.isEncryptionAvailable()){
    //console.log(buf);
    const str = safeStorage.decryptString(buf);
    console.log("read: " + str);
  }
}