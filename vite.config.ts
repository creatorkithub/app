import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['favicon.ico', 'favicon.svg', 'icon.svg', 'icons.svg'],
      manifest: {
        name: 'Creator Kit Hub',
        short_name: 'CreatorKit',
        description: 'A free, 100% offline suite of client-side web tools for creators.',
        theme_color: '#09090b',
        icons: [
          {
            src: 'icon.svg',
            sizes: '512x512',
            type: 'image/svg+xml'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,wasm,txt,xml,woff2}'],
        maximumFileSizeToCacheInBytes: 15728640, // 15MB limit for large tool WASM files
        navigateFallbackDenylist: [/^\/.*\.xml$/, /^\/.*\.txt$/]
      }
    })
  ],
})
