import Browser from "webextension-polyfill";
import { HistoryEntry } from "./types/history";

function serializeHistory(history: HistoryEntry[]): any[] {
  return history.map(entry => ({
    ...entry,
    createdAt: entry.createdAt.toISOString(),
    updatedAt: entry.updatedAt.toISOString(),
    closedAt: entry.closedAt ? entry.closedAt.toISOString() : undefined,
  }));
}

// Save history to extensionHost.storage.local
export async function saveHistoryToStorage(history: HistoryEntry[]) {
  const serializedHistory = serializeHistory(history);
  await Browser.storage.local.set({ history: serializedHistory });
  if (Browser.runtime.lastError) {
    console.error('Error saving history:', Browser.runtime.lastError);
  }
}

function deserializeHistory(serializedHistory: any[]): HistoryEntry[] {
  return serializedHistory.map(entry => ({
    ...entry,
    createdAt: new Date(entry.createdAt),
    updatedAt: new Date(entry.updatedAt),
    closedAt: entry.closedAt ? new Date(entry.closedAt) : undefined,
  }));
}

// Load history from extensionHost.storage.local
export async function loadHistoryFromStorage(callback?: (history: HistoryEntry[]) => void) {
  const result = await Browser.storage.local.get(['history']); 
  if (Browser.runtime.lastError) {
    console.error('Error loading history:', Browser.runtime.lastError);
    callback?.([]);
  } else {
    const history = result.history ? deserializeHistory(result.history as any[]) : [];
    callback?.(history);
  }
  return history;
}