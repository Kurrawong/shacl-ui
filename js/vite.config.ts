import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

function preserveSubpathImports() {
  return {
    name: 'preserve-subpath-imports',
    resolveId(id: string, importer: any) {
      // Preserve the exact import paths for these specific imports
      if (id === '@rdfjs/data-model/Factory' || id === 'clownface/Factory') {
        return { id, external: true, moduleSideEffects: false }
      }
    }
  }
}

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
        '@rdfjs/dataset',
        '@xstate/vue',
        'clownface',
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
        paths: {
          '@rdfjs/data-model/Factory': '@rdfjs/data-model/Factory',
          'clownface/Factory': 'clownface/Factory'
        }
      }
    },
    sourcemap: true,
    // Reduce bloat from legacy polyfills.
    target: 'esnext',
    // Leave minification up to applications.
    minify: false
  },
  plugins: [vue(), preserveSubpathImports()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
