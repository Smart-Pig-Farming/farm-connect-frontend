import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  // Accept VITE_API_URL, falling back to local dev backend.
  // If user sets VITE_API_URL to a full URL (http...), use that for proxy target.
  // If it's empty or relative, we just proxy to localhost for dev.
  const apiEnv = env.VITE_API_URL?.trim();
  const proxyTarget =
    apiEnv && apiEnv.startsWith("http")
      ? apiEnv.replace(/\/api\/?$/, "")
      : "http://localhost:5000";

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      port: 5173,
      proxy: {
        "/api": {
          target: proxyTarget,
          changeOrigin: true,
        },
      },
    },
  };
});
