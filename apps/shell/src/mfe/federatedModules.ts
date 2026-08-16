import { lazy } from "react";

export const FederatedServicesPage = lazy(() => import("operations/ServicesPage"));
export const FederatedIncidentsPage = lazy(() => import("operations/IncidentsPage"));
export const FederatedOperationsSummary = lazy(() => import("operations/OperationsSummary"));
export const FederatedOperationsSettings = lazy(() =>
  import("operations/OperationsSummary").then((mod) => ({ default: mod.OperationsSettings })),
);
export const FederatedCostsPage = lazy(() => import("finops/CostsPage"));
export const FederatedFinOpsSummary = lazy(() => import("finops/FinOpsSummary"));
export const FederatedFinOpsSettings = lazy(() =>
  import("finops/FinOpsSummary").then((mod) => ({ default: mod.FinOpsSettings })),
);
