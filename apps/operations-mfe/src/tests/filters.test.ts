import { describe, it, expect, beforeEach } from "vitest";
import useOperationsStore, { resetOperationsLoadCounter } from "../store/useOperationsStore";
import { selectFilteredIncidents } from "../store/selectors";
import type { Incident } from "../store/types";

const INCIDENTS: Incident[] = [
  {
    id: "i1",
    service: "api-payments",
    title: "High latency in payment processing",
    severity: "critical",
    status: "open",
    environment: "PROD",
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "i2",
    service: "api-orders",
    title: "Slow order queries",
    severity: "warning",
    status: "acknowledged",
    environment: "PROD",
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "i3",
    service: "frontend-web",
    title: "CSS build artifacts missing",
    severity: "info",
    status: "resolved",
    environment: "PROD",
    createdAt: "2026-01-01T00:00:00Z",
  },
];

beforeEach(() => {
  resetOperationsLoadCounter();
  useOperationsStore.setState({
    environment: "PROD",
    services: [],
    incidents: INCIDENTS,
    loading: false,
    error: null,
    incidentFilters: { search: "", severity: "all", status: "all" },
  });
});

describe("Incident filters", () => {
  it("combines severity, status, and search", () => {
    const store = useOperationsStore.getState();
    store.setSeverityFilter("critical");
    store.setStatusFilter("open");
    store.setSearchFilter("payment");

    const filtered = selectFilteredIncidents(useOperationsStore.getState());
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe("i1");
  });

  it("resetFilters restores the full list", () => {
    const store = useOperationsStore.getState();
    store.setSeverityFilter("info");
    store.setSearchFilter("css");
    expect(selectFilteredIncidents(useOperationsStore.getState())).toHaveLength(1);

    store.resetFilters();
    expect(selectFilteredIncidents(useOperationsStore.getState())).toHaveLength(3);
  });
});
