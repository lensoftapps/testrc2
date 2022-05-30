//import { EventTarget } from 'event-target-shim';

if (!document) {
  throw Error("electron-tabs module must be called in renderer process");
}

// Inject styles
(function () {
  const styles = `
    webview {
      position: absolute;
      visibility: hidden;
      width: 100%;
      height: 100%;
    }
    webview.visible {
      visibility: visible;
    }
  `;
  const styleTag = document.createElement("style");
  styleTag.innerHTML = styles;
  //document.getElementsByTagName("head")[0].appendChild(styleTag);
})();



/**
 * This makes the browser EventTarget API work similar to EventEmitter
 */
class EventEmitter extends EventTarget {
	public dispatchEvent: any;
	public addEventListener: any;

  emit (type:any, ...args:any) {
    //console.log("et-emit");
    this.dispatchEvent(new CustomEvent(type, { detail: args }));
  }

  on (type:any, fn:any) {
    //console.log("et-on");
    //this.addEventListener(type, (detail:any /*{ detail }*/) => fn.apply(this, detail));
    this.addEventListener(type, (e:any /*{ detail }*/) => fn.apply(this, e.detail));
  }

  once (type:any, fn:any) {
    //console.log("et-once");
    this.addEventListener(type, (e:any /*{ detail }*/) => fn.apply(this, e.detail), { once: true });
  }
}

export class TabGroupLL extends EventEmitter {
	public options: any;
	public tabContainer: any;
	public viewContainer: any;
	public tabs: any;
	public newTabId: any;

  constructor (args:any = {}) {
    super();
    const options = this.options = {
      tabContainerSelector: args.tabContainerSelector || ".etabs-tabs",
      buttonsContainerSelector: args.buttonsContainerSelector || ".etabs-buttons",
      viewContainerSelector: args.viewContainerSelector || ".etabs-views",
      tabClass: args.tabClass || "etabs-tab",
      viewClass: args.viewClass || "etabs-view",
      closeButtonText: args.closeButtonText || "&#215;",
      newTab: args.newTab,
      newTabButtonText: args.newTabButtonText || "&#65291;",
      visibilityThreshold: args.visibilityThreshold || 0,
      ready: args.ready
    };
    this.tabContainer = document.querySelector(options.tabContainerSelector);
    this.viewContainer = document.querySelector(options.viewContainerSelector);
    this.tabs = [];
    this.newTabId = 0;
    TabGroupPrivate.initNewTabButton.bind(this)();
    TabGroupPrivate.initVisibility.bind(this)();
    if (typeof this.options.ready === "function") {
      this.options.ready(this);
    }
  }

  addTab (args = this.options.newTab) {
    if (typeof args === "function") {
      args = args(this);
    }
    const id = this.newTabId;
    this.newTabId++;
    const tab = new Tab(this, id, args);
    this.tabs.push(tab);
    // Don't call tab.activate() before a tab is referenced in this.tabs
    if (args.active === true) {
      tab.activate();
    }
    this.emit("tab-added", tab, this);
    return tab;
  }

  getTab (id:any) {
    for (const i in this.tabs) {
      if (this.tabs[i].id === id) {
        return this.tabs[i];
      }
    }
    return null;
  }

  getTabByPosition (position:any) {
    const fromRight = position < 0;
    for (const i in this.tabs) {
      if (this.tabs[i].getPosition(fromRight) === position) {
        return this.tabs[i];
      }
    }
    return null;
  }

  getTabByRelPosition (position:any) {
    position = this.getActiveTab().getPosition() + position;
    if (position <= 0) {
      return null;
    }
    return this.getTabByPosition(position);
  }

  getNextTab () {
    return this.getTabByRelPosition(1);
  }

  getPreviousTab () {
    return this.getTabByRelPosition(-1);
  }

  getTabs () {
    return this.tabs.slice();
  }

  eachTab (fn:any) {
    this.getTabs().forEach(fn);
    return this;
  }

  getActiveTab () {
    if (this.tabs.length === 0) return null;
    return this.tabs[0];
  }
}

