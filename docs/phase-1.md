Phase 2 notes

Module Federation uses @originjs/vite-plugin-federation.

Remotes must be built and served with `vite preview`. Vite dev (bundleless) is not used for remotes because remoteEntry.js is produced at build time.

Ports: shell 5000, operations 5001, finops 5002.
