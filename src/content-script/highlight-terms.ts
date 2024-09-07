export function highlightText(searchText: string) {
  if (!searchText) return;
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let firstNewNode: HTMLElement | null = null;
  for(let node = walker.nextNode(); node; node = walker.nextNode()) {
    const text = node.nodeValue;
    if (text && text.match(new RegExp(searchText, 'i'))) {
      const uniqId = crypto.randomUUID();
      const mark = document.createElement('mark');
      mark.id = uniqId;
      const textNode = document.createTextNode(text);
      mark.appendChild(textNode);
      const replaced = node.parentNode?.insertBefore(mark, node);
      node.parentNode?.removeChild(node);
      if(!firstNewNode && replaced) {
        firstNewNode = replaced;
      }
    }
  }
  firstNewNode?.scrollIntoView();
}