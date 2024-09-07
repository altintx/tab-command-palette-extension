import { CmdPDomContentReadyEvent } from "./types/events/after-page-load";
import { CmdPBeforeUnloadEvent } from "./types/events/before-unload-page";
import { QueryTabsEvent } from "./types/events/query-tabs";

// utility function to ensure proper typing
export function sendServerEvent(event: CmdPBeforeUnloadEvent | CmdPDomContentReadyEvent | QueryTabsEvent) {
  chrome.runtime.sendMessage(event);
}
