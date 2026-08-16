# CloudOps Control Microfrontends

React + TypeScript prototype that monitors service health, incidents, and cloud spend across **DEV**, **QA**, and **PROD**. The product is composed in the browser: an **App Shell** hosts **Operations** and **FinOps** remotes through Module Federation (`@originjs/vite-plugin-federation`).

This repository is an **npm workspaces** monorepo. There is no Nx, Turborepo, Docker, Kubernetes, or cloud deployment.

## Overview

| App | Package | Role | Preview port |
| --- | --- | --- | --- |
| Shell | `@cloudops/shell` | Layout, routing, environment selector, host | 5000 |
| Operations MFE | `@cloudops/operations-mfe` | Services, incidents, operational summary | 5001 |
| FinOps MFE | `@cloudops/finops-mfe` | Costs and FinOps summary | 5002 |

Shared libraries in the same repo:

- `@cloudops/contracts` — `Environment`, event `cloudops`, snapshot `window.__CLOUDOPS_ENVIRONMENT__`
- `@cloudops/design-system` — `MetricCard`, `StatusBadge`, `LoadingState`, `ErrorState`, `EmptyState`, `DomainIndicator`, CSS tokens

Data comes from **in-memory mock APIs** inside each MFE (`mockOperationsApi`, `mockFinOpsApi`). There is no backend.

## Business Context

CloudOps Control is a control-plane UI for a fictitious platform team:

- **Operations** answers “are services healthy?” and “what incidents are open?”
- **FinOps** answers “what is monthly spend and how did it change?”
- **Environment** (DEV / QA / PROD) is a global context owned by the shell. Changing it must reload domain data in each MFE without sharing Zustand stores.

The same UI is used for academic comparison of a monolith (U3) versus client-side microfrontends (U4).

## Evolution from U3

**U3** was a single Vite React app: one `src/`, one store, one mock API, routes for dashboard, services, incidents, and costs in the same bundle.

**U4** (this repo) keeps the product and mock data model, and splits runtime ownership:

- Shell owns chrome and React Router.
- Operations owns services/incidents state and mock persistence.
- FinOps owns cost state and mock costs.
- Composition happens at runtime via `remoteEntry.js`, not via static imports of MFE pages into the shell source (except TypeScript shims).

The workspace folder name may still be `cloudops-control-frontend`; the root package name is `cloudops-control-microfrontends`.

## Architecture

See [docs/architecture.md](docs/architecture.md) and [docs/adr](docs/adr).

### Domains

- **Shell:** navigation, header, environment selector, dashboard composition, failure isolation wrappers.
- **Operations:** services list, incidents (filters, acknowledge, resolve), operational metrics, simulate Operations API error.
- **FinOps:** costs (monthly, previous month, difference, variation %), breakdown ratios, simulate FinOps API error.

Stores must not cross domain boundaries. This is enforced by a source-scan test in Operations (`architecture.test.ts`).

### App Shell

- `createBrowserRouter`: `/`, `/services`, `/incidents`, `/costs`.
- `MainLayout` + `Sidebar` + `Header` (environment `<select>`).
- `useShellStore`: `selectedEnvironment` (default `"PROD"`) and `setEnvironment`, which also calls `publishCloudOpsEnvironment`.
- On mount, `App` republishes the current environment so remotes can bootstrap from the snapshot.
- Federated modules are `React.lazy` imports of `operations/*` and `finops/*`, each wrapped in `RemoteSlot` (Suspense + `RemoteErrorBoundary`).

### Operations MFE

Exposes:

- `./ServicesPage`
- `./IncidentsPage`
- `./OperationsSummary` (also re-exports `OperationsSettings` for the dashboard simulate-error control)

`useOperationsStore` holds environment, services, incidents, loading/error, and incident filters. Acknowledge/resolve update the store **and** the in-memory mock (`incidentsData`). Environment-scoped lists come from `getServices` / `getIncidents`.

Standalone entry (`src/main.tsx`) can serve `/services` and `/incidents` without the shell (preview of the remote’s own `index.html`). That path is not the federated product UX.

### FinOps MFE

Exposes:

- `./CostsPage`
- `./FinOpsSummary` (also re-exports `FinOpsSettings`)

