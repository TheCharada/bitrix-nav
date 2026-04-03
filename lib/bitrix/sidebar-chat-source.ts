import { saveChatCache } from './chat-cache';
import { extractSidebarChatItems, findSidebarRoot } from './sidebar-dom';
import { setRecentItemsFromDom } from '../state/chat-store';

export function startSidebarChatSource() {
  let disposed = false;
  let timeoutId: number | undefined;
  let lastFingerprint = '';

  const run = () => {
    if (disposed) {
      return;
    }

    const root = findSidebarRoot();

    if (!root) {
      return;
    }

    const items = extractSidebarChatItems();

    if (items.length === 0) {
      return;
    }

    const fingerprint = items
      .map((item) => `${item.entityType}:${String(item.id)}:${item.title}`)
      .join('|');

    if (fingerprint === lastFingerprint) {
      return;
    }

    lastFingerprint = fingerprint;

    setRecentItemsFromDom(items);
    void saveChatCache(items);
  };

  const schedule = () => {
    if (disposed) {
      return;
    }

    if (timeoutId) {
      window.clearTimeout(timeoutId);
    }

    timeoutId = window.setTimeout(run, 120);
  };

  run();

  const observer = new MutationObserver(() => {
    schedule();
  });

  if (document.body) {
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
    });
  }

  const onFocus = () => schedule();
  const onVisibility = () => {
    if (document.visibilityState === 'visible') {
      schedule();
    }
  };

  window.addEventListener('focus', onFocus);
  document.addEventListener('visibilitychange', onVisibility);

  return () => {
    disposed = true;

    if (timeoutId) {
      window.clearTimeout(timeoutId);
    }

    observer.disconnect();
    window.removeEventListener('focus', onFocus);
    document.removeEventListener('visibilitychange', onVisibility);
  };
}