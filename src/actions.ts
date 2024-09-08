import lunr from "lunr";
import { getTabs } from "./chrome-apis";
import { getHistory } from './server/get-history-handler';
import { CmdShiftPAction } from "./types/command-shift-p-action";
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
  tabs.filter(tab => !!tab.id).forEach(tab => {
    const title = `Tab: ${tab.title}`;
    const description = tab.body;
    newActions.push({
      title,
      description,
      url: tab.url,
    });
  });
  history.filter((historyEntry) => {
    // exclude if url is open in a tab
    return !tabs.find(tab => tab.url === historyEntry.page.url);
  }).forEach(entry => {
    const countText = entry.count > 1 ? ` (opened ${entry.count} times)` : "";
    const title = `History: ${entry.page.title}${countText}`;
    newActions.push({
      title,
      description: entry.page.content,
      url: entry.page.url,
    });
  });

  newActions.push({
    url: 'chrome://extensions/shortcuts',
    title: 'Shortcut keys',
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