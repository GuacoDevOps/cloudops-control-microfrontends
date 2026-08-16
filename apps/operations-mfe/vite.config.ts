/// <reference types="vitest/config" />
import fs from "node:fs";
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

function fixFederationCssForVite8(): Plugin {
  return {
    name: "fix-federation-css-vite8",
    apply: "build",
    closeBundle() {
      const candidates = [
        path.resolve("dist/assets/remoteEntry.js"),
        path.resolve("dist/remoteEntry.js"),
      ];
      for (const remoteEntry of candidates) {
        if (!fs.existsSync(remoteEntry)) continue;
        const code = fs.readFileSync(remoteEntry, "utf8");
        const next = code
          .replace(/`__v__css__[^`]*`/g, "[]")
          // Vite 8 leaves `assets` unused; CSS is emitted under /assets/.
          .replace(
            /dynamicLoadingCss\(\["(?!assets\/)([^"]+\.css)"\]/g,
            'dynamicLoadingCss(["assets/$1"]',
          );
        if (next !== code) {
          fs.writeFileSync(remoteEntry, next);
        }
      }
    },
  };
}

export default defineConfig({
  base: "http://localhost:5001/",
  plugins: [
    react(),
    ...(!isVitest
      ? [
          federation({
            name: "operations",
            filename: "remoteEntry.js",
            exposes: {
              "./ServicesPage": "./src/modules/services/ServicesPage.tsx",
              "./IncidentsPage": "./src/modules/incidents/IncidentsPage.tsx",
              "./OperationsSummary": "./src/modules/dashboard/OperationsSummary.tsx",
            },
            shared,
          }),
          fixFederationCssForVite8(),
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
    port: 5001,
    strictPort: true,
    cors: true,
    fs: { allow: [rootDir] },
  },
  preview: {
    port: 5001,
    strictPort: true,
    cors: true,
  },
  build: {
    target: "esnext",
    modulePreload: false,
    minify: false,
    cssCodeSplit: false,
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: [],
  },
});