const TabGroupPrivate = {
  initNewTabButton: function () {
    if (!this.options.newTab) return;
    const container = document.querySelector(this.options.buttonsContainerSelector);
    const button = container.appendChild(document.createElement("button"));
    button.classList.add(`${this.options.tabClass}-button-new`);
    button.innerHTML = this.options.newTabButtonText;
    button.addEventListener("click", this.addTab.bind(this, undefined), false);
  },

  initVisibility: function () {
    function toggleTabsVisibility(tab:any, tabGroup:any) {
      const visibilityThreshold = this.options.visibilityThreshold;
      const el = tabGroup.tabContainer.parentNode;
      if (this.tabs.length >= visibilityThreshold) {
        el.classList.add("visible");
      } else {
        el.classList.remove("visible");
      }
    }

    this.on("tab-added", toggleTabsVisibility);
    this.on("tab-removed", toggleTabsVisibility);
  },

  removeTab: function (tab:any, triggerEvent:any) {
    const id = tab.id;
    for (const i in this.tabs) {
      if (this.tabs[i].id === id) {
        this.tabs.splice(i, 1);
        break;
      }
    }
    if (triggerEvent) {
      this.emit("tab-removed", tab, this);
    }
    return this;
  },

  setActiveTab: function (tab:any) {
    TabGroupPrivate.removeTab.bind(this)(tab);
    this.tabs.unshift(tab);
    this.emit("tab-active", tab, this);
    return this;
  },

  activateRecentTab: function (tab:any) {
    if (this.tabs.length > 0) {
      this.tabs[0].activate();
    }
    return this;
  }
};

class Tab extends EventEmitter {
	public tabGroup: any;
	public id: any;
	public title: any;
	public badge: any;
	public iconURL: any;
	public icon: any;
	public closable: any;
	public webviewAttributes: any;
	public tabElements: any;
	public isClosed: any;
	public tab: any;
	public webview: any;

  constructor (tabGroup:any, id:any, args:any) {
    super();
    this.tabGroup = tabGroup;
    this.id = id;
    this.title = args.title;
    this.badge = args.badge;
    this.iconURL = args.iconURL;
    this.icon = args.icon;
    this.closable = args.closable === false ? false : true;
    this.webviewAttributes = args.webviewAttributes || {};
    this.webviewAttributes.src = args.src;
    this.tabElements = {};
    TabPrivate.initTab.bind(this)();
    TabPrivate.initWebview.bind(this)();
    if (args.visible !== false) {
      this.show();
    }
    if (typeof args.ready === "function") {
      args.ready(this);
    }
  }

  setTitle (title:any) {
    if (this.isClosed) return;
    const span = this.tabElements.title;
    span.innerHTML = title;
    span.title = title;
    this.title = title;
    this.emit("title-changed", title, this);
    return this;
  }

  getTitle () {
    if (this.isClosed) return;
    return this.title;
  }

  setBadge (badge:any) {
    if (this.isClosed) return;
    const span = this.tabElements.badge;
    this.badge = badge;

    if (badge) {
      span.innerHTML = badge;
      span.classList.remove('hidden');
    } else {
      span.classList.add('hidden');
    }

    this.emit("badge-changed", badge, this);
  }

  getBadge () {
    if (this.isClosed) return;
    return this.badge;
  }

  setIcon (iconURL:any, icon:any) {
    if (this.isClosed) return;
    this.iconURL = iconURL;
    this.icon = icon;
    const span = this.tabElements.icon;
    if (iconURL) {
      span.innerHTML = `<img src="${iconURL}" />`;
      this.emit("icon-changed", iconURL, this);
    } else if (icon) {
      span.innerHTML = `<i class="${icon}"></i>`;
      this.emit("icon-changed", icon, this);
    }

    return this;
  }

  getIcon () {
    if (this.isClosed) return;
    if (this.iconURL) return this.iconURL;
    return this.icon;
  }

  setPosition (newPosition:any) {
    const tabContainer = this.tabGroup.tabContainer;
    const tabs = tabContainer.children;
    const oldPosition = this.getPosition() - 1;

    if (newPosition < 0) {
      newPosition += tabContainer.childElementCount;

      if (newPosition < 0) {
        newPosition = 0;
      }
    } else {
      if (newPosition > tabContainer.childElementCount) {
        newPosition = tabContainer.childElementCount;
      }

      // Make 1 be leftmost position
      newPosition--;
    }

    if (newPosition > oldPosition) {
      newPosition++;
    }

    tabContainer.insertBefore(tabs[oldPosition], tabs[newPosition]);

    return this;
  }

  getPosition (fromRight?:any) {
    let position = 0;
    let tab = this.tab;
    while ((tab = tab.previousSibling) != null) position++;

    if (fromRight === true) {
      position -= this.tabGroup.tabContainer.childElementCount;
    }

    if (position >= 0) {
      position++;
    }

    return position;
  }

