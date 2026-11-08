import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'
import path from 'path'

export default defineConfig(() => ({
  plugins: [
    react(),
    ...(process.env.HTTPS === 'true' ? [basicSsl()] : []),
  ],
  resolve: {
    alias: [
      { find: '@', replacement: path.resolve(__dirname, './src') },
    ],
    dedupe: ['react', 'react-dom'],
  },
  server: {
    port: 5174,
    host: '0.0.0.0',
    cors: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8001',
        changeOrigin: true,
        secure: false,
      },
      '/storage': {
        target: 'http://127.0.0.1:8001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('react-router-dom') || id.includes('react-dom') || id.includes('/react/')) return 'vendor'
          if (id.includes('@tanstack') || id.includes('axios')) return 'query'
          if (id.includes('recharts')) return 'charts'
          if (id.includes('framer-motion')) return 'motion'
        },
      },
    },
  },
}))
