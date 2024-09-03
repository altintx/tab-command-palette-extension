// listens for the keyboard shortcut for and opens the popup
chrome.commands.onCommand.addListener((command) => {
  if (command === "trigger-tab-list") {
    chrome.action.openPopup();
  }
});


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_INNER_TEXT') {
    console.log('Received innerText from content script:', message.text);

  }
});