import { CmdPEvent, ServerEvent } from "../event";
import { Page } from "../page";

export type CmdPDomContentReadyEvent = CmdPEvent<
  ServerEvent,
  'domcontentready',
  {
    page: Pick<Page, 'content' | 'title'>;
  }
>;
