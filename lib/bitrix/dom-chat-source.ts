import { setRecentItemsFromDom } from "../state/chat-store";
import type { BitrixRecentItem } from "../../types/bitrix";

function isVisible(element: Element) {
  const rect = element.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

function normalizeText(value: string | null | undefined) {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

function isChatId(value: string | null) {
  if (!value) {
    return false;
  }

  return /^\d+$/.test(value) || /^chat\d+$/i.test(value);
}

function inferEntityType(id: string): "im-user" | "im-chat" {
  return /^chat\d+$/i.test(id) ? "im-chat" : "im-user";
}

function getAvatar(element: Element) {
  const img = element.querySelector("img[src]");
  const src = img?.getAttribute("src");

  return src ? src : undefined;
}

function getTitleFromKnownPlaces(element: Element) {
  const selectorCandidates = [
    "[title]",
    "[aria-label]",
    "[data-text]",
    ".bx-im-list-item__title",
    ".bx-im-list-chat__name",
    ".bx-im-dialog-sidebar-main__name",
    ".bx-im-recent-item__title",
    ".bx-im-list-item-title",
  ];

  for (const selector of selectorCandidates) {
    const match = element.querySelector(selector);

    if (!match) {
      continue;
    }

    const text =
      normalizeText(match.getAttribute("title")) ||
      normalizeText(match.getAttribute("aria-label")) ||
      normalizeText(match.getAttribute("data-text")) ||
      normalizeText(match.textContent);

    if (text) {
      return text;
    }
  }

  return "";
}

function getTitle(element: Element) {
  const direct =
    normalizeText(element.getAttribute("title")) ||
    normalizeText(element.getAttribute("aria-label"));

  if (direct) {
    return direct;
  }

  const known = getTitleFromKnownPlaces(element);

  if (known) {
    return known;
  }

  const text = normalizeText(element.textContent);

  if (!text) {
    return "";
  }

  return text.length > 120 ? text.slice(0, 120) : text;
}

function extractChatItems(): BitrixRecentItem[] {
  const candidates = Array.from(document.querySelectorAll("[data-id]"));
  const items: BitrixRecentItem[] = [];
  const seen = new Set<string>();

  for (const element of candidates) {
    if (!isVisible(element)) {
      continue;
    }

    const rawId = element.getAttribute("data-id")!;

    if (!isChatId(rawId)) {
      continue;
    }

    const title = getTitle(element);

    if (!title) {
      continue;
    }

    const entityType = inferEntityType(rawId);
    const key = `${entityType}:${rawId}`;

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);

    items.push({
      id: rawId,
      title,
      entityType,
      avatar: getAvatar(element),
      customData: {
        source: "dom",
      },
    });
  }

  return items;
}

export function startDomChatSource() {
  let disposed = false;
  let timeoutId: number | undefined;
  let lastFingerprint = "";

  const run = () => {
    if (disposed) {
      return;
    }

    const items = extractChatItems();
    const fingerprint = items
      .map((item) => `${item.entityType}:${String(item.id)}:${item.title}`)
      .join("|");

    if (fingerprint === lastFingerprint) {
      return;
    }

    lastFingerprint = fingerprint;

    setRecentItemsFromDom(items);
  };

  const schedule = () => {
    if (disposed) {
      return;
    }

    if (timeoutId) {
      window.clearTimeout(timeoutId);
    }

    timeoutId = window.setTimeout(run, 150);
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
      characterData: false,
    });
  }

  const onFocus = () => schedule();
  const onVisibility = () => {
    if (document.visibilityState === "visible") {
      schedule();
    }
  };

  window.addEventListener("focus", onFocus);
  document.addEventListener("visibilitychange", onVisibility);

  return () => {
    disposed = true;

    if (timeoutId) {
      window.clearTimeout(timeoutId);
    }

    observer.disconnect();
    window.removeEventListener("focus", onFocus);
    document.removeEventListener("visibilitychange", onVisibility);
  };
}
