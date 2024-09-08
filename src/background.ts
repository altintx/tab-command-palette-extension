import { loadHistoryFromStorage, saveHistoryToStorage } from "./history-storage";
import { afterPageLoadHandler } from "./server/after-page-load-handler";
import { beforeUnloadHandler } from "./server/before-unload-handler";
import { getHistoryHandler } from "./server/get-history-handler";
import { getTabsHandler } from "./server/get-tabs-handler";
import { HistoryEntry } from "./types/history";
import { TabStore } from "./types/tab-state";
import { getActions, lunrActionsIndex } from "./actions";

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
    getHistoryHandler({ message, history });
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
  loadHistoryFromStorage((loadedHistory) => {
    history = loadedHistory;
  });
  chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
          tab.id && tab.url && injectContentScript(tab.id, tab.url);
      });
  });
});
chrome.runtime.onSuspend.addListener(() => {
  saveHistoryToStorage(history);
});


// omnibox event listener for input changes (provide suggestions)
chrome.omnibox.onInputChanged.addListener(async (input, suggest) => {
  console.log("onInputChanged", input);
  const allActions = await getActions({
    search: input,
    tabData,
    history
  })
  const actions = lunrActionsIndex(allActions);
  const matches = actions.search(input);
  const suggestions = matches.map(({ ref }) => allActions.find(action => action.url === ref)!);
  const chromeSuggestions = suggestions.map((suggestion): chrome.omnibox.SuggestResult => ({
    content: suggestion.url ?? "",
    deletable: false,
    description: suggestion.title
  }));
  // Provide the suggestions to the user
  console.log("suggesting", chromeSuggestions);
  suggest(chromeSuggestions);
});

// omnibox event listener for when a user selects a suggestion or presses Enter
chrome.omnibox.onInputEntered.addListener((input, disposition) => {
  console.log("onInputEntered", input, disposition);
  const url = input.startsWith('http') ? input : `https://${input}`;

  // Search for an open tab with the same URL
  chrome.tabs.query({}, (tabs) => {
    const existingTab = tabs.find((tab) => tab.url && tab.url.includes(input));

    if (existingTab) {
      // Tab is already open, handle based on disposition
      if (disposition === 'currentTab') {
        // User wants to open it in the current tab
        chrome.tabs.update(existingTab.id!, { active: true });
      } else if (disposition === 'newForegroundTab') {
        // User wants to open it in a new tab
        chrome.tabs.create({ url });
      } else if (disposition === 'newBackgroundTab') {
        // User wants to open it in a new window
        chrome.windows.create({ url });
      }
    } else {
      // Tab is not open, handle based on disposition
      if (disposition === 'currentTab') {
        // Open the URL in the current tab
        chrome.tabs.update({ url });
      } else if (disposition === 'newForegroundTab') {
        // Open the URL in a new tab
        chrome.tabs.create({ url });
      } else if (disposition === 'newBackgroundTab') {
        // Open the URL in a new window
        chrome.windows.create({ url });
      }
    }
  });
});