import { defineConfig } from "vite";
export default defineConfig({
  base: "./",
  server: {
    port: 3001,
    hmr: {
      clientPort: 443,
      protocol: "wss",
    },
  },
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes("kaplay")) return "kaplay";
        },
      },
    },
  },
});