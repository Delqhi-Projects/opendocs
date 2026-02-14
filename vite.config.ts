import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { visualizer } from "rollup-plugin-visualizer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
    visualizer({
      filename: './dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    target: 'es2022',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        passes: 2,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('mermaid')) return 'mermaid';
            if (id.includes('katex')) return 'katex';
            if (id.includes('cytoscape') || id.includes('d3-') || id.includes('d3/') || id.includes('@radixlunch')) return 'graphs';
            if (id.includes('@xyflow/react') || id.includes('reactflow')) return 'workflow';
            if (id.includes('framer-motion')) return 'animation';
            if (id.includes('lucide-react')) return 'icons';
            if (id.includes('excalidraw')) return 'draw';
            if (id.includes('react/') || id.includes('react-dom/') || id.includes('/react') || id.includes('/react-dom') || id.includes('scheduler')) return 'react-vendor';
            if (id.includes('zustand')) return 'state';
            if (id.includes('@supabase/supabase-js')) return 'db';
            if (id.includes('dompurify')) return 'sanitize';
            if (id.includes('@dnd-kit')) return 'dnd';
            if (id.includes('idb')) return 'storage';
            if (id.includes('expr-eval')) return 'expr';
            return 'vendor';
          }
        },
      },
    },
    chunkSizeWarningLimit: 500,
    sourcemap: false,
    cssCodeSplit: true,
    manifest: true,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'zustand'],
  },
});
