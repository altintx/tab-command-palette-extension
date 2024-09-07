import lunr from "lunr";
import { GetHistory } from "../types/events/get-history";
import { HistoryEntry } from "../types/history";
import { lunrIndex } from "../actions";

export function getHistoryHandler({ message, history, sendResponse }:
{ 
  message: GetHistory,  
  sendResponse: (response: HistoryEntry[]) => void,
  history: HistoryEntry[],
}) {
  // history will be big don't send everything
  if(message.params.term === "") {
    sendResponse([]);
    return;
  }
  const index = lunrIndex(history.map(entry => entry.page), "url", ["content", "title", "url"]);
  console.log("server says sending history", history);
  const results = index.search(message.params.term);
  const historyEntries = results
    .map(result => history.find(entry => entry.page.url === result.ref))
    .filter(entry => entry !== undefined) as HistoryEntry[];
  sendResponse(historyEntries);
}
