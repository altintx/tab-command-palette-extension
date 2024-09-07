import { afterPageLoadHandler } from "./server/after-page-load-handler";
import { beforeUnloadHandler } from "./server/before-unload-handler";
import { getHistoryHandler } from "./server/get-history-handler";
import { getTabsHandler } from "./server/get-tabs-handler";
import { HistoryEntry } from "./types/history";
import { TabStore } from "./types/tab-state";

let tabData: TabStore = {};
let history: HistoryEntry[] = [];
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.event === 'domcontentready') {
    afterPageLoadHandler({
      message,
      sender,
      tabData
    });    
  } else if (message.event === 'beforeunload') {
    beforeUnloadHandler({ message, sender, tabData, history });
  } else if (message.event === 'getTabs') {
    getTabsHandler({ message, sendResponse, tabData });
  } else if (message.event === "getHistory") {
    getHistoryHandler({ message, sendResponse, history });
  }
});

// listens for the keyboard shortcut for and opens the popup
chrome.commands.onCommand.addListener((command) => {
  if (command === "trigger-tab-list") {
    chrome.action.openPopup();
  }
});

function injectContentScript(tabId: number, url: string) {
  if (!url.startsWith("chrome://") && !url.includes("chrome.google.com/webstore")) {
      chrome.scripting.executeScript({
          target: { tabId: tabId },
          files: ['dist/content-script.js']
      }, () => {
          if (chrome.runtime.lastError) {
              console.error(`Failed to inject script into tab ${tabId}: ${chrome.runtime.lastError.message}`);
          }
      });
  } else {
      console.log(`Skipping script injection for tab ${tabId} with URL ${url}`);
  }
}

// When the extension is installed or updated
chrome.runtime.onInstalled.addListener(() => {
  // Query all open tabs
  chrome.tabs.query({}, (tabs) => {
      // Inject content script into each tab
      tabs.forEach((tab) => {
          tab.id && tab.url && injectContentScript(tab.id, tab.url);
      });
  });
});

// You can also re-inject content script when the extension's background script restarts
chrome.runtime.onStartup.addListener(() => {
  chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
          tab.id && tab.url && injectContentScript(tab.id, tab.url);
      });
  });
});