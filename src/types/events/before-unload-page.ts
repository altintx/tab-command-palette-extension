import { CmdPEvent, ServerEvent } from "../event";

export type CmdPBeforeUnloadEvent = CmdPEvent<
  ServerEvent,
  'beforeunload',
  undefined
>;
