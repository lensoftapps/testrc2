import * as TabGroup from "electron-tabs";
import { Tab } from "electron-tabs";
import { TabGroupLL } from "./eltabs"; // to use this class, add "target": "ES2017" in tsconfig
                // probably TabGroupLL won't be working properly without installed electron-tabs

const insertHtml = () => {
  const element1 = document.getElementsByTagName("head");
  if (element1) {
    element1[0].innerHTML += 
    "<link rel=\"stylesheet\" href=\"./src/rc_test/test_tabs/electron-tabs.css\">";
  };
  
  const element2 = document.getElementById("main_div");
  if (element2) {
    element2.innerHTML = 
    "<div class=\"etabs-tabgroup\">\
      <div class=\"etabs-tabs\"></div>\
      <div class=\"etabs-buttons\"></div>\
    </div>\
    <div class=\"etabs-views\"></div>";
  };    
}     

let tabGroup: TabGroup | TabGroupLL;

export const test_tabs_showTabs = () => {
  insertHtml();
    tabGroup = new TabGroup({
        /*newTab: {
          title: 'New Tab'
        }*/
      });
    tabGroup.addTab({
        title: 'Google',
        src: 'http://google.com',
        visible: true
      });
      const tabSO = tabGroup.addTab({
        title: 'SO',
        src: 'https://stackoverflow.com',
        visible: true
      });
      tabSO.activate();
      //tabSO.show(true);
}

export const test_tabs_showTabsLL = () => {
  insertHtml();
    tabGroup = new TabGroupLL({
        /*newTab: {
          title: 'New Tab'
        }*/
      });
    tabGroup.addTab({
        title: 'Google',
        src: 'http://google.com',
        visible: true
      });
      const tabSO = tabGroup.addTab({
        title: 'SO',
        src: 'https://stackoverflow.com',
        visible: true
      });
      tabSO.activate();
      //tabSO.show(true);
}

export const test_inject_js_to_active_tab = () => {
  //console.log(tabGroup);
  const tab: Tab = tabGroup.getActiveTab();
  let webview = tab.webview;
  //console.log(webview);
  webview.executeJavaScript('alert(document.title);');
}