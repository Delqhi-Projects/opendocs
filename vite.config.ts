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
            if (id.includes('cytoscape')) return 'cytoscape';
            if (id.includes('@xyflow/react') || id.includes('reactflow')) return 'react-flow';
            if (id.includes('framer-motion')) return 'framer-motion';
            if (id.includes('lucide-react')) return 'lucide';
            if (id.includes('excalidraw')) return 'excalidraw';
            if (id.includes('react/') || id.includes('react-dom/')) return;
            if (id.includes('/react') || id.includes('/react-dom')) return 'react-vendor';
            if (id.includes('zustand')) return 'zustand';
            if (id.includes('@supabase/supabase-js')) return 'supabase';
            if (id.includes('dompurify')) return 'dompurify';
            if (id.includes('d3-') || id.includes('d3/')) return 'd3';
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
