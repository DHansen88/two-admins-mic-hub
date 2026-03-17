import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { rssFeedPlugin } from "./plugins/rss-sitemap";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // Use relative paths so the site works inside any directory (e.g. /public_html/)
  base: "./",
  server: {
    host: "::",
    port: 8080,
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    rssFeedPlugin(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Allow importing .md files as raw strings
  assetsInclude: [],
}));
