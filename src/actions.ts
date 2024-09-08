import lunr from "lunr";
import { getTabs } from "./chrome-apis";
import { getHistory } from './server/get-history-handler';
import { CmdShiftPAction } from "./types/command-shift-p-action";
import { FindInPageEvent } from './types/events/find-in-page-event';
import { HistoryEntry } from './types/history';
import { TabStore } from './types/tab-state';

export async function getActions({
  search,
  tabData,
  history: historyRaw
}: {
  search: string;
  tabData: TabStore;
  history: HistoryEntry[];
}): Promise<CmdShiftPAction[]> {
  const [tabs, history] = await Promise.all([
    getTabs(tabData), 
    getHistory({
      search,
      history: historyRaw
  })]);
  const newActions: CmdShiftPAction[] = [];
  const currentTab = tabs.find(tab => tab.active);
  tabs.filter(tab => !!tab.id).forEach(tab => {
    const title = `Switch to tab: ${tab.title}`;
    const description = tab.body;
    newActions.push({
      title,
      description,
      url: tab.url,
      onHighlight: function (searchText: string) {
        chrome.tabs.sendMessage(tab.id!, { event: 'findInPage', params: { term: searchText } } satisfies FindInPageEvent);
      },
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
      title,
      description: entry.page.content,
      url: entry.page.url,
      onHighlight: async function (searchText: string) {
        const tabs = await chrome.tabs.query({ active: true }); // a new tab may have been created prior to running highlights
        const currentTab = tabs.find(tab => tab.active);
        currentTab && chrome.tabs.sendMessage(currentTab.id!, { event: 'findInPage', params: { term: searchText } } satisfies FindInPageEvent);
      }
    });
  });

  newActions.push({
    url: 'chrome://extensions/shortcuts',
    title: 'Open browser shortcut keys',
    description: "The browser defaults to control+P being print. Open the browser's shortcuts page to change this",
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
  return lunrIndex(actions, "url", [["title", {}], ["description", {}], ["url", {
    boost: 20,
  }]]);
}