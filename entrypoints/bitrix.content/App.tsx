import { useEffect, useState } from 'react';
import { ActionBar } from '../../components/action-bar/ActionBar';
import { focusMessageInput } from '../../lib/bitrix/focus-input';
import { goToNextChat, goToPreviousChat } from '../../lib/bitrix/chat-navigation';
import { openBitrixChatByItem } from '../../lib/bitrix/open-chat';
import { registerGlobalHotkeys } from '../../lib/hotkeys/register-hotkeys';
import { subscribeRecentItems } from '../../lib/state/chat-store';
import type { BitrixRecentItem } from '../../types/bitrix';

export default function App() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<BitrixRecentItem[]>([]);



  useEffect(() => {
    return subscribeRecentItems((nextItems) => {

      setItems(nextItems);
    });
  }, []);

  useEffect(() => {

    return registerGlobalHotkeys({
      onToggle: () => {
        setOpen((value) => !value);
      },
      onClose: () => {
        setOpen(false);
      },
      onNextChat: () => {
        goToNextChat();
      },
      onPreviousChat: () => {
        goToPreviousChat();
      },
      onFocusInput: () => {
        focusMessageInput();
      },
    });
  }, []);

  return (
    <ActionBar
      open={open}
      items={items}
      onClose={() => setOpen(false)}
      onSelectItem={(item) => {


        openBitrixChatByItem(item);
        setOpen(false);
      }}
    />
  );
}