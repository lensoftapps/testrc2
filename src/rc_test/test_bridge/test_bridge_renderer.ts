import { ipcRenderer } from "electron";

export const test_bridge_send_to_main = () => {
  const data = {
    field1: 'This is stats',
    field2: 'This is annotation',
  };
  console.log("[R] Sending data from WC to NA:");
  console.log(data);
  ipcRenderer.send("user:bridgeWcToNa", data);

  ipcRenderer.on("user:bridgeNaToWc", (event:Electron.IpcRendererEvent, data:undefined) => {
    console.log("[R] got data bridgeNaToWc:");
    console.log(data);
  });
}