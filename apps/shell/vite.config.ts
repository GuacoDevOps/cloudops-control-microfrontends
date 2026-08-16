/// <reference types="vitest/config" />
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import * as originFederation from "@originjs/vite-plugin-federation";
import type { Plugin } from "vite";

const federation = (
  originFederation as unknown as { default: (options: object) => Plugin }
).default;

const rootDir = fileURLToPath(new URL("../..", import.meta.url));
const isVitest = Boolean(process.env.VITEST);

const shared = {
  react: { singleton: true, requiredVersion: "^19.2.8" },
  "react-dom": { singleton: true, requiredVersion: "^19.2.8" },
};

export default defineConfig({
  plugins: [
    react(),
    ...(!isVitest
      ? [
          federation({
            name: "shell",
            remotes: {
              operations: "http://localhost:5001/assets/remoteEntry.js",
              finops: "http://localhost:5002/assets/remoteEntry.js",
            },
            shared,
          }),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@cloudops/contracts": path.join(rootDir, "packages/contracts/src/index.ts"),
      "@cloudops/design-system/styles/global.css": path.join(
        rootDir,
        "packages/design-system/src/styles/global.css",
      ),
      "@cloudops/design-system": path.join(rootDir, "packages/design-system/src/index.ts"),
    },
    dedupe: ["react", "react-dom"],
  },
  server: {
    port: 5000,
    strictPort: true,
    fs: { allow: [rootDir] },
  },
  preview: {
    port: 5000,
    strictPort: true,
    cors: true,
  },
  build: {
    target: "esnext",
    modulePreload: false,
    minify: false,
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: [],
  },
});
