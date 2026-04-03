import type { BitrixRecentItem } from '../../types/bitrix';

const STORAGE_KEY = 'bitrix-sidebar-chat-cache-v1';

type CachePayload = {
  updatedAt: number;
  items: BitrixRecentItem[];
};

function getStorageArea() {
  const maybeBrowser = (globalThis as any).browser?.storage?.local;
  const maybeChrome = (globalThis as any).chrome?.storage?.local;

  return maybeBrowser ?? maybeChrome ?? null;
}

async function storageGet<T>(key: string): Promise<T | undefined> {
  const storage = getStorageArea();

  if (!storage) {
    return undefined;
  }

  try {
    const result = storage.get(key);

    if (result && typeof result.then === 'function') {
      const data = await result;
      return data?.[key];
    }
  } catch {}

  return await new Promise<T | undefined>((resolve, reject) => {
    try {
      storage.get(key, (data: Record<string, T>) => {
        const runtimeError = (globalThis as any).chrome?.runtime?.lastError;

        if (runtimeError) {
          reject(new Error(runtimeError.message));
          return;
        }

        resolve(data?.[key]);
      });
    } catch (error) {
      reject(error);
    }
  });
}

async function storageSet(value: Record<string, unknown>) {
  const storage = getStorageArea();

  if (!storage) {
    return;
  }

  try {
    const result = storage.set(value);

    if (result && typeof result.then === 'function') {
      await result;
      return;
    }
  } catch {}

  await new Promise<void>((resolve, reject) => {
    try {
      storage.set(value, () => {
        const runtimeError = (globalThis as any).chrome?.runtime?.lastError;

        if (runtimeError) {
          reject(new Error(runtimeError.message));
          return;
        }

        resolve();
      });
    } catch (error) {
      reject(error);
    }
  });
}

export async function loadChatCache() {
  try {
    const payload = await storageGet<CachePayload>(STORAGE_KEY);

    if (!payload?.items || !Array.isArray(payload.items)) {
      return [];
    }



    return payload.items;
  } catch (error) {
    return [];
  }
}

export async function saveChatCache(items: BitrixRecentItem[]) {
    await storageSet({
      [STORAGE_KEY]: {
        updatedAt: Date.now(),
        items,
      } satisfies CachePayload,
    });
}