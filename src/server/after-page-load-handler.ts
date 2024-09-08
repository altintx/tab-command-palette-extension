import Browser from "webextension-polyfill";
import { CmdPDomContentReadyEvent } from "../types/events/after-page-load";
import { HistoryEntry } from "../types/history";
import { TabStore } from "../types/tab-state";

export function afterPageLoadHandler({
  message,
  sender,
  tabData,
  history,
}: {
  message: CmdPDomContentReadyEvent, 
  sender: Browser.Runtime.MessageSender, // only a type
  tabData: TabStore,
  history: HistoryEntry[],
}) {
  const windowId = sender.tab?.windowId?.toString(),
    tabId = sender.tab?.id?.toString(),
    now = new Date(),
    page = message.params.page;
  if (!windowId || !tabId) {
    console.error("no windowId or tab id", sender);
    return
  };
  tabData[tabId] = {
    createdAt: tabData[tabId]?.createdAt ?? now,
    updatedAt: now,
    page: {
      content: page.content ?? '',
      title: page.title ?? '',
      url: sender.tab?.url ?? '',
    },
    tabId: tabId,
    windowId: windowId,
  }
  const existingHistory = history.find(entry => entry.page.url === sender.tab?.url);
  if(existingHistory) {
    existingHistory.count++;
    existingHistory.updatedAt = now;
    delete existingHistory.closedAt;
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
