import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  resolve: {
    // mesmo atalho do tsconfig: "@/src/..." aponta para a raiz do projeto
    alias: { '@': fileURLToPath(new URL('./', import.meta.url)) }
  },
  test: {
    environment: 'jsdom',
    include: ['test/**/*.test.{ts,tsx}'],
    setupFiles: ['test/setup.ts'],
    // CSS importado pelos componentes não importa nos testes
    css: false,
    env: { TZ: 'America/Sao_Paulo' }
  }
})
