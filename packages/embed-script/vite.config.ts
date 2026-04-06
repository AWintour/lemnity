import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import tsconfigPaths from 'vite-tsconfig-paths'
// import { analyzer, adapter } from 'vite-bundle-analyzer'

export default defineConfig({
  base: 'http://localhost:5173',
  server: {
    port: 5174,
  },
  plugins: [
    react(),
    tailwindcss(),
    tsconfigPaths({
      projects: [path.resolve(__dirname, 'tsconfig.app.json')]
    }),
    // adapter(analyzer()),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../../projects/client/src'),
      '@pages': path.resolve(__dirname, '../../projects/client/src/pages'),
      '@stores': path.resolve(__dirname, '../../projects/client/src/stores'),
      '@common': path.resolve(__dirname, '../../projects/client/src/common'),
      '@services': path.resolve(__dirname, '../../projects/client/src/services'),
      '@hooks': path.resolve(__dirname, '../../projects/client/src/common/hooks'),
      '@layouts': path.resolve(__dirname, '../../projects/client/src/layouts'),
      '@widgets': path.resolve(__dirname, '../../projects/client/src/layouts/Widgets')
    }
  },
  define: {
    'process.env.NODE_ENV': '"production"',
    'process.env': '{}'
  },
  build: {
    // lib: {
    //   entry: path.resolve(__dirname, 'src/embed/index.tsx'),
    //   name: 'LemnityWidgets',
    //   fileName: () => 'embed.js',
    //   formats: ['iife']
    // },
    rollupOptions: {
      input: path.resolve(__dirname, 'src/embed/index.tsx'),
      output: {
        dir: 'dist',
        // format: 'iife',
        entryFileNames: 'embed.js',
        manualChunks: {
          vendor: [
            'react',
            'react-redux',
            'react-dom/client',
            '@tanstack/react-query',
            // '@reduxjs/toolkit',
            'axios',
            'zod',
          ],
          // luxon: ['luxon'],
        },
      }
    },
    outDir: 'dist',
    emptyOutDir: true,
  }
})
