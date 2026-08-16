import { describe, it, expect, beforeEach } from "vitest";
import useOperationsStore, { resetOperationsLoadCounter } from "../store/useOperationsStore";
import type { Incident } from "../store/types";
import * as api from "../services/mockOperationsApi";

beforeEach(() => {
  api.resetIncidentsData();
  api.clearSimulatedError();
  resetOperationsLoadCounter();
  useOperationsStore.setState({
    environment: "PROD",
    services: [],
    incidents: [],
    loading: false,
    error: null,
    incidentFilters: { search: "", severity: "all", status: "all" },
  });
});

describe("Operations Store - acknowledgeIncident", () => {
  it("changes status from open to acknowledged", () => {
    const incident: Incident = {
      id: "test-1",
      service: "api-orders",
      title: "Test incident",
      severity: "critical",
      status: "open",
      environment: "PROD",
      createdAt: "2026-01-01T00:00:00Z",
    };

    useOperationsStore.setState({ incidents: [incident] });

    expect(useOperationsStore.getState().incidents[0].status).toBe("open");

    useOperationsStore.getState().acknowledgeIncident("test-1");

    expect(useOperationsStore.getState().incidents[0].status).toBe("acknowledged");
  });
});

describe("Operations Store - resolveIncident", () => {
  it("changes status from acknowledged to resolved", () => {
    const incident: Incident = {
      id: "test-2",
      service: "api-orders",
      title: "Test incident",
      severity: "warning",
      status: "acknowledged",
      environment: "PROD",
      createdAt: "2026-01-01T00:00:00Z",
    };

    useOperationsStore.setState({ incidents: [incident] });
    useOperationsStore.getState().resolveIncident("test-2");

    expect(useOperationsStore.getState().incidents[0].status).toBe("resolved");
  });
});

describe("Mock API - incidents by environment", () => {
  it("PROD does not receive DEV or QA incidents", async () => {
    const incidents = await api.getIncidents("PROD");

    expect(incidents.length).toBeGreaterThan(0);
    expect(incidents.every((incident) => incident.environment === "PROD")).toBe(true);
    expect(incidents.some((incident) => incident.environment === "DEV")).toBe(false);
    expect(incidents.some((incident) => incident.environment === "QA")).toBe(false);
  });

  it("DEV does not receive PROD incidents", async () => {
    const incidents = await api.getIncidents("DEV");

    expect(incidents.length).toBeGreaterThan(0);
    expect(incidents.every((incident) => incident.environment === "DEV")).toBe(true);
    expect(incidents.some((incident) => incident.environment === "PROD")).toBe(false);
  });

  it("QA returns only QA incidents", async () => {
    const incidents = await api.getIncidents("QA");

    expect(incidents.length).toBeGreaterThan(0);
    expect(incidents.every((incident) => incident.environment === "QA")).toBe(true);
  });
});

describe("Mock API - incident status persistence", () => {
  it("acknowledgeIncident changes open -> acknowledged and persists after getIncidents", async () => {
    const before = await api.getIncidents("PROD");
    const openIncident = before.find((incident) => incident.status === "open");
    expect(openIncident).toBeDefined();

    const updated = await api.acknowledgeIncident(openIncident!.id);
    expect(updated?.status).toBe("acknowledged");

    const after = await api.getIncidents("PROD");
    const persisted = after.find((incident) => incident.id === openIncident!.id);
    expect(persisted?.status).toBe("acknowledged");
  });

  it("resolveIncident changes acknowledged -> resolved and persists after getIncidents", async () => {
    const before = await api.getIncidents("PROD");
    const acknowledgedIncident = before.find((incident) => incident.status === "acknowledged");
    expect(acknowledgedIncident).toBeDefined();

    const updated = await api.resolveIncident(acknowledgedIncident!.id);
    expect(updated?.status).toBe("resolved");

    const after = await api.getIncidents("PROD");
    const persisted = after.find((incident) => incident.id === acknowledgedIncident!.id);
    expect(persisted?.status).toBe("resolved");
  });
});
