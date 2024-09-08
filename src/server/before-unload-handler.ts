import Browser from "webextension-polyfill";
import { saveHistoryToStorage } from "../history-storage";
import { HistoryEntry } from "../types/history";
import { TabStore } from "../types/tab-state";

// TODO: before unload is not neccessarily a close. this is wrong.
export function beforeUnloadHandler({ sender, tabData, history }: {
    sender: Browser.Runtime.MessageSender // only a type
    tabData: TabStore,
    history: HistoryEntry[]
}) {
  const windowId = sender.tab?.windowId?.toString(),
    tabId = sender.tab?.id?.toString(),
    now = new Date();
  if (!windowId || !tabId) {
    console.error("no windowId or tab id", sender);
    return
  };

  if (tabData[tabId]) {
    tabData[tabId].closedAt = now;
  }
  if(tabData[tabId] && sender.tab?.url) {
    const existingHistory = history.find(entry => entry.page.url === sender.tab?.url);
    if(existingHistory) {
      existingHistory.count++;
      existingHistory.updatedAt = now;
      existingHistory.closedAt = now;
    } else {
      history.push({
        page: {
          ...tabData[tabId]?.page
        },
        count: 1,
        createdAt: now,
        updatedAt: now
      });
    }
  }
  saveHistoryToStorage(history); // Regular save
  console.log("server says updated tabData to exclude %s %s %o", windowId, tabId, tabData);
}
