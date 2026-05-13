import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Reducir warnings cuando un chunk legítimamente grande supera 500KB
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        // Estrategia simple: separar vendors pesados que rara vez cambian
        // de la app, mejorando cache del navegador entre deploys.
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['radix-ui', 'lucide-react'],
          'forms-vendor': ['react-hook-form', '@hookform/resolvers'],
          'date-vendor': ['date-fns', 'react-day-picker'],
        },
      },
    },
  },
})
