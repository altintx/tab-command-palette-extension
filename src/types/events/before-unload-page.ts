import { CmdPEvent, ServerEvent } from "../event";
import { Tab } from "../tab";

export type CmdPBeforeUnloadEvent = CmdPEvent<
  ServerEvent,
  'beforeunload',
  undefined
>;
