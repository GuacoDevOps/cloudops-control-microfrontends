# ADR-002 — Domain boundaries

## Context

The monolith mixed operational health (services, incidents) and financial metrics (costs) in one store and one mock API. U4 asked for recognizable **business domains** that could later move to separate teams and repositories.

The UI still needs a single shell: dashboard, sidebar, environment selector.

## Decision

Split the frontend into three applications aligned with domains:

| App | Domain responsibility |
| --- | --- |
| `apps/shell` | Application chrome, routing, environment selection, composition, error boundaries |
| `apps/operations-mfe` | Services, incidents (filters, acknowledge, resolve), operational summary, Operations mock API |
| `apps/finops-mfe` | Costs, breakdown, variation, FinOps mock API |

Cross-cutting code that is not a domain:

- `@cloudops/contracts` — `Environment`, event `cloudops` (`CLOUDOPS_EVENT`), `ServiceStatus`
- `@cloudops/design-system` — shared presentational components and CSS tokens

Federated **exposes** match domain UI, not a generic widget dump. Dashboard pulls **summaries** from both remotes instead of reimplementing metrics in the shell.

A Vitest file (`architecture.test.ts`) fails if Shell imports Operations/FinOps stores or if the two MFEs import each other’s stores.

## Alternatives

1. **Two remotes but one shared domain package** for all entities — faster to code, weak team boundaries.
2. **Shell owns dashboard metrics** by calling both mock APIs — shell becomes an orchestrator of domain data.
3. **More remotes** (e.g. Incidents vs Services as separate MFEs) — extra Federation surface for little academic gain.
4. **UI-only split** (folders in one app) — does not produce independent `remoteEntry.js`.

## Consequences

- Duplicate mock latency/error simulation per domain (`simulateApiError` in each store).
- Environment must be communicated explicitly (see ADR-003); the shell cannot set MFE state by store import.
- Design-system and contracts become the allowed shared surface; leaking a new shared store would violate the test and this ADR.
- Standalone `main.tsx` routers in remotes duplicate a subset of routes for isolated preview; they are not the product router.
