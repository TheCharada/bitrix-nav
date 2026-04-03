import type { BitrixRecentItem } from '../../types/bitrix';

const SCROLL_CONTAINER_SELECTOR = '.bx-im-list-recent__scroll-container';
const PINNED_CONTAINER_SELECTOR = ':scope > .bx-im-list-recent__pinned_container';
const GENERAL_CONTAINER_SELECTOR = ':scope > .bx-im-list-recent__general_container';
const ITEM_SELECTOR = ':scope > .bx-im-list-recent-item__wrap[data-id]';

function normalizeText(value: string | null | undefined) {
  return (value ?? '').replace(/\s+/g, ' ').trim();
}

export function isVisible(element: Element) {
  const rect = element.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

function getScrollContainer() {
  const container = document.querySelector(SCROLL_CONTAINER_SELECTOR);

  if (!container || !isVisible(container)) {
    return null;
  }

  return container;
}

function getSectionItems(section: Element | null) {
  if (!section) {
    return [];
  }

  return Array.from(section.querySelectorAll(ITEM_SELECTOR)).filter(isVisible);
}

function getItemId(element: Element) {
  return element.getAttribute('data-id');
}

function isNotesItem(element: Element) {
  return Boolean(element.querySelector('.bx-im-notes-avatar__container'));
}

function getTitleNode(element: Element) {
  return element.querySelector<HTMLElement>(
    '.bx-im-list-recent-item__content_header .bx-im-chat-title__text[title]',
  );
}

function getAvatarContainer(element: Element) {
  return element.querySelector<HTMLElement>(
    '.bx-im-list-recent-item__avatar_content > .bx-im-avatar__container',
  );
}

function getAvatarImage(element: Element) {
  return element.querySelector<HTMLImageElement>(
    '.bx-im-list-recent-item__avatar_content img.bx-im-avatar__content.--image',
  );
}

function getTitleFromItem(element: Element) {
  const titleNode = getTitleNode(element);

  if (!titleNode) {
    return '';
  }

  return (
    normalizeText(titleNode.getAttribute('title')) ||
    normalizeText(titleNode.textContent)
  );
}

function inferEntityTypeFromItem(
  element: Element,
  id: string,
): 'im-user' | 'im-chat' {
  const avatarContainer = getAvatarContainer(element);

  if (avatarContainer?.classList.contains('--user')) {
    return 'im-user';
  }

  if (
    avatarContainer?.classList.contains('--chat') ||
    avatarContainer?.classList.contains('--open') ||
    avatarContainer?.classList.contains('--general') ||
    avatarContainer?.classList.contains('--special')
  ) {
    return 'im-chat';
  }

  if (/^chat\d+$/i.test(id)) {
    return 'im-chat';
  }

  return 'im-user';
}

function extractItem(element: Element): BitrixRecentItem | null {
  const id = getItemId(element);

  if (!id) {
    return null;
  }

  if (isNotesItem(element)) {
    return null;
  }

  const title = getTitleFromItem(element);

  if (!title) {
    return null;
  }

  const avatar = getAvatarImage(element)?.getAttribute('src') || undefined;
  const entityType = inferEntityTypeFromItem(element, id);

  return {
    id,
    title,
    entityType,
    avatar,
    customData: {
      source: 'dom',
    },
  };
}

export function findSidebarRoot() {
  return getScrollContainer();
}

export function getSidebarChatElements() {
  const root = getScrollContainer();

  if (!root) {
    return [];
  }

  const pinnedSection = root.querySelector(PINNED_CONTAINER_SELECTOR);
  const generalSection = root.querySelector(GENERAL_CONTAINER_SELECTOR);

  const pinnedItems = getSectionItems(pinnedSection);
  const generalItems = getSectionItems(generalSection);

  const items = [...pinnedItems, ...generalItems].filter((element) => {
    return !isNotesItem(element) && Boolean(getTitleFromItem(element));
  });

  return items;
}

export function extractSidebarChatItems(): BitrixRecentItem[] {
  return getSidebarChatElements()
    .map(extractItem)
    .filter((item): item is BitrixRecentItem => item !== null);
}