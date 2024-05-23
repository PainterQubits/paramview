import path, { resolve } from "path";
import license from "rollup-plugin-license";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
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
  build: {
    outDir: "paramview/static",
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      plugins: [
        license({
          thirdParty: {
            allow: {
              test: "(MIT OR BSD-3-Clause)",
              failOnUnlicensed: true,
              failOnViolation: true,
            },
            output: {
              file: path.resolve(__dirname, "./paramview/static/assets/licenses.txt"),
            },
          },
        }),
      ],
    },
  },
  esbuild: {
    banner: "/* licenses: /assets/licenses.txt */",
    legalComments: "none",
  },
});
