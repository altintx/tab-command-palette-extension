export type ServerEvent = 'domcontentready' | 'beforeunload';
export type ContentScriptEvent = 'findInPage';

export type CmdPEvent<
  TEventType extends ServerEvent | ContentScriptEvent, 
  TEventName extends TEventType,
  TEvent = unknown
> = {
  event: TEventName;
  params: TEvent;
};