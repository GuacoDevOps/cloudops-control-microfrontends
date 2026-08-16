import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  CLOUDOPS_EVENT,
  getSharedEnvironment,
  isCloudOpsEventPayload,
  publishCloudOpsEnvironment,
  subscribeCloudOpsEnvironment,
  type CloudOpsEventPayload,
} from "@cloudops/contracts";
import useOperationsStore from "../store/useOperationsStore";
import { resetOperationsLoadCounter } from "../store/useOperationsStore";
import {
  resetOperationsCloudOpsSyncForTests,
  startOperationsCloudOpsSync,
} from "../store/cloudOpsSync";
import * as api from "../services/mockOperationsApi";

beforeEach(() => {
  api.resetIncidentsData();
  api.clearSimulatedError();
  resetOperationsCloudOpsSyncForTests();
  resetOperationsLoadCounter();
  window.__CLOUDOPS_ENVIRONMENT__ = "PROD";
  useOperationsStore.setState({
    environment: "PROD",
    services: [],
    incidents: [],
    loading: false,
    error: null,
    incidentFilters: { search: "", severity: "all", status: "all" },
  });
});

afterEach(() => {
  resetOperationsCloudOpsSyncForTests();
});

describe("CloudOps event contract", () => {
  it("uses the cloudops:environment-changed event name and environment payload", () => {
    expect(CLOUDOPS_EVENT).toBe("cloudops:environment-changed");
    expect(isCloudOpsEventPayload({ environment: "DEV" })).toBe(true);
    expect(isCloudOpsEventPayload({ environment: "QA" })).toBe(true);
    expect(isCloudOpsEventPayload({ environment: "PROD" })).toBe(true);
    expect(isCloudOpsEventPayload({ environment: "STAGE" })).toBe(false);
    expect(isCloudOpsEventPayload({})).toBe(false);
  });

  it("publishes CustomEvent and updates the shared environment snapshot", () => {
    const received: CloudOpsEventPayload[] = [];
    const unsubscribe = subscribeCloudOpsEnvironment((payload) => {
      received.push(payload);
    });

    publishCloudOpsEnvironment("DEV");

    expect(getSharedEnvironment()).toBe("DEV");
    expect(received).toEqual([{ environment: "DEV" }]);

    unsubscribe();
    publishCloudOpsEnvironment("QA");
    expect(received).toHaveLength(1);
  });
});

describe("Operations CloudOps listener", () => {
  it("bootstraps from the shared environment and reloads on DEV → PROD", async () => {
    publishCloudOpsEnvironment("DEV");
    const stop = startOperationsCloudOpsSync();

    await vi.waitFor(() => {
      expect(useOperationsStore.getState().environment).toBe("DEV");
      expect(useOperationsStore.getState().services.length).toBeGreaterThan(0);
    });
    expect(useOperationsStore.getState().services.every((s) => s.environment === "DEV")).toBe(true);

    publishCloudOpsEnvironment("PROD");

    await vi.waitFor(() => {
      expect(useOperationsStore.getState().environment).toBe("PROD");
      expect(useOperationsStore.getState().services.every((s) => s.environment === "PROD")).toBe(true);
    });

    stop();
  });

  it("does not register duplicate window listeners", async () => {
    useOperationsStore.setState({
      environment: "PROD",
      services: [
        {
          id: "s1",
          name: "api-orders",
          environment: "PROD",
          status: "healthy",
          availability: 99.9,
          responseTime: 10,
        },
      ],
    });
    const spy = vi.spyOn(api, "getServices");
    const first = startOperationsCloudOpsSync();
    const second = startOperationsCloudOpsSync();
    spy.mockClear();

    publishCloudOpsEnvironment("QA");

    await vi.waitFor(() => {
      expect(useOperationsStore.getState().environment).toBe("QA");
    });

    expect(spy).toHaveBeenCalledTimes(1);
    first();
    second();
    spy.mockRestore();
  });
});
