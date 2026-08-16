import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { IncidentTable } from "../modules/incidents/IncidentTable";
import useOperationsStore from "../store/useOperationsStore";
import type { Incident } from "../store/types";
import { resetIncidentsData, clearSimulatedError } from "../services/mockOperationsApi";

const TEST_INCIDENTS: Incident[] = [
  {
    id: "inc-1",
    service: "api-payments",
    title: "Payment service timeout",
    severity: "critical",
    status: "open",
    environment: "PROD",
    createdAt: "2026-08-07T10:00:00Z",
  },
  {
    id: "inc-2",
    service: "api-orders",
    title: "Order queue delay",
    severity: "warning",
    status: "acknowledged",
    environment: "PROD",
    createdAt: "2026-08-07T09:00:00Z",
  },
];

beforeEach(() => {
  resetIncidentsData();
  clearSimulatedError();
  useOperationsStore.setState({
    environment: "PROD",
    services: [],
    incidents: TEST_INCIDENTS,
    loading: false,
    error: null,
    incidentFilters: { search: "", severity: "all", status: "all" },
  });
});

describe("IncidentTable - Acknowledge action", () => {
  it("shows Acknowledge button for open incidents and updates status on click", () => {
    render(<IncidentTable incidents={TEST_INCIDENTS} />);

    const ackButton = screen.getByRole("button", {
      name: /acknowledge incident: payment service timeout/i,
    });
    expect(ackButton).toBeInTheDocument();

    fireEvent.click(ackButton);

    const updatedIncident = useOperationsStore
      .getState()
      .incidents.find((i) => i.id === "inc-1");
    expect(updatedIncident?.status).toBe("acknowledged");
  });

  it("shows Resolve button for acknowledged incidents", () => {
    render(<IncidentTable incidents={TEST_INCIDENTS} />);

    const resolveButton = screen.getByRole("button", {
      name: /resolve incident: order queue delay/i,
    });
    expect(resolveButton).toBeInTheDocument();
  });

  it("updates status from acknowledged to resolved on click", () => {
    render(<IncidentTable incidents={TEST_INCIDENTS} />);

    fireEvent.click(
      screen.getByRole("button", {
        name: /resolve incident: order queue delay/i,
      }),
    );

    const updatedIncident = useOperationsStore
      .getState()
      .incidents.find((i) => i.id === "inc-2");
    expect(updatedIncident?.status).toBe("resolved");
  });

  it("does not show action buttons for resolved incidents", () => {
    const resolvedIncident: Incident = {
      id: "inc-3",
      service: "database",
      title: "DB connection resolved",
      severity: "info",
      status: "resolved",
      environment: "PROD",
      createdAt: "2026-08-06T10:00:00Z",
    };

    render(<IncidentTable incidents={[resolvedIncident]} />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
