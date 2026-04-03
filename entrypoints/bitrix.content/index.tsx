import './style.css';
import ReactDOM from 'react-dom/client';
import App from './App';
import { loadChatCache } from '../../lib/bitrix/chat-cache';
import { startSidebarChatSource } from '../../lib/bitrix/sidebar-chat-source';
import { setRecentItemsFromCache } from '../../lib/state/chat-store';

export default defineContentScript({
  matches: ['https://*.bitrix24.com.br/online*'],
  cssInjectionMode: 'ui',

  async main(ctx) {

    let stopSidebarChatSource = () => {};

    const cachedItems = await loadChatCache();

    if (cachedItems.length > 0) {
      setRecentItemsFromCache(cachedItems);
    }

    const ui = await createShadowRootUi(ctx, {
      name: 'bitrix-nav',
      position: 'inline',
      anchor: 'body',
      append: 'last',
      onMount: (container) => {

        const app = document.createElement('div');
        app.id = 'bitrix-nav-root';
        container.append(app);

        const root = ReactDOM.createRoot(app);
        root.render(<App />);

        return root;
      },
      onRemove: (root) => {

        root?.unmount();
        stopSidebarChatSource();
      },
    });

    ui.mount();

    stopSidebarChatSource = startSidebarChatSource();
  },
});