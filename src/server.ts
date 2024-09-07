import { CmdPDomContentReadyEvent } from "./types/events/after-page-load";
import { CmdPBeforeUnloadEvent } from "./types/events/before-unload-page";
import { GetHistory } from "./types/events/get-history";
import { QueryTabsEvent } from "./types/events/query-tabs";

// utility function to ensure proper typing
export function sendServerEvent<T = void>(event: CmdPBeforeUnloadEvent | CmdPDomContentReadyEvent | QueryTabsEvent | GetHistory) {
  return chrome.runtime.sendMessage(event) as T;
}
