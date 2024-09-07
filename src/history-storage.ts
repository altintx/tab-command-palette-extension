import { HistoryEntry } from "./types/history";

function serializeHistory(history: HistoryEntry[]): any[] {
  return history.map(entry => ({
    ...entry,
    createdAt: entry.createdAt.toISOString(),
    updatedAt: entry.updatedAt.toISOString(),
    closedAt: entry.closedAt ? entry.closedAt.toISOString() : undefined,
  }));
}

// Save history to chrome.storage.local
export function saveHistoryToStorage(history: HistoryEntry[]) {
  const serializedHistory = serializeHistory(history);
  chrome.storage.local.set({ history: serializedHistory }, () => {
    if (chrome.runtime.lastError) {
      console.error('Error saving history:', chrome.runtime.lastError);
    }
  });
}

function deserializeHistory(serializedHistory: any[]): HistoryEntry[] {
  return serializedHistory.map(entry => ({
    ...entry,
    createdAt: new Date(entry.createdAt),
    updatedAt: new Date(entry.updatedAt),
    closedAt: entry.closedAt ? new Date(entry.closedAt) : undefined,
  }));
}

// Load history from chrome.storage.local
export function loadHistoryFromStorage(callback: (history: HistoryEntry[]) => void) {
  chrome.storage.local.get(['history'], (result) => {
    if (chrome.runtime.lastError) {
      console.error('Error loading history:', chrome.runtime.lastError);
      callback([]);
    } else {
      const history = result.history ? deserializeHistory(result.history) : [];
      callback(history);
    }
  });
}