import { Bookmark } from "./types/bookmark";

export async function getTabs(): Promise<(chrome.tabs.Tab & { innerText: string })[]> {
  return new Promise((resolve) => {
    chrome.tabs.query({}, async function (tabs) {
      resolve(await Promise.all(tabs.map(async tab => {
        return {
          ...tab,
          innerText: '' // await getInnerTextFromTab(tab.id!)
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
    bookmarks.push({ title: node.title, url: node.url });
  }
}
