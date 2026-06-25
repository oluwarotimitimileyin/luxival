import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { inspectAttr } from 'kimi-plugin-inspect-react'
import apiKeysPlugin from './server/apiPlugin'

// https://vite.dev/config/
export default defineConfig({
  base: '/portfolio/auraframe/frontend/dist/',
  envDir: path.resolve(__dirname, '../..'),
  plugins: [inspectAttr(), apiKeysPlugin(), react()],
  server: {
    port: 3000,
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
