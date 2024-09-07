import { Page } from "./page";

export type HistoryEntry = {
  page: Page;
  count: number;
  createdAt: Date;
  updatedAt: Date;
  closedAt?: Date;
}
