import { CmdPEvent, ServerEvent } from "../event";

export type QueryTabsEvent = CmdPEvent<
  ServerEvent,
  'getTabs',
  {
    term?: string;
  }
>;
