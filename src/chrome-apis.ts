import { Bookmark } from "./bookmark";

export async function getTabs(): Promise<chrome.tabs.Tab[]> {
  return new Promise((resolve) => {
      chrome.tabs.query({}, function(tabs) {
          resolve(tabs);
      });
  });
}

export async function getBookmarks(): Promise<Bookmark[]> {
  return new Promise((resolve) => {
      chrome.bookmarks.getTree(function(bookmarkTreeNodes) {
          let bookmarks: Bookmark[] = [];
          bookmarkTreeNodes.forEach(function(node) {
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
