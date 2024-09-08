import { loadHistoryFromStorage, saveHistoryToStorage } from "./history-storage";
import { afterPageLoadHandler } from "./server/after-page-load-handler";
import { beforeUnloadHandler } from "./server/before-unload-handler";
import type { HistoryEntry } from "./types/history";
import type { TabStore } from "./types/tab-state";
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
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) => {
      // Inject content script into each tab
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
  suggest(chromeSuggestions);
});

// omnibox event listener for when a user selects a suggestion or presses Enter
chrome.omnibox.onInputEntered.addListener((input, disposition) => {
  const url = input.startsWith('http') ? input : `https://${input}`;

  // Search for an open tab with the same URL
  chrome.tabs.query({}, (tabs) => {
    const existingTab = tabs.find((tab) => tab.url && tab.url.includes(input));

    if (existingTab) {
      if (disposition === 'currentTab') {
        chrome.tabs.update(existingTab.id!, { active: true });
      } else {
        chrome.windows.create({ url });
      }
    } else {
      // Tab is not open, handle based on disposition
      if (disposition === 'currentTab') {
        // Open the URL in the current tab
        chrome.tabs.update({ url });
      } else {
        // Open the URL in a new window
        chrome.windows.create({ url });
      }
    }
  });
});