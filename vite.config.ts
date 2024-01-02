import { resolve } from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  build: {
    outDir: "paramview/static",
    chunkSizeWarningLimit: 1000,
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:5050",
      },
      "/socket.io": {
        target: "ws://127.0.0.1:5050",
        ws: true,
      },
    },
  },
  plugins: [react()],
});
