import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      ignored: [
        '**/Docs/**',
        '**/01.SRS/**',
        '**/02.SDS/**',
        '**/03.SourceCode/**',
        '**/SRS/**',
        '**/SDS/**',
        '**/*.pdf',
        '**/*.7z',
        '**/*.sql'
      ]
    }
  }
})

