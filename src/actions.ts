import { getBookmarks, getTabs } from "./chrome-apis";
import { CmdShiftPAction } from "./command-shift-p-action";

export async function getActions({
  closePopup
}: {
  closePopup: () => void;
}): Promise<CmdShiftPAction[]> {
  const tabs = await getTabs();
  const bookmarks = await getBookmarks();

  const newActions: CmdShiftPAction[] = [];

  tabs.filter(tab => !!tab.id).forEach(tab => {
    const title = `Switch to tab: ${tab.title}`;
    newActions.push({
      title,
      description: title,
      type: "tab",
      action: function () {
        chrome.tabs.update(tab.id!, { active: true });
        chrome.windows.update(tab.windowId!, { focused: true });
        closePopup();
      }
    });
  });
  bookmarks.forEach(bookmark => {
    const title = `Open bookmark: ${bookmark.title}`;
    newActions.push({
      type: 'bookmark',
      title,
      description: title,
      action: function () {
        chrome.tabs.create({ url: bookmark.url });
        closePopup();
      }
    });
  });

  // Add action for opening a new tab
  newActions.push({
    type: 'system',
    title: 'Open new tab',
    description: "Creates a new tab to the configured homepage",
    action: function () {
      chrome.tabs.create({});
      closePopup();
    }
  });

  // Add action for closing the current tab
  newActions.push({
    type: 'system',
    title: 'Close current tab',
    description: "Closes the current tab",
    action: function () {
      chrome.tabs.query({ active: true, currentWindow: true }, function ([tab]) {
        if (tab.id)
          chrome.tabs.remove(tab.id);
        closePopup();
      });
    }
  });

  newActions.push({
    type: 'system',
    title: 'Close palette',
    description: "Close the palette without doing anything",
    action: function () {
      window.close();
    }
  });

  newActions.push({
    type: 'system',
    title: 'Open browser shortcut keys',
    description: "The browser defaults to control+P being print. Open the browser's shortcuts page to change this",
    action: function () {
      chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
      closePopup();
    }
  })

  newActions.push({
    type: 'system',
    title: 'Bookmark current page',
    description: "Add a bookmark for this page",
    action: function () {
      chrome.tabs.query({ active: true, currentWindow: true }, function ([tab]) {
        if (tab.id)
          chrome.bookmarks.create({ title: tab.title, url: tab.url });
      });
      closePopup();
    }
  })

  return newActions;
}