import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      // Проксируем запросы /api к бэкенду (localhost:4000)
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, "/api")
      }
    }
  },
  resolve: {
    alias: {
      "@": "/src"
    }
  }
});
