import { CmdPDomContentReadyEvent, CmdPEvent, Page, TabId, TabStore, WindowId } from "./types/messages";

let tabData: TabStore = {};

chrome.runtime.onMessage.addListener((message: CmdPEvent, sender, sendResponse) => {
  if (message.event === 'domcontentready') {
    const windowId = sender.tab?.windowId?.toString(),
      tabId = sender.tab?.id?.toString();
    if (!windowId || !tabId) {
      console.error("no windowId or tab id", sender);
      return
    };
    const { page } = message as CmdPDomContentReadyEvent;
    const persistedData = {
      content: page.content ?? '',
      title: page.title ?? ''
    };
    tabData[tabId] = {
      ...persistedData,
      windowId
    }
    console.log("server says updated tabData", tabData);
  } else if (message.event === 'beforeunload') {
    const windowId = sender.tab?.windowId?.toString(),
      tabId = sender.tab?.id?.toString();
    if (!windowId || !tabId) {
      console.error("no windowId or tab id", sender);
      return
    };

    if (tabData[tabId]) {
      delete tabData[tabId];
    }
    console.log("server says updated tabData to exclude %s %s %o", windowId, tabId, tabData);
  } else if (message.event === 'getTabs') {
    console.log("server says sending tabData", tabData);
    sendResponse(tabData);
  }
});

// listens for the keyboard shortcut for and opens the popup
chrome.commands.onCommand.addListener((command) => {
  if (command === "trigger-tab-list") {
    chrome.action.openPopup();
  }
});

// doesn't work
// chrome.runtime.sendMessage({ event: 'warmCache' });