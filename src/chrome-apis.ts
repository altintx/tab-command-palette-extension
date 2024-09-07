import { Bookmark } from "./types/bookmark";
import { TabStore } from "./types/tab-state";

export function getTabs(): Promise<(chrome.tabs.Tab & { body: string })[]> {
  // background script maintains a list of tab contents
  const centralizedDataStore: Promise<TabStore>  = chrome.runtime.sendMessage({ event: "getTabs" });
      
  return new Promise((resolve) => {
    chrome.tabs.query({}, async function (tabs) {
      const tabData = await centralizedDataStore;
      resolve(await Promise.all(tabs.map(async tab => {
        let body = "";
        let url = null;
        if(tab.id) {
          body = tabData[tab.id.toString()]?.page.content ?? "";
          url = tabData[tab.id.toString()]?.page.url ?? null;
        }
        return {
          ...tab,
          body,
        }
      })));
    });
  });
}

// Get all the user's bookmarks
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

// flatten the bookmark tree into a list of bookmarks
function extractBookmarks(node: chrome.bookmarks.BookmarkTreeNode, bookmarks: Bookmark[]) {
  if (node.children) {
    node.children.forEach(child => extractBookmarks(child, bookmarks));
  } else if (node.url) {
    bookmarks.push({ title: node.title, url: node.url, id: node.id });
  }
}
