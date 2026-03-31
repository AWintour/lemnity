import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import tsconfigPaths from 'vite-tsconfig-paths'
// import { analyzer } from 'vite-bundle-analyzer'

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: ['babel-plugin-react-compiler'],
      },
    }),
    tailwindcss(),
    tsconfigPaths(),
    // analyzer(),
  ],
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    // https://stackoverflow.com/questions/55763428/react-native-error-enospc-system-limit-for-number-of-file-watchers-reached
    // полагаю, что node_modules(тысячи файлов), монтируемые в контейнер, триггерят эту ошибку
    watch: {
      ignored: ['**/node_modules/**', '**/.pnpm-store/**']
    }
  }
})
