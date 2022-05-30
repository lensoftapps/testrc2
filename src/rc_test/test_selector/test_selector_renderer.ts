
import { test_bridge_send_to_main } from "../test_bridge/test_bridge_renderer";
import { test_send_signals_to_main } from "../test_inject_js/test_inject_js_renderer";
import { test_req_book_range } from "../test_protocol/test_req_book_range";
import { test_relogin_logout_to_browser } from "../test_relogin/test_relogin_renderer";
import {test_inject_js_to_active_tab, test_tabs_showTabs, test_tabs_showTabsLL} from "../test_tabs/test_tabs";

export enum TestSelectorRenderer {
    TS_SHOW_TABS = 1,
    TS_SHOW_TABS_LL,
    TS_INJECT_JS_TO_ACTIVE_TAB,
    TS_REQ_BOOK_RANGE,
    TS_JS_INJECT,
    TS_BRIDGE,
    TS_LOGOUT_TO_BROWSER
  }

export const test_selector_execute_renderer = (ts: TestSelectorRenderer, data?: any) => {
    switch(ts) { 
        case TestSelectorRenderer.TS_SHOW_TABS: { 
           test_tabs_showTabs();
           break; 
        } 
        case TestSelectorRenderer.TS_SHOW_TABS_LL: { 
           test_tabs_showTabsLL();
           break; 
        }
        case TestSelectorRenderer.TS_INJECT_JS_TO_ACTIVE_TAB: { 
           test_inject_js_to_active_tab();
           break; 
        }
        case TestSelectorRenderer.TS_REQ_BOOK_RANGE: { 
            test_req_book_range();
            break; 
        }
        case TestSelectorRenderer.TS_JS_INJECT: {
            test_send_signals_to_main();
            break; 
        }
        case TestSelectorRenderer.TS_BRIDGE: {
            test_bridge_send_to_main();
            break; 
        }
        case TestSelectorRenderer.TS_LOGOUT_TO_BROWSER: {
            test_relogin_logout_to_browser();
            break; 
        } 
        default: { 
           //statements; 
           break; 
        } 
     }
};