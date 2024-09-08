import Browser from "webextension-polyfill";
import { highlightText } from "./content-script/highlight-terms";
import { sendPageUnloadMessage } from "./content-script/page-unload";
import { sendInnerText } from "./content-script/send-inner-text";
import { FindInPageEvent } from "./types/events/find-in-page-event";

// dom event handlers
window.addEventListener('beforeunload', sendPageUnloadMessage);

// extension event handlers
Browser.runtime.onMessage.addListener((message: unknown) => {
  if (!(typeof message === 'object') || !message || !('event' in message)) {
    throw new Error("message is not an object");
  }
  if (message.event === 'findInPage') {
    const e = message as FindInPageEvent;
    highlightText(e.params.term);
  }
  return true;
});

//this script is already running @ dom content ready
sendInnerText(document);

