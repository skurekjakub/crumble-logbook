import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

/** Vite config for the web app: file-based routes, React, and `/api` proxied to the local server. */
export default defineConfig({
  // The router plugin has to run before the React plugin so it sees the route files first.
  plugins: [tanstackRouter({ target: "react", autoCodeSplitting: true }), react()],
  server: {
    proxy: {
      "/api": "http://localhost:8787",
    },
  },
});
