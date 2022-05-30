
import { test_bridge_handle_signals } from "../test_bridge/test_bridge_main";
import { test_encrypt } from "../test_encrypt/encrypt_main";
import { test_handle_main_signals } from "../test_inject_js/test_inject_js_main";
import {test_protocol_registerPrivileged, test_protocol_registerBuffer} from "../test_protocol/test_protocol";
import { test_relogin } from "../test_relogin/test_relogin_main";
import { test_download_handle_session } from "../test_download_file/test_download_main";
import { test_bridge2_handle_signals } from "../test_bridge2/test_bridge2_main";

export enum TestSelectorMain {
    TS_PROTOCOL_REGISTER_PRIVILEGED = 1,
    TS_PROTOCOL_REGISTER_BUFFER,
    TS_INJECT_JS,
    TS_BRIDGE,
    TS_BRIDGE2,
    TS_RELOGIN,
    TS_ENCRYPT,
    TS_DOWNLOAD_FILE
  }

export const test_selector_execute_main = (ts: TestSelectorMain) => {
  switch (ts) {
    case TestSelectorMain.TS_PROTOCOL_REGISTER_PRIVILEGED: {
      test_protocol_registerPrivileged();
      break;
    }
    case TestSelectorMain.TS_PROTOCOL_REGISTER_BUFFER: {
      test_protocol_registerBuffer();
      break;
    }
    case TestSelectorMain.TS_INJECT_JS: {
      test_handle_main_signals();
      break;
    }
    case TestSelectorMain.TS_BRIDGE: {
      test_bridge_handle_signals();
      break;
    }
    case TestSelectorMain.TS_BRIDGE2: {
      test_bridge2_handle_signals();
      break;
    }
    case TestSelectorMain.TS_RELOGIN: {
      test_relogin();
      break;
    }
    case TestSelectorMain.TS_ENCRYPT: {
      test_encrypt();
      break;
    }
    case TestSelectorMain.TS_DOWNLOAD_FILE: {
        test_download_handle_session();
        break;
      }
    default: {
      //statements;
      break;
    }
  }
};
