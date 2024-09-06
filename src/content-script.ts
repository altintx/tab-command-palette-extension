function sendPageUnloadMessage() {
  const message = {
    event: 'beforeunload'
  }
  chrome.runtime?.sendMessage(message);
}

// document.addEventListener('DOMContentLoaded', sendPageReadyMessage);
window.addEventListener('beforeunload', sendPageUnloadMessage);
function sendInnerText(innerText: string) {
  const message = {
    page: {
      content: innerText,
      title: document.title
    },
    event: "domcontentready"
  }
  chrome.runtime.sendMessage(message);

}
const innerText = document.body.innerText;
sendInnerText(innerText);
// find_in_page.js
function highlightText(searchText: string) {
  const uniqId = crypto.randomUUID();
  if (!searchText) return;

  const bodyText = document.body.innerHTML;
  const regex = new RegExp(`(${searchText})`, 'gi');
  const newBodyText = bodyText.replace(regex, '<mark id=\"' + uniqId + '\">$1</mark>'); // Wrap matches in <mark> for highlighting
  document.body.innerHTML = newBodyText;
  document.getElementById(uniqId)?.scrollIntoView();
}

chrome.runtime.onMessage.addListener((message) => {
  if (message.event === 'findInPage') {
    highlightText(message.searchText);
  } else if (message.event === 'warmCache') {
    sendInnerText(document.body.innerText);
  }
});