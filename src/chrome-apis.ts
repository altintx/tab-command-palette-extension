import type { TabStore } from "./types/tab-state";
import Browser from "webextension-polyfill";
// augment page's innerText (from content script) with the page's URL
export async function getTabs(tabData: TabStore): Promise<(Browser.Tabs.Tab & { body: string })[]> {
  // background script maintains a list of tab contents
  const tabs = await Browser.tabs.query({});
  return (await Promise.all(tabs.map(async tab => {
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
}
