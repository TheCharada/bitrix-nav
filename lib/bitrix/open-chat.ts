import type { BitrixRecentItem } from '../../types/bitrix';
import { getSidebarChatElements } from './sidebar-dom';

function clickElement(element: Element) {
  const container =
    element.querySelector('.bx-im-list-recent-item__container') ??
    element;

  container.dispatchEvent(
    new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window,
    }),
  );
}

export function openBitrixChatByItem(item: BitrixRecentItem) {
  const rawId = String(item.id);
  const possibleIds = new Set<string>([rawId]);

  if (rawId.startsWith('chat')) {
    possibleIds.add(rawId.replace(/^chat/i, ''));
  }

  const elements = getSidebarChatElements();

  for (const element of elements) {
    const elementId = element.getAttribute('data-id');

    if (!elementId) {
      continue;
    }

    if (!possibleIds.has(elementId)) {
      continue;
    }

    element.scrollIntoView({ block: 'nearest' });
    clickElement(element);
    return true;
  }

  return false;
}