  activate () {
    if (this.isClosed) return;
    const activeTab = this.tabGroup.getActiveTab();
    if (activeTab) {
      activeTab.tab.classList.remove("active");
      activeTab.webview.classList.remove("visible");
      activeTab.emit("inactive", activeTab);
    }
    TabGroupPrivate.setActiveTab.bind(this.tabGroup)(this);
    this.tab.classList.add("active");
    this.webview.classList.add("visible");
    this.webview.focus();
    this.emit("active", this);
    return this;
  }

  show (flag?:any) {
    if (this.isClosed) return;
    if (flag !== false) {
      this.tab.classList.add("visible");
      this.emit("visible", this);
    } else {
      this.tab.classList.remove("visible");
      this.emit("hidden", this);
    }
    return this;
  }

  hide () {
    return this.show(false);
  }

  flash (flag:any) {
    if (this.isClosed) return;
    if (flag !== false) {
      this.tab.classList.add("flash");
      this.emit("flash", this);
    } else {
      this.tab.classList.remove("flash");
      this.emit("unflash", this);
    }
    return this;
  }

  unflash () {
    return this.flash(false);
  }

  hasClass (classname:any) {
    return this.tab.classList.contains(classname);
  }

  close (force:any) {
    const abortController = new AbortController();
    const abort = () => abortController.abort();
    this.emit("closing", this, abort);

    const abortSignal = abortController.signal;
    if (this.isClosed || (!this.closable && !force) || abortSignal.aborted) return;

    this.isClosed = true;
    const tabGroup = this.tabGroup;
    tabGroup.tabContainer.removeChild(this.tab);
    tabGroup.viewContainer.removeChild(this.webview);
    const activeTab = this.tabGroup.getActiveTab();
    TabGroupPrivate.removeTab.bind(tabGroup)(this, true);

    this.emit("close", this);

    if (activeTab.id === this.id) {
      TabGroupPrivate.activateRecentTab.bind(tabGroup)();
    }
  }
}

const TabPrivate = {
  initTab: function () {
    const tabClass = this.tabGroup.options.tabClass;

    // Create tab element
    const tab = this.tab = document.createElement("div");
    tab.classList.add(tabClass);
    for (const el of ["icon", "title", "buttons", "badge"]) {
      const span = tab.appendChild(document.createElement("span"));
      span.classList.add(`${tabClass}-${el}`);
      this.tabElements[el] = span;
    }

    this.setTitle(this.title);
    this.setBadge(this.badge);
    this.setIcon(this.iconURL, this.icon);
    TabPrivate.initTabButtons.bind(this)();
    TabPrivate.initTabClickHandler.bind(this)();

    this.tabGroup.tabContainer.appendChild(this.tab);
  },

  initTabButtons: function () {
    const container = this.tabElements.buttons;
    const tabClass = this.tabGroup.options.tabClass;
    if (this.closable) {
      const button = container.appendChild(document.createElement("button"));
      button.classList.add(`${tabClass}-button-close`);
      button.innerHTML = this.tabGroup.options.closeButtonText;
      button.addEventListener("click", this.close.bind(this, false), false);
    }
  },

  initTabClickHandler: function () {
    // Mouse up
    const tabClickHandler = function (e:any) {
      if (this.isClosed) return;
      if (e.which === 2) {
        this.close();
      }
    };
    this.tab.addEventListener("mouseup", tabClickHandler.bind(this), false);
    // Mouse down
    const tabMouseDownHandler = function (e:any) {
      if (this.isClosed) return;
      if (e.which === 1) {
        if (e.target.matches("button")) return;
        this.activate();
      }
    };
    this.tab.addEventListener("mousedown", tabMouseDownHandler.bind(this), false);
  },

  initWebview: function () {
    const webview = this.webview = document.createElement("webview");

    const tabWebviewDidFinishLoadHandler = function (e:any) {
      this.emit("webview-ready", this);
    };

    this.webview.addEventListener("did-finish-load", tabWebviewDidFinishLoadHandler.bind(this), false);

    const tabWebviewDomReadyHandler = function (e:any) {
      // Remove this once https://github.com/electron/electron/issues/14474 is fixed
      webview.blur();
      webview.focus();
      this.emit("webview-dom-ready", this);
    };

    this.webview.addEventListener("dom-ready", tabWebviewDomReadyHandler.bind(this), false);

    this.webview.classList.add(this.tabGroup.options.viewClass);
    if (this.webviewAttributes) {
      const attrs = this.webviewAttributes;
      for (const key in attrs) {
        const attr = attrs[key];
        if (attr === false) continue;
        this.webview.setAttribute(key, attr);
      }
    }

    this.tabGroup.viewContainer.appendChild(this.webview);
  }
};

//module.exports = TabGroupLL;

