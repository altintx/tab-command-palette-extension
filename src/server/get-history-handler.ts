import { HistoryEntry } from "../types/history";
import { lunrIndex } from "../actions";

export function getHistory({ search, history }:
{ 
  search: string,  
  history: HistoryEntry[],
}) {
  if(search === "") {
    return [];
  }
  const index = lunrIndex(history.map(entry => entry.page), "url", [["content", {}], ["title", {}], ["url", {}]]);
  const results = index.search(search);
  const historyEntries = results
    .map(result => history.find(entry => entry.page.url === result.ref))
    .filter(entry => entry !== undefined) as HistoryEntry[];
  return (historyEntries);
}
