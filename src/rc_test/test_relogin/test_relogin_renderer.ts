import { ipcRenderer} from "electron";

export const test_relogin_logout_to_browser = () => {
  ipcRenderer.send("user:logout", null);
}