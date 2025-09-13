import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
// Removed eager import of server (caused DB connect at build time). We'll lazy-load in dev plugin.

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: "/",
  server: {
    host: "::",
    port: 8080,
    allowedHosts: [
      '0e7949daa008.ngrok-free.app' // your ngrok host
    ],

  },
  build: {
    outDir: "build",
    emptyOutDir: true,
    sourcemap: false,
    minify: "esbuild",
    target: "es2020", // Updated for better optimization
    cssMinify: "esbuild",
    esbuild: {
      drop: ["console", "debugger"],
      legalComments: "none",
      treeShaking: true,
    },
    rollupOptions: {
      onwarn(warning, warn) {
        if (typeof warning.message === 'string' && warning.message.includes('Error when using sourcemap for reporting an error')) {
          return;
        }
        warn(warning);
      },
      output: {
        manualChunks: {
          react: ["react", "react-dom"],
          router: ["react-router-dom"],
          motion: ["framer-motion"],
          radix: ["@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu"],
          query: ["@tanstack/react-query"],
          icons: ["lucide-react"],
        },
        // Optimize chunk names for caching
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    chunkSizeWarningLimit: 300, // Even smaller chunks for mobile
    assetsDir: "assets",
    copyPublicDir: true,
    // Enable compression and optimization
    assetsInlineLimit: 2048, // Smaller inline limit for mobile
  },
  plugins: [react(), ...(mode === "development" ? [expressPlugin()] : [])],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
  define: {
    "process.env.NODE_ENV": JSON.stringify(mode),
  },
}));

function expressPlugin(): Plugin {
  return {
    name: "express-plugin",
    apply: "serve", // Only apply during development (serve mode)
    async configureServer(server) {
      const { createServer } = await import('./server');
      const app = createServer();
      server.middlewares.use(app); // Attach Express
    },
  };
}
