// contentScript.ts

// Get the innerText of the entire body element
const bodyText = document.body ? document.body.innerText : '';

// Send the innerText back to the background script
//chrome.runtime.sendMessage({ type: 'GET_INNER_TEXT', text: bodyText });