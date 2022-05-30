// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process unless
// nodeIntegration is set to true in webPreferences.
// Use preload.js to selectively enable features
// needed in the renderer process.

import { ipcRenderer, shell } from "electron";
import {TestSelectorRenderer, test_selector_execute_renderer} from "./rc_test/test_selector/test_selector_renderer";

/*document.body.addEventListener('click', () => {
    //console.log('hello vscode!')    
});*/

document.getElementById("button-wc-to-na").addEventListener("click", sendDataFromWcToNa);

function sendDataFromWcToNa(){    
    //test_selector_execute_renderer(TestSelectorRenderer.TS_JS_INJECT);
    //test_selector_execute_renderer(TestSelectorRenderer.TS_BRIDGE);
    //test_selector_execute_renderer(TestSelectorRenderer.TS_INJECT_JS_TO_ACTIVE_TAB);
    //test_selector_execute_renderer(TestSelectorRenderer.TS_LOGOUT_TO_BROWSER);
    //require("shell").openExternal("http://www.google.com");
    shell.openExternal("http://www.google.com"); // open in the default browser
}

//test_selector_execute_renderer(TestSelectorRenderer.TS_SHOW_TABS_LL);
//test_selector_execute_renderer(TestSelectorRenderer.TS_REQ_BOOK_RANGE);
//test_selector_execute_renderer(TestSelectorRenderer.TS_RELOGIN_DRAW_TABS);

