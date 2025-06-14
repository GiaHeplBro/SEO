// File: client/vite.config.ts (Phiên bản cuối cùng, đơn giản nhất)

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Không cần import 'path' nữa

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Dùng cú pháp của Vite để tự động trỏ đến thư mục src
      // Dấu '/' ở đầu có nghĩa là trỏ từ thư mục gốc của dự án (mà Vercel đã set là 'client')
      '@': '/src',
    },
  },
})