import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

function serveWorkspace(server) {
  server.middlewares.use((request, _response, next) => {
    const url = new URL(request.url, "http://localhost");
    if (/^\/(login|register|forgot-password|reset-password|user|admin)(\/|$)/.test(url.pathname)) {
      request.url = "/app.html" + url.search;
    }
    next();
  });
}

export default defineConfig({
  appType: "mpa",
  build: { rollupOptions: { input: ["index.html", "app.html"] } },
  plugins: [react(), tailwindcss(), {
    name: "workspace-routes",
    configureServer: serveWorkspace,
    configurePreviewServer: serveWorkspace,
  }],
  server: {
    port: 5173,
  },
});
