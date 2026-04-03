import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifestVersion: 3,

  manifest: ({ browser }) => ({
    name: '__MSG_extName__',
    description: '__MSG_extDescription__',
    default_locale: 'pt_BR',

    permissions: ['storage'],

    action: {
      default_title: '__MSG_extActionTitle__',
      default_icon: {
        '16': 'icon-16.png',
        '32': 'icon-32.png',
        '48': 'icon-48.png',
        '96': 'icon-96.png',
        '128': 'icon-128.png',
      },
    },

    icons: {
      '16': 'icon-16.png',
      '32': 'icon-32.png',
      '48': 'icon-48.png',
      '96': 'icon-96.png',
      '128': 'icon-128.png',
    },

    browser_specific_settings:
      browser === 'firefox'
        ? {
            gecko: {
              id: 'bitrix-nav@luizcastilho.dev',
              data_collection_permissions: {
                required: ['none'],
              },
            },
          }
        : undefined,
  }),

  vite: () => ({
    plugins: [tailwindcss()],
  }),
});