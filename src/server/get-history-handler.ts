import { QueryTabsEvent } from "../types/events/query-tabs";
import { HistoryEntry } from "../types/history";

export function getHistoryHandler({ history, sendResponse }:
{ 
  message: QueryTabsEvent,  
  sendResponse: (response: HistoryEntry[]) => void,
  history: HistoryEntry[]
}) {
  console.log("server says sending history", history);
  sendResponse(history);
}
