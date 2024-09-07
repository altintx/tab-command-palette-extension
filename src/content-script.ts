import { highlightText } from "./content-script/highlight-terms";
import { sendPageUnloadMessage } from "./content-script/page-unload";
import { sendInnerText } from "./content-script/send-inner-text";
import { ContentScriptEvent } from "./types/event";
import { FindInPageEvent } from "./types/events/find-in-page-event";
import { WarmCacheEvent } from "./types/events/warm-cache-event";

// dom event handlers
window.addEventListener('beforeunload', sendPageUnloadMessage);

// extension event handlers
chrome.runtime.onMessage.addListener((message: FindInPageEvent | WarmCacheEvent) => {
  if (message.event === 'findInPage') {
    const e = message as FindInPageEvent;
    highlightText(e.params.term);
  } else if (message.event === 'warmCache') {
    sendInnerText(document);
  }
});

//this script is already running @ dom content ready
sendInnerText(document);

