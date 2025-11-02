import { defineConfig, transformWithEsbuild } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  server: {
    proxy: {
      '/stracker': {
        target: 'http://www:80',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/stracker/, '/public_html/stracker'),
      },
    },
  },
  resolve: {
    // https://medium.com/@pushplaybang/absolutely-dont-use-relative-paths-imports-in-your-vite-react-project-c8593f93bbea
    alias: {
      "@components": "/src/components",
      "@pages": "/src/pages",
      "@utilities": "/src/utilities",
      "@context": "/src/context",
      "@routes": "/src/routes",
    },
  },
  plugins: [
    {
      name: 'treat-js-files-as-jsx',
      async transform(code, id) {
        if (!id.match(/src\/.*\.js$/))  return null

        // Use the exposed transform from vite, instead of directly
        // transforming with esbuild
        return transformWithEsbuild(code, id, {
          loader: 'jsx',
          jsx: 'automatic',
        })
      },
    },
    react(),
  ],

  optimizeDeps: {
    force: true,
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
})