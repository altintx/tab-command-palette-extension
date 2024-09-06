export type WindowId = string;
export type TabId = string;
export type Page = {
  content: string;
  title: string;
};

export type CmdPEvent = {
  event: 'domcontentready' | 'beforeunload' | 'getTabs';
}

export type CmdPDomContentReadyEvent = CmdPEvent & {
  event: 'domcontentready';
  page: Page;
};
export type CmdPBeforeUnloadEvent = CmdPEvent & {
  event: 'beforeunload';
};
export type QueryTabsEvent = CmdPEvent & {
  term?: string;
}
export type ContentScriptMessage = CmdPDomContentReadyEvent | CmdPBeforeUnloadEvent;
export type PopupApiMessage = QueryTabsEvent;

export type TabStore = Record<TabId, Page & { windowId: WindowId }>