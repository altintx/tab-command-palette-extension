import { CmdPEvent, ContentScriptEvent } from "../event";

export type WarmCacheEvent = CmdPEvent<
  ContentScriptEvent,
  'warmCache',
  {
    url: string;
  }
>;