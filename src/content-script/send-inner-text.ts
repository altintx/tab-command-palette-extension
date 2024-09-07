import { sendServerEvent } from "../server";

export function sendInnerText(document: Document) {
  sendServerEvent({
    event: "domcontentready",
    params: {
      page: {
        content: document.body.innerText,
        title: document.title,
      },
    },
  })
}
