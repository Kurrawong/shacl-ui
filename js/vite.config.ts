import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['es'],
      fileName: (format, entryName) => {
        if (entryName === 'index') {
          return `index.js`
        }
        return `${entryName}.js`
      }
    },
    rollupOptions: {
      // Externalize deps that shouldn't be bundled into the library.
      external: [
        'vue',
        'primevue',
        '@comunica/query-sparql',
        '@hydrofoil/shape-to-query',
        '@rdfjs/data-model',
        '@rdfjs/data-model/Factory',
        '@rdfjs/dataset',
        '@xstate/vue',
        'clownface',
        'clownface/Factory',
        'grapoi',
        'n3',
        'primeicons',
        'rdf-ext',
        'shacl-engine',
        'sparqljs',
        'uuid',
        'vue-codemirror',
        'xstate'
      ],
      output: {
        globals: {
          vue: 'Vue',
          primevue: 'PrimeVue'
        },
        // Add this to create a separate chunk for composables
        preserveModules: true,
        preserveModulesRoot: 'src',
      }
    },
    sourcemap: true,
    // Reduce bloat from legacy polyfills.
    target: 'esnext',
    // Leave minification up to applications.
    minify: false
  },
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
