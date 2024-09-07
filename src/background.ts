import { afterPageLoadHandler } from "./server/after-page-load-handler";
import { beforeUnloadHandler } from "./server/before-unload-handler";
import { getTabsHandler } from "./server/get-tabs-handler";
import { TabStore } from "./types/tab-state";

let tabData: TabStore = {};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.event === 'domcontentready') {
    afterPageLoadHandler({
      message,
      sender,
      tabData
    });    
  } else if (message.event === 'beforeunload') {
    beforeUnloadHandler({ message, sender, tabData });
  } else if (message.event === 'getTabs') {
    getTabsHandler({ message, sendResponse, tabData });
  }
});

// listens for the keyboard shortcut for and opens the popup
chrome.commands.onCommand.addListener((command) => {
  if (command === "trigger-tab-list") {
    chrome.action.openPopup();
  }
});

// wait 5 seconds before warming the cache
try {
  chrome.runtime.sendMessage({ event: 'warmCache' });
} catch (e) {
  console.error("error warming cache", e);
}