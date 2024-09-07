export type ServerEvent = 'domcontentready' | 'beforeunload' | 'getTabs';
export type ContentScriptEvent = 'findInPage' | 'warmCache';

export type CmdPEvent<
  TEventType extends ServerEvent | ContentScriptEvent, 
  TEventName extends TEventType,
  TEvent
> = {
  event: TEventName;
  params: TEvent;
};