`useFinOpsStore` holds environment, `costSummary`, `costBreakdown`, loading/error. Mock costs (PROD 12850/11200, QA 4320/4100, DEV 1480/1600). Breakdown: Compute 45%, Database 25%, Networking 12%, Storage 10%, Observability 8%.

Standalone entry serves `/costs`.

### Module Federation

Plugin: `@originjs/vite-plugin-federation`.

- Host remotes: `http://localhost:5001/assets/remoteEntry.js`, `http://localhost:5002/assets/remoteEntry.js`.
- Shared **only**: `react` and `react-dom` as **singletons** (`requiredVersion: ^19.2.8`). Vite `resolve.dedupe` for the same pair.
- **Not shared:** Zustand, React Router, lucide-react, design-system, contracts (those last two are workspace source aliases at build time).
- Federation plugin is skipped when `VITEST` is set.
- Remotes set `base` to their preview origin, `cssCodeSplit: false`, `modulePreload: false`, `target: esnext`, `minify: false`. A small build plugin rewrites Vite 8 `__v__css__` placeholders in `remoteEntry.js` if present.

**Do not use `vite dev` for remotes.** `remoteEntry.js` is produced at **build** time. `npm start` builds then runs `vite preview` on all three apps.

### Client-side Composition

The shell never statically imports Operations/FinOps page implementations. It lazy-loads federated modules. TypeScript uses `apps/shell/src/federation-shims/*.d.ts` plus `tsconfig` paths, because bundler resolution does not type remote specifiers.

### State Ownership

Three independent Zustand stores. No store is listed in Federation `shared`. Shell does not import `useOperationsStore` or `useFinOpsStore`.

### Cross-MFE Communication

The only runtime bus is a **window** `CustomEvent` named `"cloudops"` (`CLOUDOPS_EVENT`), payload `{ environment: "DEV" | "QA" | "PROD" }`. Helpers live in `packages/contracts/src/events.ts`.

`packages/contracts/src/mfe.ts` still exports unused placeholder types (`MicrofrontendMountProps`, `InterMicrofrontendContract`). Federated pages do **not** receive `environment` as props; they sync via the event and snapshot.

### Environment Event

1. Shell selector → `setEnvironment` → `publishCloudOpsEnvironment`.
2. Snapshot: `window.__CLOUDOPS_ENVIRONMENT__`.
3. Each MFE `cloudOpsSync` uses ref-counted `subscribeCloudOpsEnvironment` (unsubscribe when the last consumer unmounts), bootstraps with `getSharedEnvironment()`, and reloads domain data when the environment changes.

Default environment if the snapshot is missing: **PROD**.

## Project Structure

```text
cloudops-control-microfrontends/
├── package.json                 # workspaces: apps/*, packages/*
├── package-lock.json
├── tsconfig.json
├── tsconfig.base.json
├── .oxlintrc.json
├── README.md
├── docs/
│   ├── architecture.md
│   ├── phase-1.md
│   └── adr/
│       ├── ADR-001-client-side-composition.md
│       ├── ADR-002-domain-boundaries.md
│       ├── ADR-003-cross-mfe-communication.md
│       └── ADR-004-state-ownership.md
├── apps/
│   ├── shell/                   # host @cloudops/shell
│   │   ├── vite.config.ts
│   │   └── src/
│   │       ├── app/             # App, router, Dashboard, route wrappers
│   │       ├── components/layout/
│   │       ├── mfe/             # RemoteSlot, error boundary, lazy remotes
│   │       ├── store/useShellStore.ts
│   │       ├── federation-shims/
│   │       └── tests/
│   ├── operations-mfe/          # remote @cloudops/operations-mfe
│   │   └── src/
│   │       ├── modules/         # services, incidents, dashboard summary
│   │       ├── store/
│   │       ├── services/mockOperationsApi.ts
│   │       ├── data/mockOperationsData.ts
│   │       └── tests/
│   └── finops-mfe/              # remote @cloudops/finops-mfe
│       └── src/
│           ├── modules/costs/
│           ├── store/
│           ├── services/mockFinOpsApi.ts
│           ├── data/mockFinOpsData.ts
│           └── tests/
└── packages/
    ├── contracts/src/           # environment, events, status, leftover mfe types
    └── design-system/src/       # UI primitives + tokens.css + global.css
```

## Installation

Requires Node.js and npm (lockfile is npm).

```bash
npm install
```

## Running

Module Federation for this stack is **build + preview**, not Vite HMR remotes.

