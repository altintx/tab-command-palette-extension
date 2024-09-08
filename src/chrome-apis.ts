import type { TabStore } from "./types/tab-state";

// augment page's innerText (from content script) with the page's URL
export function getTabs(tabData: TabStore): Promise<(chrome.tabs.Tab & { body: string })[]> {
  // background script maintains a list of tab contents
  const centralizedDataStore: Promise<TabStore> = new Promise((d) => d(tabData));
      
  return new Promise((resolve) => {
    chrome.tabs.query({}, async function (tabs) {
      const tabData = await centralizedDataStore;
      resolve(await Promise.all(tabs.map(async tab => {
        let body = "";
        let url = null;
        if(tab.id) {
          body = tabData[tab.id.toString()]?.page.content ?? "";
          url = tabData[tab.id.toString()]?.page.url ?? null;
        }
        return {
          ...tab,
          body,
        }
      })));
    });
  });
}
