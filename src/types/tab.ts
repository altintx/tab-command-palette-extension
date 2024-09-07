import { TabId, WindowId } from "./browser";
import { Page } from "./page"

export type Tab = {
  page: Page;
  createdAt: Date;
  updatedAt: Date;
  closedAt?: Date;
  tabId: TabId;
  windowId: WindowId;
}