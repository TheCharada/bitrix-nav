import type { BitrixRecentItem } from '../../types/bitrix';

let domItems: BitrixRecentItem[] = [];
let cachedItems: BitrixRecentItem[] = [];

const listeners = new Set<(items: BitrixRecentItem[]) => void>();

function getItemKey(item: BitrixRecentItem) {
  return `${item.entityType}:${String(item.id)}`;
}

function dedupe(items: BitrixRecentItem[]) {
  const seen = new Set<string>();
  const result: BitrixRecentItem[] = [];

  for (const item of items) {
    const key = getItemKey(item);

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push(item);
  }

  return result;
}

function getEffectiveItems() {
  return domItems.length > 0 ? domItems : cachedItems;
}

function emit() {
  const effective = getEffectiveItems();
  listeners.forEach((listener) => listener(effective));
}

export function setRecentItemsFromDom(items: BitrixRecentItem[]) {
  domItems = dedupe(items);

  emit();
}

export function setRecentItemsFromCache(items: BitrixRecentItem[]) {
  cachedItems = dedupe(items);

  emit();
}

export function getRecentItems() {
  return getEffectiveItems();
}

export function subscribeRecentItems(listener: (items: BitrixRecentItem[]) => void) {
  listeners.add(listener);
  listener(getEffectiveItems());

  return () => {
    listeners.delete(listener);
  };
}