import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  cacheDir: false, // Отключаем кэширование
  build: {
    outDir: 'dist',
    emptyOutDir: true, // Удаляет старые файлы перед сборкой
  },
})
