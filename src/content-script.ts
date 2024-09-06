function sendPageUnloadMessage() {
  const message = {
    event: 'beforeunload'
  }
  chrome.runtime?.sendMessage(message);
}

// document.addEventListener('DOMContentLoaded', sendPageReadyMessage);
window.addEventListener('beforeunload', sendPageUnloadMessage);
const innerText = document.body.innerText;
const message = {
  page: {
    content: innerText, 
    title: document.title 
  }, 
  event: "domcontentready"
}
chrome.runtime.sendMessage(message);