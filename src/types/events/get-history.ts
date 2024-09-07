import { CmdPEvent, ServerEvent } from "../event";

export type GetHistory = CmdPEvent<
  ServerEvent,
  'getHistory',
  {
    term: string;
  }
>;