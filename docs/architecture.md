# Architecture — CloudOps Control Microfrontends

This document describes the **implemented** U4 architecture. It does not describe planned cloud platforms, independent pipelines, or features that are not in the repository.

## U3: React monolith

The previous increment was a single Vite application:

- One React tree and one router.
- One Zustand store for environment, services, incidents, and costs.
- One mock API and one `src/` tree for dashboard, services, incidents, and costs.

Composition was compile-time: pages imported modules from the same package.

## U4: Shell + Operations + FinOps

The same product is split into three Vite apps in an **npm workspaces** monorepo:

| Runtime | Workspace | Federation role |
| --- | --- | --- |
| App Shell | `apps/shell` | Host (`name: "shell"`) |
| Operations | `apps/operations-mfe` | Remote (`name: "operations"`) |
| FinOps | `apps/finops-mfe` | Remote (`name: "finops"`) |

Shared source packages: `packages/contracts`, `packages/design-system`.

```text
Browser (localhost)
  Shell :5000
    lazy import operations/ServicesPage | IncidentsPage | OperationsSummary
    lazy import finops/CostsPage | FinOpsSummary
  Operations :5001  →  /assets/remoteEntry.js
  FinOps     :5002  →  /assets/remoteEntry.js

window CustomEvent "cloudops"  { environment }
window.__CLOUDOPS_ENVIRONMENT__
```

## Domain boundaries

| Domain | Owns | Does not own |
| --- | --- | --- |
| Shell | Layout, React Router (product), environment selector, federated wrappers | Services, incidents, costs data |
| Operations | Mock services/incidents, filters, acknowledge/resolve, Operations summary/settings | Cost figures, shell navigation |
| FinOps | Mock costs, breakdown, variation math, FinOps summary/settings | Incidents, services, shell chrome |

Independence checks (`apps/operations-mfe/src/tests/architecture.test.ts`):

- Shell source must not mention `useOperationsStore` or `useFinOpsStore`.
- Operations must not mention `useFinOpsStore`.
- FinOps must not mention `useOperationsStore`.

`DomainIndicator` labels UI as “Cloud Operations” or “FinOps”.

## Federation

Implemented with `@originjs/vite-plugin-federation`.

**Host** (`apps/shell/vite.config.ts`):

- Remotes: `operations` → `http://localhost:5001/assets/remoteEntry.js`, `finops` → `http://localhost:5002/assets/remoteEntry.js`.
- `shared`: `react` and `react-dom` only, `singleton: true`, `requiredVersion: "^19.2.8"`.

**Operations exposes:** `./ServicesPage`, `./IncidentsPage`, `./OperationsSummary`.

**FinOps exposes:** `./CostsPage`, `./FinOpsSummary`.

Shell consumption (`apps/shell/src/mfe/federatedModules.ts`): `React.lazy(() => import("operations/…"))` and the FinOps equivalents. `OperationsSettings` and `FinOpsSettings` are taken from the summary modules’ named exports.

Plugin default import is unwrapped because the package’s ESM shape under current TypeScript settings is `{ default: federation }`. Federation is omitted when `process.env.VITEST` is set so unit tests do not load remotes.

Remotes use `base: http://localhost:5001/` or `5002/`, CORS on preview, `cssCodeSplit: false`, `modulePreload: false`. Optional `fixFederationCssForVite8` rewrites `` `__v__css__…` `` in `remoteEntry.js` after build.

**Operational constraint:** remotes must be **built** so `remoteEntry.js` exists. The supported developer path is `npm start` (build all, then `vite preview` × 3). Vite’s bundleless `dev` server is not the federated runtime.

## Routing

**Product (shell):** `createBrowserRouter` in `apps/shell/src/app/router.tsx`.

| Path | Shell wrapper | Federated UI |
| --- | --- | --- |
| `/` | `DashboardPage` | OperationsSummary + FinOpsSummary (+ settings) |
| `/services` | `ServicesRoute` | ServicesPage |
| `/incidents` | `IncidentsRoute` | IncidentsPage |
| `/costs` | `CostsRoute` | CostsPage |

Sidebar `NavLink`s match those paths. React Router is a **shell** dependency for the composed app. Remotes also declare `react-router` and ship **standalone** routers in `src/main.tsx` (Operations: `/services`, `/incidents`; FinOps: `/costs`). Those standalone routers are for previewing a remote’s `index.html`, not for nested routing inside the shell.

The shell does not share React Router via Federation.

## State

| Store | File | State |
| --- | --- | --- |
| `useShellStore` | `apps/shell/src/store/useShellStore.ts` | `selectedEnvironment`, `setEnvironment` |
| `useOperationsStore` | `apps/operations-mfe/src/store/useOperationsStore.ts` | environment, services, incidents, filters, loading, error, load/ack/resolve/simulate |
| `useFinOpsStore` | `apps/finops-mfe/src/store/useFinOpsStore.ts` | environment, costSummary, costBreakdown, loading, error, load/retry/simulate |

Zustand is **not** a Federation shared library. Each app instantiates its own store. Environment in Operations/FinOps is updated by `cloudOpsSync`, not by importing the shell store.

Mock persistence for incidents is module-level memory in `mockOperationsApi` (`acknowledgeIncident` / `resolveIncident` mutate `incidentsData`). Costs are read-only mocks keyed by environment.

## Events

Contract: `packages/contracts/src/events.ts`.

| Piece | Value |
| --- | --- |
| Event name | `"cloudops"` (`CLOUDOPS_EVENT`) |
| Payload | `{ environment: "DEV" \| "QA" \| "PROD" }` |
| Snapshot key | `window.__CLOUDOPS_ENVIRONMENT__` (`CLOUDOPS_ENVIRONMENT_KEY`) |
| Publish | `publishCloudOpsEnvironment` |
| Subscribe | `subscribeCloudOpsEnvironment` → `removeEventListener` on unsubscribe |
| Read snapshot | `getSharedEnvironment()` (fallback `"PROD"`) |

