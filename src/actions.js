export async function getTabs() {
  return new Promise((resolve) => {
      chrome.tabs.query({}, function(tabs) {
          resolve(tabs);
      });
  });
}

export async function getBookmarks() {
  return new Promise((resolve) => {
      chrome.bookmarks.getTree(function(bookmarkTreeNodes) {
          let bookmarks = [];
          bookmarkTreeNodes.forEach(function(node) {
              extractBookmarks(node, bookmarks);
          });
          resolve(bookmarks);
      });
  });
}

function extractBookmarks(node, bookmarks) {
  if (node.children) {
      node.children.forEach(child => extractBookmarks(child, bookmarks));
  } else {
      bookmarks.push({ title: node.title, url: node.url });
  }
}
