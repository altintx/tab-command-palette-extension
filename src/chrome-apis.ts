import { Bookmark } from "./bookmark";

export async function getTabs(): Promise<(chrome.tabs.Tab & { innerText: string })[]> {
  return new Promise((resolve) => {
    chrome.tabs.query({}, async function (tabs) {
      resolve(await Promise.all(tabs.map(async tab => {
        try {
          if(tab.url?.startsWith("http"))
            return {
              ...tab,
              innerText: ''
              // innerText: await getInnerTextFromTab(tab.id!)
            }
          else
            return {
              ...tab,
              innerText: ''
            }
        } catch (e) {
          console.error(e);
          return {
            ...tab,
            innerText: ''
          }
        }
      })));
    });
  });
}

export async function getBookmarks(): Promise<Bookmark[]> {
  return new Promise((resolve) => {
    chrome.bookmarks.getTree(function (bookmarkTreeNodes) {
      let bookmarks: Bookmark[] = [];
      bookmarkTreeNodes.forEach(function (node) {
        extractBookmarks(node, bookmarks);
      });
      resolve(bookmarks);
    });
  });
}

function extractBookmarks(node: chrome.bookmarks.BookmarkTreeNode, bookmarks: Bookmark[]) {
  if (node.children) {
    node.children.forEach(child => extractBookmarks(child, bookmarks));
  } else if (node.url) {
    bookmarks.push({ title: node.title, url: node.url });
  }
}

function getInnerTextFromTab(tabId: number): Promise<string> {
  return new Promise((resolve, reject) => {
    // Inject the content script into the specified tab
    chrome.scripting.executeScript(
      {
        target: { tabId },
        files: ['dist/content-script.js']
      },
      () => {
        // Listen for the message from the content script
        chrome.runtime.onMessage.addListener(function listener(message, sender) {
          if (message.type === 'GET_INNER_TEXT' && sender.tab && sender.tab.id === tabId) {
            chrome.runtime.onMessage.removeListener(listener); // Clean up the listener
            resolve(message.text);
          }
        });
      }
    );
  });
}