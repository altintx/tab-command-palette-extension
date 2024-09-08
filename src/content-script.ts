import { highlightText } from "./content-script/highlight-terms";
import { sendPageUnloadMessage } from "./content-script/page-unload";
import { sendInnerText } from "./content-script/send-inner-text";
import { FindInPageEvent } from "./types/events/find-in-page-event";

// dom event handlers
window.addEventListener('beforeunload', sendPageUnloadMessage);

// extension event handlers
chrome.runtime.onMessage.addListener((message: FindInPageEvent) => {
  if (message.event === 'findInPage') {
    const e = message as FindInPageEvent;
    highlightText(e.params.term);
  }
});

//this script is already running @ dom content ready
sendInnerText(document);

