import { QueryTabsEvent } from "../types/events/query-tabs";
import { TabStore } from "../types/tab-state";

export function getTabsHandler({ tabData, sendResponse }:
{ 
  message: QueryTabsEvent,  
  sendResponse: (response: TabStore) => void,
  tabData: TabStore
}) {
  console.log("server says sending tabData", tabData);
  sendResponse(tabData);
}
