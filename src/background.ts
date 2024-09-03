import { CmdShiftPAction } from "./types/command-shift-p-action";

// listens for the keyboard shortcut for and opens the popup
chrome.commands.onCommand.addListener((command) => {
  if (command === "trigger-tab-list") {
    chrome.action.openPopup();
  }
});


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
