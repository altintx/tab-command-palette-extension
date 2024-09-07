import { CmdPBeforeUnloadEvent } from "../types/events/before-unload-page";
import { TabStore } from "../types/tab-state";

// TODO: before unload is not neccessarily a close. this is wrong.
export function beforeUnloadHandler({ message, sender, tabData }: {
    message: CmdPBeforeUnloadEvent, 
    sender: chrome.runtime.MessageSender
    tabData: TabStore
}) {
  const windowId = sender.tab?.windowId?.toString(),
    tabId = sender.tab?.id?.toString();
  if (!windowId || !tabId) {
    console.error("no windowId or tab id", sender);
    return
  };

  if (tabData[tabId]) {
    tabData[tabId].closedAt = new Date();
  }
  console.log("server says updated tabData to exclude %s %s %o", windowId, tabId, tabData);
}
