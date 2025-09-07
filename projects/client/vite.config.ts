import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [react(), tailwindcss(), tsconfigPaths()],
  server: {
    // https://stackoverflow.com/questions/55763428/react-native-error-enospc-system-limit-for-number-of-file-watchers-reached
    // полагаю, что node_modules(тысячи файлов), монтируемые в контейнер, триггерят эту ошибку
    watch: {
      ignored: [
        '**/node_modules/**',
        '**/.pnpm-store/**',
      ]
    }
  }
})
