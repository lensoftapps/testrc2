import { ipcMain } from "electron";
import * as electron from "electron";
import * as path from "path";
import CommonDataManager from "../test_common_data/test_common_data_mgr";

export const test_relogin = () => {
  const window = electron.BrowserWindow;

  ipcMain.on("user:logout", (event: Electron.IpcMainEvent, data: undefined) => {
    const focusedWindow = window.getFocusedWindow();
    //focusedWindow.reload();
    //focusedWindow.webContents.session.clearStorageData();
    focusedWindow.loadFile(
      path.join(__dirname, "../../../src/rc_test/test_relogin/login_view.html")
    );

    //app.setPath ('userData', "C:/tmp/1"); // change cache path
  });

  ipcMain.on("user:login", (event: Electron.IpcMainEvent, data: undefined) => {
    let cmgr = CommonDataManager.getInstance();
    let userId = cmgr.getUserID();
    if (userId.length === 0) userId = "1";
    else if (userId === "1") userId = "2";
    else if (userId === "2") userId = "1";
    cmgr.setUserID(userId);
    console.log("userId=" + userId);

    //console.log(__dirname);
    const focusedWindow = window.getFocusedWindow();
    focusedWindow.loadFile(
      path.join(
        __dirname,
        "../../../src/rc_test/test_relogin/browser_view.html"
      )
    );
  });

  ipcMain.on("getUserData", (event: Electron.IpcMainEvent, data: undefined) => {
    let cmgr = CommonDataManager.getInstance();
    let userId = cmgr.getUserID();
    console.log("uid=" + userId);
    event.reply("returnUserData", userId);
  });
};
