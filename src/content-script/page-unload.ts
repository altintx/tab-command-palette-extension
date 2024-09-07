import { sendServerEvent } from "../server";

export function sendPageUnloadMessage() {
  sendServerEvent({
    event: 'beforeunload',
    params: undefined
  });
}
