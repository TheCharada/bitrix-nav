import { useEffect, useMemo, useRef, useState } from 'react';
import { Command } from 'cmdk';
import * as Avatar from '@radix-ui/react-avatar';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import type { BitrixRecentItem } from '../../types/bitrix';
import { t } from '../../lib/i18n';

type ActionBarProps = {
  open: boolean;
  items: BitrixRecentItem[];
  onClose: () => void;
  onSelectItem: (item: BitrixRecentItem) => void;
};

export function ActionBar({
  open,
  items,
  onClose,
  onSelectItem,
}: ActionBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (open) {
      queueMicrotask(() => inputRef.current?.focus());
    } else {
      setQuery('');
    }
  }, [open]);

  const filteredItems = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return items.slice(0, 40);
    }

    return items
      .filter((item) => {
        const haystack = `${item.title} ${item.entityType} ${item.id}`.toLowerCase();
        return haystack.includes(normalized);
      })
      .slice(0, 40);
  }, [items, query]);

  if (!open) {
    return null;
  }

  return (
    <div className="pointer-events-auto fixed inset-0 z-[2147483647] bg-black/18 backdrop-blur-[4px]">
      <div
        className="mx-auto mt-14 w-full max-w-2xl px-4"
        onClick={(event) => event.stopPropagation()}
      >
        <Command
          loop
          shouldFilter={false}
          className="overflow-hidden rounded-[28px] border border-white/15 bg-zinc-900/55 text-zinc-50 shadow-[0_24px_80px_rgba(0,0,0,0.45)] ring-1 ring-white/10 backdrop-blur-2xl"
        >
          <div className="border-b border-white/10 px-4 py-3">
            <Command.Input
              ref={inputRef}
              value={query}
              onValueChange={setQuery}
              placeholder={t('actionBarSearchPlaceholder')}
              className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-zinc-400"
            />
          </div>

          <ScrollArea.Root className="max-h-[430px]">
            <ScrollArea.Viewport className="max-h-[430px]">
              <Command.List className="p-2">
                <Command.Empty className="px-3 py-8 text-center text-sm text-zinc-400">
                  {t('actionBarEmpty')}
                </Command.Empty>

                {filteredItems.map((item) => (
                  <Command.Item
                    key={`${item.entityType}-${item.id}`}
                    value={`${item.title}-${item.id}`}
                    keywords={[String(item.id), item.entityType]}
                    onSelect={() => onSelectItem(item)}
                    className="group relative flex cursor-pointer items-center gap-3 rounded-2xl px-3 py-3 text-left outline-none transition
                      data-[selected=true]:bg-white/12
                      data-[selected=true]:ring-1
                      data-[selected=true]:ring-white/12"
                  >
                    <div
                      className="absolute left-1 top-2 bottom-2 w-1 rounded-full bg-transparent
                        group-data-[selected=true]:bg-white/70"
                    />

                    <Avatar.Root className="ml-2 flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/10">
                      {item.avatar ? (
                        <Avatar.Image
                          src={item.avatar}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : null}

                      <Avatar.Fallback className="text-sm font-semibold text-zinc-100">
                        {item.title.slice(0, 1).toUpperCase()}
                      </Avatar.Fallback>
                    </Avatar.Root>

                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-zinc-50">
                        {item.title}
                      </div>
                      <div className="mt-0.5 text-xs text-zinc-400">
                        {item.entityType === 'im-chat'
                          ? t('entityTypeChat')
                          : t('entityTypeUser')}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] uppercase tracking-wide text-zinc-400">
                        {item.id}
                      </div>

                      <div
                        className="rounded-full border border-white/10 bg-white/8 px-2 py-1 text-[10px] uppercase tracking-wide text-zinc-300 opacity-0 transition
                          group-data-[selected=true]:opacity-100"
                      >
                        {t('actionBarEnter')}
                      </div>
                    </div>
                  </Command.Item>
                ))}
              </Command.List>
            </ScrollArea.Viewport>

            <ScrollArea.Scrollbar
              orientation="vertical"
              className="flex w-2.5 touch-none p-[2px]"
            >
              <ScrollArea.Thumb className="flex-1 rounded-full bg-white/15" />
            </ScrollArea.Scrollbar>
          </ScrollArea.Root>

          <div className="flex items-center justify-between border-t border-white/10 bg-black/10 px-4 py-2 text-xs text-zinc-400">
            <span>{t('actionBarFooterLeft')}</span>
            <span>{t('actionBarFooterRight')}</span>
          </div>
        </Command>
      </div>

      <button
        type="button"
        aria-label={t('close')}
        className="absolute inset-0 -z-10 cursor-default"
        onClick={onClose}
      />
    </div>
  );
}