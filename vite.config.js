import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => {
    // VITE_API_URL points at a *different origin* than the frontend (localhost:3001
    // in dev, the Render URL in prod) — not a same-origin "/api" path. The runtime
    // caching rule below has to match on origin, not on pathname, for that reason.
    //
    // Important: vite-plugin-pwa serializes a function urlPattern via .toString(),
    // which captures the function's SOURCE TEXT ONLY, not variables closed over from
    // this config file. A function referencing `apiOrigin` would compile fine here but
    // throw "apiOrigin is not defined" inside the actual service worker at runtime.
    // A RegExp, by contrast, is serialized by value, so we build the pattern as a
    // RegExp instead of a function.
    const env = loadEnv(mode, process.cwd(), "");
    const apiOrigin = new URL(env.VITE_API_URL || "http://localhost:3001").origin;
    const escapedOrigin = apiOrigin.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const apiUrlPattern = new RegExp(`^${escapedOrigin}/`);

    return {
        plugins: [
            react(),
            tailwindcss(),
            VitePWA({
                registerType: "autoUpdate",
                includeAssets: ["apple-touch-icon.png"],
                manifest: {
                    name: "Todo",
                    short_name: "Todo",
                    description: "A personal daily todo list",
                    theme_color: "#0f172a",
                    background_color: "#0f172a",
                    display: "standalone",
                    start_url: "/",
                    icons: [
                        {
                            src: "icon-192.png",
                            sizes: "192x192",
                            type: "image/png"
                        },
                        {
                            src: "icon-512.png",
                            sizes: "512x512",
                            type: "image/png"
                        },
                        {
                            src: "icon-512.png",
                            sizes: "512x512",
                            type: "image/png",
                            purpose: "maskable"
                        }
                    ]
                },
                workbox: {
                    runtimeCaching: [
                        {
                            urlPattern: apiUrlPattern,
                            handler: "NetworkFirst",
                            options: {
                                cacheName: "api-cache",
                                networkTimeoutSeconds: 5,
                                cacheableResponse: {
                                    statuses: [0, 200]
                                }
                            }
                        }
                    ]
                }
            })
        ]
    };
});
