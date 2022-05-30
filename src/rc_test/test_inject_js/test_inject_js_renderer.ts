import { ipcRenderer } from "electron";

export const test_send_signals_to_main = () => {
  const data = {
    field1: 'This is stats',
    field2: 'This is annotation',
  };
  console.log("[R] Sending data from WC to NA:");
  console.log(data);
  ipcRenderer.send("user:injectJS", data);
}