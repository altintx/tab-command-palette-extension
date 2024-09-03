// This is the entry point for the content script that gets injected
// in every page. My extension can't read the page, but this can grab
// the innerText of the body element and send it back to the
// background script.

// Get the innerText of the entire body element
const bodyText = document.body ? document.body.innerText : '';

// Send the innerText back to the background script
// This fails with a nothing to receive type error
//chrome.runtime.sendMessage({ type: 'GET_INNER_TEXT', text: bodyText });