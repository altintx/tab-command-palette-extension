import { CmdPEvent, ContentScriptEvent } from "../event";

export type FindInPageEvent = CmdPEvent<
  ContentScriptEvent,
  'findInPage',
  {
    term: string;
  }
>;