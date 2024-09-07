import { sendServerEvent } from "../server";
import { HistoryEntry } from "../types/history";

export async function getHistory(searchTerm: string) {
  const history = sendServerEvent<HistoryEntry[]>({ event: "getHistory", params: { term: searchTerm } });
  return history;
}