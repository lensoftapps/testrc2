import { BrowserWindow } from "electron";
import CommonDataManager from "./CommonDataManager";

export const showProxyCredInput = (mainWindow: BrowserWindow) => {
  const cmgr = CommonDataManager.getInstance();
  const prompt = require("electron-prompt");

  prompt({
    title: "Proxy username",
    label: "Username:",
    value: cmgr.getProxyUserName(),
    inputAttrs: {
      type: "text",
    },
    type: "input",
    alwaysOnTop: true,
  })
    .then((r: any) => {
      if (r === null) {
        console.log("user cancelled");
      } else {
        console.log("result", r);
        cmgr.setProxyUserName(r);
        prompt({
          title: "Proxy password",
          label: "Password:",
          value: cmgr.getProxyPassword(),
          inputAttrs: {
            type: "text",
          },
          type: "input",
          alwaysOnTop: true,
        })
          .then((r: any) => {
            if (r === null) {
              console.log("user cancelled");
            } else {
              console.log("result", r);
              cmgr.setProxyPassword(r);
              //callback(proxyUserName, proxyPassword);
              if (mainWindow) mainWindow.reload();
            }
          })
          .catch(console.error);
      }
    })
    .catch(console.error);
};
