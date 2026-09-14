import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/mtm-price-app/',

  plugins: [
    react(),

    VitePWA({
      registerType: 'autoUpdate',

      manifest: {
        name: 'MTM Price',
        short_name: 'MTM Price',
        description: 'MTM Price - Vehicle Transport Prices',

        start_url: '/mtm-price-app/',
        scope: '/mtm-price-app/',

        display: 'standalone',
        orientation: 'portrait',

        theme_color: '#ffffff',
        background_color: '#ffffff',

        icons: [
          {
            src: '/mtm-price-app/logo3.jpg',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/mtm-price-app/logo3.jpg',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },

      workbox: {
        cleanupOutdatedCaches: true,

        navigateFallback: '/mtm-price-app/index.html',

        runtimeCaching: [
          {
            urlPattern: /^https:\/\/raw\.githubusercontent\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'mtm-price-data',
              networkTimeoutSeconds: 5,

              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },

              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ],
});
