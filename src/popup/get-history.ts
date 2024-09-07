import { sendServerEvent } from "../server";
import { HistoryEntry } from "../types/history";

export async function getHistory() {
  const history = sendServerEvent<HistoryEntry[]>({ event: "getHistory", params: {} });
  return history;
}