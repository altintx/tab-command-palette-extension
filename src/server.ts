import { CmdPDomContentReadyEvent } from "./types/events/after-page-load";
import { CmdPBeforeUnloadEvent } from "./types/events/before-unload-page";

// utility function to ensure proper typing
export async function sendServerEvent<T = void>(event: CmdPBeforeUnloadEvent | CmdPDomContentReadyEvent) {
  try {
    return await chrome.runtime.sendMessage(event) as T;
  } catch (e) {
    console.error("Failed to send message to server", e, chrome.runtime.lastError?.message);
  }
}
