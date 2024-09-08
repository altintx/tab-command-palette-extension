import { loadHistoryFromStorage, saveHistoryToStorage } from "./history-storage";
import { afterPageLoadHandler } from "./server/after-page-load-handler";
import { beforeUnloadHandler } from "./server/before-unload-handler";
import type { HistoryEntry } from "./types/history";
import type { TabStore } from "./types/tab-state";
import { getActions, lunrActionsIndex } from "./actions";
import { FindInPageEvent } from "./types/events/find-in-page-event";
import Browser from "webextension-polyfill";
import { CmdPDomContentReadyEvent } from "./types/events/after-page-load";

let tabData: TabStore = {};
let history: HistoryEntry[] = [];

Browser.runtime.onMessage.addListener((message, sender) => {
  if(!(typeof message === 'object') || !message || !('event' in message)) {
    throw new Error("message is not an object");
  }
  if (message.event === 'domcontentready') {
    afterPageLoadHandler({
      message: message as CmdPDomContentReadyEvent,
      sender,
      tabData,
      history,
    });    
  } else if (message.event === 'beforeunload') {
    beforeUnloadHandler({ sender, tabData, history });
  }
  return true;
});

async function injectContentScript(tabId: number, url: string) {
  if (!url.startsWith("chrome://") && !url.includes("extensionHost.google.com/webstore")) {
      await Browser.scripting.executeScript({
          target: { tabId: tabId },
          files: ['dist/content-script.js']
      });
      if (Browser.runtime.lastError) {
        console.error(`Failed to inject script into tab ${tabId}: ${Browser.runtime.lastError.message}`);
    }
  } else {
      console.log(`Skipping script injection for tab ${tabId} with URL ${url}`);
  }
}

// When the extension is installed or updated
Browser.runtime.onInstalled.addListener(async () => {
  const tabs = await Browser.tabs.query({});
  tabs.forEach((tab) => {
    // Inject content script into each tab
    tab.id && tab.url && injectContentScript(tab.id, tab.url);
  });
});

// You can also re-inject content script when the extension's background script restarts
Browser.runtime.onStartup.addListener(async () => {
  loadHistoryFromStorage((loadedHistory) => {
    history = loadedHistory;
  });
  const tabs = await Browser.tabs.query({});
  tabs.forEach((tab) => {
    tab.id && tab.url && injectContentScript(tab.id, tab.url);
  });
});
Browser.runtime.onSuspend.addListener(() => {
  saveHistoryToStorage(history);
});

let search = "";

const newTabs: Browser.Tabs.Tab[] = [];

// omnibox event listener for input changes (provide suggestions)
Browser.omnibox.onInputChanged.addListener(async (input, suggest) => {
  search = input;
  const allActions = await getActions({
    search: input,
    tabData,
    history
  })
  const actions = lunrActionsIndex(allActions);
  const matches = actions.search(input);
  const suggestions = matches.map(({ ref }) => allActions.find(action => action.url === ref)!);
  const chromeSuggestions = suggestions.map((suggestion): Browser.Omnibox.SuggestResult => ({
    content: suggestion.url ?? "",
    deletable: false,
    description: suggestion.title
  }));
  suggest(chromeSuggestions);
});

function highlightInPage(tab: Browser.Tabs.Tab, search: string) {
  try {
    Browser.tabs.sendMessage(tab.id!, { event: 'findInPage', params: { term: search } } satisfies FindInPageEvent);
  } catch (e) {
    console.error(`Failed to highlight in page: ${e}`, Browser.runtime.lastError?.message);
  }
}

// omnibox event listener for when a user selects a suggestion or presses Enter
Browser.omnibox.onInputEntered.addListener(async (input, disposition) => {
  console.info("cmdp special behavior starting");
  const url = input.startsWith('http') ? input : `https://${input}`;
  // Search for an open tab with the same URL
  const tabs = await Browser.tabs.query({});
  const currentTab = tabs.find((tab) => tab.active);
  const existingTab = tabs.find((tab) => tab.url && tab.url.includes(input));
  console.info("is there an existing tab for the page being loaded? it is", existingTab);
  const highlightCallback = (tab: Browser.Tabs.Tab | undefined) => {
    tab && highlightInPage(tab, search);
  };

  // Detect if the current tab is the "New Tab" page (chrome://newtab/)
  console.info("what is the current tab?", currentTab);
  const currentTabIsNewTab = currentTab?.url === 'chrome://newtab/';
  console.info("am i sitting at a new tab page?", currentTabIsNewTab);


  // Check if we found an existing tab with the same URL
  if (existingTab) {
    if (disposition === 'currentTab') {
      // Switch to the existing tab and close the current (new tab) if necessary
      console.info("switching to existing tab");
      const newTab = await Browser.tabs.update(existingTab.id!, { active: true });
      highlightCallback(newTab);
    } else {
      // If current tab is not a real page, load the new URL in the same tab
      const newTab = await Browser.tabs.create({ url });
      highlightCallback(newTab);
      console.info("creating new tab");
    }
  } else {
    if(currentTab) {
      console.info("create new tab");
      const newTab = await Browser.tabs.create({ url });
      highlightCallback(newTab);
    } else {
      // Tab is not already open, handle based on disposition
      const newTab = await Browser.tabs.update({ url });
      highlightCallback(newTab);
      console.info("updating tab");
    }
  }
});


Browser.commands.onCommand.addListener((command) => {
  Browser.notifications.create({
    type: 'basic',
    iconUrl: 'assets/src/assets/icon128.png',
    title: 'Press Command/Control L to focus the address bar',
    message: `Start your search with a > character`,
  });
});