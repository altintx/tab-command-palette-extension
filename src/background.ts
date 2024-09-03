import { CmdShiftPAction } from "./types/command-shift-p-action";

// listens for the keyboard shortcut for and opens the popup
chrome.commands.onCommand.addListener((command) => {
  if (command === "trigger-tab-list") {
    chrome.action.openPopup();
  }
});


// This is a cache of the available actions the
// last time we ran. They may not be legit anymore,
// say, a user may have closed a tab so it's no
// longer available. But it save a a tenth of a 
// second on the FCP
const actions: CmdShiftPAction[] = [];
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.type === "getActions") {
    sendResponse(actions);
  }
});

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.type === "setActions") {
    actions.splice(0, actions.length, ...message.actions);
  }
});
