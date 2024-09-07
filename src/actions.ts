import { v4 as uuidv4 } from 'uuid';
import { getBookmarks, getTabs } from "./chrome-apis";
import { CmdShiftPAction } from "./types/command-shift-p-action";
import lunr from "lunr";
import { FindInPageEvent } from './types/events/find-in-page-event';
import { GoBookmarkSlash, GoDuplicate, GoFileCode } from 'react-icons/go';

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
    const description = tab.body;
    newActions.push({
      id: uuidv4(),
      title,
      description,
      icon: "tab",
      onHighlight: function(searchText:string) {
        chrome.tabs.sendMessage(tab.id!, { event: 'findInPage', params: { term: searchText } } satisfies FindInPageEvent);
      },
      action: function () {
        chrome.tabs.update(tab.id!, { active: true });
        chrome.windows.update(tab.windowId!, { focused: true });
        closePopup();
      },
      managementActions: []
    });
  });
  bookmarks.forEach(bookmark => {
    const title = `Open bookmark: ${bookmark.title}`;
    newActions.push({
      id: uuidv4(),
      icon: 'bookmark',
      title,
      description: title,
      action: function () {
        chrome.tabs.create({ url: bookmark.url });
        closePopup();
      },
      managementActions: [[GoBookmarkSlash, { title: "Remove bookmark"}, function (action) {
        if(!confirm("Are you sure you want to remove this bookmark?")) return;
        chrome.bookmarks.remove(bookmark.id);
        closePopup();
      }
      ]]
    });
  });

  // Add action for opening a new tab
  newActions.push({
    id: 'a3386e94-8f27-43c8-9959-d572034d233f',
    icon: 'system',
    title: 'Open new tab',
    description: "Creates a new tab to the configured homepage",
    action: function () {
      chrome.tabs.create({});
      closePopup();
    },
    managementActions: []
  });

  // Add action for closing the current tab
  newActions.push({
    id: "de633866-81c2-4c46-873b-040f507588f4",
    icon: 'system',
    title: 'Close current tab',
    description: "Closes the current tab",
    action: function () {
      chrome.tabs.query({ active: true, currentWindow: true }, function ([tab]) {
        if (tab.id)
          chrome.tabs.remove(tab.id);
        closePopup();
      });
    },
    managementActions: []
  });

  newActions.push({
    id: "6d49fe60-7cd3-4591-b24d-97162595b57b",
    icon: 'system',
    title: 'Close palette',
    description: "Close the palette without doing anything",
    action: function () {
      window.close();
    },
    managementActions: []
  });

  newActions.push({
    id: "742cb5e0-e1c8-4b1e-83f9-94cc70018378",
    icon: GoFileCode,
    title: 'Open browser shortcut keys',
    description: "The browser defaults to control+P being print. Open the browser's shortcuts page to change this",
    action: function () {
      chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
      closePopup();
    },
    managementActions: []
  })

  newActions.push({
    id: "e69d2a08-5f76-44ab-b9b6-f7cc43d48707",
    icon: GoDuplicate,
    title: 'Bookmark current page',
    description: "Add a bookmark for this page",
    action: function () {
      chrome.tabs.query({ active: true, currentWindow: true }, function ([tab]) {
        if (tab.id)
          chrome.bookmarks.create({ title: tab.title, url: tab.url });
      });
      closePopup();
    },
    managementActions: []
  })

  return newActions;
}

export function lunrIndex<T extends Record<string, unknown>>(dataset: T[], ref: (keyof T) & string, fields: ((keyof T) & string)[]) {
  return lunr(function() {
    this.ref(ref);
    for(const field of fields) {
      this.field(field);
    }
    for(const document of dataset) {
      this.add(document);
    }
  })
}