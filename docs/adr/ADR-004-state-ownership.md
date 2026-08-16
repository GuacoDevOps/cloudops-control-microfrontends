# ADR-004 — State ownership

## Context

U3 used one Zustand store for environment, services, incidents, and costs. Sharing that store across federated remotes would re-create a distributed monolith: any MFE could mutate another domain’s data, and Zustand would need to be a Federation singleton with compatible versions.

U4 requires independent domain data, mock APIs, and the ability for one remote to fail without wiping the other’s state.

## Decision

**One Zustand store per application. Do not share Zustand (or React Router) through Module Federation.**

| Owner | Store | Data |
| --- | --- | --- |
| Shell | `useShellStore` | `selectedEnvironment` only |
| Operations | `useOperationsStore` | services, incidents, filters, Operations loading/error |
| FinOps | `useFinOpsStore` | cost summary, breakdown, FinOps loading/error |

Environment **copies** exist in Operations and FinOps stores; they are updated by the `cloudops:environment-changed` event (`CLOUDOPS_EVENT`, ADR-003), not by importing `useShellStore`.

Incident acknowledge/resolve update Operations store state and the Operations mock module memory. FinOps does not see incidents.

Federation `shared` remains React + React DOM only (`apps/*/vite.config.ts`).

## Alternatives

1. **Federated shared Zustand** — one store module; breaks domain isolation and couples deploy versions of Zustand.
2. **Shell as the only store; remotes are dumb views** — remotes would need a large props/callback contract; acknowledge/resolve would live in the host.
3. **React Context from the shell** — still a shared runtime object graph; remotes would import shell internals.
4. **URL + props only** — no client cache of lists; every navigation would refetch; filters would be harder to keep local to Operations.
5. **Redux / Event Sourcing bus** — extra library not used in U3.

## Consequences

- Three sources of truth for “current environment” that must stay in sync via the event + snapshot.
- Possible duplicate Zustand copies in the page (not a Federation singleton).
- Tests must reset each store and mock API separately (`resetIncidentsData`, `resetOperationsLoadCounter`, sync test helpers).
- Adding a new domain means a new store and a new remote, not a new slice in a global store.
- Accidental imports of another app’s store are caught only by the architecture test and code review, not by the type system across packages (apps do not export stores as public APIs).