Flow:

1. `Header` calls `setEnvironment`.
2. Shell store updates and publishes.
3. `App` publishes once on mount (bootstrap if remotes load after first paint).
4. `useOperationsCloudOpsSync` / `useFinOpsCloudOpsSync` (ref-counted) apply environment and load data.

Invalid payloads are ignored (`isCloudOpsEventPayload`).

Leftover types in `packages/contracts/src/mfe.ts` (`MicrofrontendMountProps`, `InterMicrofrontendContract`) are **not** used as the runtime contract.

## Failure isolation

`RemoteSlot` = `RemoteErrorBoundary` + `Suspense` (`RemoteFallback` while lazy import is pending).

If a remote throw occurs during render (including a failed federated module that surfaces as an error), the boundary shows the configured message and **Retry**. Sibling remotes and shell layout remain.

Messages used in code:

- `Cloud Operations module is temporarily unavailable.`
- `FinOps module is temporarily unavailable.`
- Loading: `Loading Cloud Operations...` / `Loading FinOps...`

Simulated **API** errors (`simulateApiError` in each store) set `error` in that store and render `ErrorState` **inside** the remote. That path does not unmount the shell.

There is no circuit breaker, no health endpoint, and no retry of `remoteEntry.js` beyond remounting the React subtree.

## Design system

`packages/design-system` exports:

- `MetricCard`, `StatusBadge`, `LoadingState`, `ErrorState`, `EmptyState`, `DomainIndicator`
- CSS: `styles/tokens.css`, `styles/global.css`

Vite aliases `@cloudops/design-system` to `packages/design-system/src/index.ts`. Peer dependencies: `react`, `react-dom`, `lucide-react`. The package depends on `@cloudops/contracts` because `StatusBadge` types `ServiceStatus` from that package. `DomainIndicator` only takes a `name` string.

There is no token pipeline, Storybook, or visual regression suite.

## Deployment concept

**What exists:** three local preview servers after `npm run build`. URLs and ports are hardcoded in Vite configs. The monorepo exists so students can run one `npm install` and one `npm start`.

**What does not exist:** AWS/GCP/Azure, containers, CDNs, independent versioned remote URLs, CI workflows.

**Possible evolution (not implemented):**

- Split `apps/shell`, `apps/operations-mfe`, `apps/finops-mfe` into separate git repositories.
- Independent pipelines that produce `remoteEntry.js` artifacts.
- Independent deployments (host reads remotes from versioned HTTPS URLs instead of `localhost:5001/5002`).
- A contracts package published and versioned as a real dependency.

That evolution would require changing Federation `remotes` maps, shared library version policy, and contract versioning. None of that infrastructure is in this repo.

## Governance

Present in code:

- Shared `Environment` union and event helpers in `@cloudops/contracts`.
- Store-isolation test.
- Design-system as the shared UI kit.
- Domain labels in the UI.

Not present: RFC process, CODEOWNERS, changelog automation, semantic versioning of remotes, API review board.

`packages/contracts/src/status.ts` exports `ServiceStatus` (`healthy` | `warning` | `critical`) as a shared type.

## Trade-offs

### Mayor complejidad técnica

Three TypeScript projects, three Vite builds, federation plugin quirks (Vite 8 CSS placeholders, plugin skipped under Vitest, `federation` default interop), TypeScript shims for remote modules, and a start script that must build before preview. The U3 monolith had none of this.

### Dependencia de contratos

If `CLOUDOPS_EVENT` or the payload shape diverges, remotes silently miss updates (`isCloudOpsEventPayload` returns false). Environment lists must stay aligned with `ENVIRONMENTS`. The unused `mfe.ts` types can confuse readers; the live contract is `events.ts`.

### Posible duplicación de librerías

Only React and React DOM are Federation singletons. Zustand, React Router, and lucide-react are declared in each app. They may appear more than once in the composed page. Design-system and contracts are aliased from source at build time for each app, so they are bundled per remote rather than loaded as a shared federated module.

### Observabilidad distribuida

Failures surface as React error boundaries or MFE `ErrorState`. There is no correlation id, no remote load metrics, and no shared logging pipeline. `console.error` is mocked in error-boundary tests.

### Gobernanza

Boundaries are social + one static test. A developer can still couple domains through contracts or DOM events with new names. There is no runtime policy engine.

### Consistencia UX

Shared CSS tokens and components reduce drift, but each MFE has its own CSS modules. Shell layout (sidebar, header) is not part of the design-system package. Mobile sidebar behavior lives in shell CSS (`max-width: 768px`).

### Versionado

All packages are `0.1.0`. Remotes are not independently versioned. Changing a federated expose requires rebuilding host and remotes together in this prototype. Hardcoded `localhost` URLs mean there is no canary remote.

### Performance

- Extra HTTP requests for two `remoteEntry.js` files and their chunks.
- `minify: false` and `modulePreload: false` in current configs increase payload versus a minified monolith.
- `React.lazy` defers page modules until the route/dashboard needs them.
- `cssCodeSplit: false` on remotes ships CSS as a single remote stylesheet.

## Known implementation notes

- TypeScript for the host uses `federation-shims` and `ignoreDeprecations` / `paths` as configured in `apps/shell/tsconfig.app.json`.
- Parallel Operations loads use an `inFlight` counter (`resetOperationsLoadCounter` in tests).
- Cost variation is `selectCostVariation` in FinOps (`toFixed(1)` percentage string).
- Root lint is `oxlint` with ignore patterns for `node_modules` and `dist`.
