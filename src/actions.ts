import { v4 as uuidv4 } from 'uuid';
import { getBookmarks, getTabs } from "./chrome-apis";
import { CmdShiftPAction } from "./types/command-shift-p-action";
import lunr from "lunr";
import { FindInPageEvent } from './types/events/find-in-page-event';
import { GoBookmarkFill, GoBookmarkSlash, GoDuplicate, GoFileCode, GoHistory } from 'react-icons/go';
import { getHistory } from './popup/get-history';

export async function getActions({
  closePopup,
  search
}: {
  closePopup: () => void;
  search: string;
}): Promise<CmdShiftPAction[]> {
  const [tabs, bookmarks, history] = await Promise.all([
    getTabs(), getBookmarks(), getHistory(search)]);
  const newActions: CmdShiftPAction[] = [];
  
  const currentTab = tabs.find(tab => tab.active);
  tabs.filter(tab => !!tab.id).forEach(tab => {
    const title = `Switch to tab: ${tab.title}`;
    const description = tab.body;
    newActions.push({
      id: uuidv4(),
      title,
      description,
      icon: "tab",
      url: tab.url,
      onHighlight: function (searchText: string) {
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
      url: bookmark.url,
      action: function () {
        chrome.tabs.create({ url: bookmark.url });
        closePopup();
      },
      managementActions: [[GoBookmarkSlash, { title: "Remove bookmark" }, function (action) {
        if (!confirm("Are you sure you want to remove this bookmark?")) return;
        chrome.bookmarks.remove(bookmark.id);
        closePopup();
      }
      ]]
    });
  });
  history.filter((historyEntry) => {
    // exclude if url is open in a tab
    return !tabs.find(tab => tab.url === historyEntry.page.url);
  }).forEach(entry => {
    const countText = entry.count > 1 ? ` (opened ${entry.count} times)` : "";
    const title = `Open from history: ${entry.page.title}${countText}*`;
    const openInNewTabByDefault = currentTab?.url?.startsWith("http");
    newActions.push({
      id: uuidv4(),
      icon: GoHistory,
      title,
      description: entry.page.content,
      url: entry.page.url,
      action: function () {
        openInNewTabByDefault ? chrome.tabs.create({ url: entry.page.url }) :
        currentTab && chrome.tabs.update(currentTab.id!, { url: entry.page.url });
        closePopup();
      },
      onHighlight: async function (searchText: string) {
        const tabs = await chrome.tabs.query({ active: true }); // a new tab may have been created prior to running highlights
        const currentTab = tabs.find(tab => tab.active);
        currentTab && chrome.tabs.sendMessage(currentTab.id!, { event: 'findInPage', params: { term: searchText } } satisfies FindInPageEvent);
      },
      managementActions: [[
        GoBookmarkFill,
        {
          title: "Bookmark",
        },
        () => {
          chrome.bookmarks.create({ title: entry.page.title, url: entry.page.url });
          closePopup();
        }
      ],
      [
        GoDuplicate,
        {
          title: "Open in new tab"
        },
        () => {
          chrome.tabs.create({ url: entry.page.url });
          closePopup();
        }
      ],
      [
        GoHistory,
        {
          title: "Open in this tab"
        },
        () => {
          currentTab && chrome.tabs.update(currentTab.id!, { url: entry.page.url });
          closePopup();
        }
      ]]
    });
  });

  // Fetch history
  chrome.history.search({ text: search, maxResults: 5 }, (historyItems) => {
    historyItems.forEach((item) => {
      newActions.push({
        id: uuidv4(),
        title: `Open from history: ${item.title}`,
        description: item.url ?? "",
        icon: GoHistory,
        url: item.url,
        action: function () {
          const openInNewTab = currentTab?.url?.startsWith("http") ?? false;
          if(openInNewTab)
            chrome.tabs.create({ url: item.url });
          else
            currentTab && chrome.tabs.update(currentTab.id!, { url: item.url });
          closePopup();
        },
        managementActions: []
      })
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
    url: 'chrome://extensions/shortcuts',
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

type LunrIndexFieldProps = {
  boost?: number;
  extractor?: (doc: object) => string;
};

export function lunrIndex<T extends Record<string, unknown>>(dataset: T[], ref: (keyof T) & string, fields: [((keyof T) & string), LunrIndexFieldProps][]) {
  return lunr(function () {
    this.ref(ref);
    for (const field of fields) {
      this.field(field[0], field[1]);
    }
    for (const document of dataset) {
      this.add(document);
    }
  })
}

export function lunrActionsIndex(actions: CmdShiftPAction[]) {
  return lunrIndex(actions, "id", [["title", {}], ["description", {}], ["url", {
    boost: 20,
  }]]);
}