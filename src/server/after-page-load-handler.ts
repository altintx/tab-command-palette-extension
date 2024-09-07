import { CmdPDomContentReadyEvent } from "../types/events/after-page-load";
import { TabStore } from "../types/tab-state";

export function afterPageLoadHandler({
  message,
  sender,
  tabData
}: {
  message: CmdPDomContentReadyEvent, 
  sender: chrome.runtime.MessageSender,
  tabData: TabStore
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
  console.info("server says updated tabData", tabData);
}
