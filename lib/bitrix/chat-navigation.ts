import { getSidebarChatElements } from './sidebar-dom';

function getCurrentIndex(elements: Element[]) {
  return elements.findIndex((element) => {
    return element.classList.contains('--selected');
  });
}

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

  element.scrollIntoView({ block: 'nearest' });
}

export function goToNextChat() {
  const elements = getSidebarChatElements();

  if (elements.length === 0) {
    return;
  }

  const currentIndex = getCurrentIndex(elements);
  const targetIndex =
    currentIndex >= 0
      ? Math.min(currentIndex + 1, elements.length - 1)
      : 0;

  clickElement(elements[targetIndex]);
}

export function goToPreviousChat() {
  const elements = getSidebarChatElements();

  if (elements.length === 0) {
    return;
  }

  const currentIndex = getCurrentIndex(elements);
  const targetIndex =
    currentIndex >= 0
      ? Math.max(currentIndex - 1, 0)
      : 0;

  clickElement(elements[targetIndex]);
}