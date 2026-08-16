# ADR-001 — Client-side composition

## Context

U3 delivered CloudOps Control as a single Vite React bundle. U4 required Operations and FinOps to load as separate deployable frontends while the user still sees one application (layout, navigation, dashboard).

Options considered for composition: build-time packages only, server-side includes, iframes, and Module Federation in the browser.

The toolchain is Vite 8 with `@originjs/vite-plugin-federation`. Remotes emit `remoteEntry.js` at **build** time, not under Vite’s bundleless `dev` server.

## Decision

Compose the product **in the browser**:

- Shell is the Federation **host** on port **5000**.
- Operations and FinOps are **remotes** on **5001** and **5002**, exposing page/summary modules.
- The host uses `React.lazy` + dynamic `import("operations/…")` / `import("finops/…")`.
- Shared runtime libraries via Federation are **only** `react` and `react-dom` (singleton).
- The supported run path is `npm start`: build remotes and shell, then `vite preview` for all three.

TypeScript remote specifiers are declared in `apps/shell/src/federation-shims/`.

## Alternatives

1. **Keep a monolith (U3)** — simpler, but does not demonstrate independent remotes.
2. **npm workspace imports only** — compile-time coupling; the host bundle would include MFE pages; no `remoteEntry.js`.
3. **iframes** — strong isolation, weak UX (layout, a11y, shared environment), extra chrome.
4. **Server-side composition** — no SSR/CDN assembler exists in this prototype.
5. **Webpack Module Federation** — would replace the Vite toolchain used since U3.

## Consequences

- Three builds and three preview processes are mandatory for the composed app.
- Host depends on hardcoded `http://localhost:5001|5002/assets/remoteEntry.js`.
- Vite 8 + originjs requires preview-only remotes and a CSS `remoteEntry` workaround.
- Isolation of React render errors is possible per `RemoteSlot`; network/config failures of remotes become user-visible fallbacks rather than a blank host, if the error is thrown into the boundary.
- Independent production deployments are a future step, not part of this repo.
