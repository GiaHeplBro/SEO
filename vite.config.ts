// File: /vite.config.ts (ở thư mục gốc)

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  // Quan trọng: Chỉ định thư mục gốc của frontend là 'client'
  root: 'client', 
  resolve: {
    alias: {
      // Alias '@' sẽ trỏ vào thư mục 'client/src'
      '@': path.resolve(__dirname, './client/src'),
    },
  },
  build: {
    // Build kết quả ra thư mục 'dist' bên trong 'client'
    outDir: 'dist',
  }
})