import { CmdPDomContentReadyEvent } from "./types/events/after-page-load";
import { CmdPBeforeUnloadEvent } from "./types/events/before-unload-page";

// utility function to ensure proper typing
export function sendServerEvent<T = void>(event: CmdPBeforeUnloadEvent | CmdPDomContentReadyEvent) {
  return chrome.runtime.sendMessage(event) as T;
}