```bash
npm start
```

That script:

1. Builds Operations, then FinOps, then Shell (`tsc -b && vite build` per app).
2. Starts three `vite preview` processes with `concurrently` (`-k`).

Open **http://localhost:5000**

Individual previews (after a build):

```bash
npm run preview:operations   # :5001
npm run preview:finops       # :5002
npm run preview:shell        # :5000 — needs remotes already previewing
```

`npm run dev` at the root only prints a message to use `npm start`. Workspace `dev` scripts exist (`vite --port …`) but remotes will not expose a working `remoteEntry.js` in that mode.

## Build

```bash
npm run build
```

Order: `build:operations` → `build:finops` → `build:shell`.

```bash
npm run build:operations
npm run build:finops
npm run build:shell
```

## Tests

Vitest + jsdom (and Testing Library where UI is asserted).

```bash
npm run test
```

Runs, in order:

1. `@cloudops/operations-mfe` — acknowledge, resolve, filters, environment, event contract, store isolation
2. `@cloudops/finops-mfe` — environment listener, cost variation
3. `@cloudops/shell` — environment publish, RemoteErrorBoundary fallbacks

```bash
npm run lint    # oxlint (apps + packages; ignores node_modules and dist)
```

There is no E2E suite and no CI workflow in this repository.

## Failure Isolation

Each federated region is wrapped in `RemoteErrorBoundary` + `Suspense` (`RemoteSlot`).

- Operations failure message: `Cloud Operations module is temporarily unavailable.`
- FinOps failure message: `FinOps module is temporarily unavailable.`
- **Retry** remounts children (`retryKey`).
- The shell chrome (sidebar, header) stays mounted if a remote throws.
- Mock API errors stay inside the MFE (`ErrorState` + retry / simulate buttons). They are not the same as a failed `import("operations/…")`.

Dashboard uses `display: contents` on the error-boundary host so Operations metric cards still participate in the CSS grid when healthy.

## Design System

Workspace package `@cloudops/design-system`. Apps alias it to source in Vite. Components listed above; styles: `tokens.css`, `global.css`. `DomainIndicator` shows the domain name (“Cloud Operations” / “FinOps”). There is no published Storybook or npm registry.

## Architecture Decisions

| ADR | Decision |
| --- | --- |
| [ADR-001](docs/adr/ADR-001-client-side-composition.md) | Compose remotes in the browser with Module Federation |
| [ADR-002](docs/adr/ADR-002-domain-boundaries.md) | Shell / Operations / FinOps as separate apps |
| [ADR-003](docs/adr/ADR-003-cross-mfe-communication.md) | `cloudops` CustomEvent + window snapshot |
| [ADR-004](docs/adr/ADR-004-state-ownership.md) | One Zustand store per app; do not share Zustand |

## Trade-offs

Documented in depth in [docs/architecture.md](docs/architecture.md#trade-offs):

- Higher technical complexity than the U3 monolith (three builds, preview orchestration, federation shims).
- Runtime and compile-time **dependence on contracts** (`Environment`, event name, payload).
- **Possible library duplication** (Zustand, React Router, lucide-react are not Federation singletons).
- **Observability** is local (`console` / React error boundary). There is no distributed tracing of remotes.
- **Governance** is convention + a store-isolation test, not a platform team process.
- **UX consistency** relies on the design-system package, not a design ops pipeline.
- **Versioning** is a single monorepo `0.1.0`; remote URLs are hardcoded localhost paths.
- **Performance:** extra network hops for `remoteEntry.js`; production builds are unminified (`minify: false`) by design in current Vite configs.

## Known Limitations

- Federation + Vite 8 + originjs is **preview-only** for remotes.
- Remote URLs are localhost; no environment-specific CDN.
- No independent git repos, pipelines, or deployments (see deployment concept in architecture.md).
- Event bus is same-window only; it does not cross origins.
- Types for `operations/*` / `finops/*` are shims, not generated federated types.
- `InterMicrofrontendContract` in contracts is unused at runtime.
- Standalone MFE routers are separate from the shell router.
- No authentication, no real APIs, no cloud infrastructure.

## Academic Purpose

This project is a master’s coursework artifact (Arquitectura de software). It demonstrates client-side microfrontends, domain boundaries, an explicit environment event, independent state, and failure isolation in a **prototype**, not a production platform.
