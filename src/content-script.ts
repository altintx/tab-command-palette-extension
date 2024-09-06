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
  if (!searchText) return;
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let firstNewNode: HTMLElement | null = null;
  for(let node = walker.nextNode(); node; node = walker.nextNode()) {
    const text = node.nodeValue;
    if (text && text.match(new RegExp(searchText, 'i'))) {
      const uniqId = crypto.randomUUID();
      const mark = document.createElement('mark');
      mark.id = uniqId;
      const textNode = document.createTextNode(text);
      mark.appendChild(textNode);
      const replaced = node.parentNode?.insertBefore(mark, node);
      node.parentNode?.removeChild(node);
      if(!firstNewNode && replaced) {
        firstNewNode = replaced;
      }
    }
  }
  firstNewNode?.scrollIntoView();
}

chrome.runtime.onMessage.addListener((message) => {
  if (message.event === 'findInPage') {
    highlightText(message.searchText);
  } else if (message.event === 'warmCache') {
    sendInnerText(document.body.innerText);
  }
});