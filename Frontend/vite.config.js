import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwind from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwind()],
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    proxy: {
      "/api": {
        target: "http://backend:8000",
        changeOrigin: true,
        // Mirrors your prod Nginx `proxy_pass http://backend:8000/` behavior
        //rewrite: (p) => p.replace(/^\/api/, ""),
      },
    },
  },
});
