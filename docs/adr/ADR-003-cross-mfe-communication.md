# ADR-003 — Cross-MFE communication

## Context

The environment selector lives in the shell header. Operations and FinOps must reload DEV / QA / PROD data when it changes. Zustand stores are not shared (ADR-004). Federated pages no longer take `environment` props.

Requirements from the implementation:

- Event **`cloudops:environment-changed`** (`CLOUDOPS_EVENT`)
- Payload `{ environment: "DEV" | "QA" | "PROD" }`
- Initial value available if a remote mounts after the first publish (`window.__CLOUDOPS_ENVIRONMENT__`)
- Listeners must be removable (no duplicate handlers when several Operations views mount)

## Decision

Use a **same-window** contract in `@cloudops/contracts`:

- Event: `cloudops:environment-changed`
- Payload: `{ environment: "DEV" | "QA" | "PROD" }`
- Shell publishes the event (`useShellStore.setEnvironment`; `App` publishes on mount).
- Operations subscribes (`cloudOpsSync.ts`).
- FinOps subscribes (`cloudOpsSync.ts`).
- `publishCloudOpsEnvironment(environment)` writes `window.__CLOUDOPS_ENVIRONMENT__` and dispatches `new CustomEvent("cloudops:environment-changed", { detail: { environment } })`.
- `subscribeCloudOpsEnvironment(listener)` adds `window.addEventListener` and returns a function that calls `removeEventListener`.
- `getSharedEnvironment()` reads the snapshot, defaulting to `"PROD"`.
- Payload validation: `isCloudOpsEventPayload`.

Remotes: `cloudOpsSync.ts` ref-counts subscribers so Services + Incidents + Summary share **one** listener; cleanup runs when the count reaches zero. On bootstrap, remotes apply `getSharedEnvironment()` and load data.

## Alternatives

1. **Pass `environment` props** from shell into federated components — couples mount API to every expose; stale if a remote is already mounted.
2. **Shared Zustand store via Federation `shared`** — rejected in ADR-004.
3. **`BroadcastChannel` / `localStorage` events** — useful across tabs/origins; this prototype is one window and one origin per app (remotes loaded as modules into the shell origin).
4. **URL query `?env=`** — shareable links, but not implemented; selector is header state only.
5. **Custom event bus package with topics** — more than one event exists in the product today.

## Consequences

- Contract changes (event name or payload) break synchronization until both sides rebuild; there is no schema registry.
- Remotes running **standalone** call `publishCloudOpsEnvironment("PROD")` in `main.tsx`; they do not read the shell selector.
- Duplicate listeners are a real bug class; tests cover ref-counting and unsubscribe.
- No cross-origin bus: if remotes were iframed on another origin, this contract would not apply.
