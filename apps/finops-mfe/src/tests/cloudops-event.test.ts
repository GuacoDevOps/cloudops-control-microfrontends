import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  CLOUDOPS_EVENT,
  getSharedEnvironment,
  publishCloudOpsEnvironment,
} from "@cloudops/contracts";
import useFinOpsStore from "../store/useFinOpsStore";
import { resetFinOpsCloudOpsSyncForTests, startFinOpsCloudOpsSync } from "../store/cloudOpsSync";
import * as api from "../services/mockFinOpsApi";

beforeEach(() => {
  resetFinOpsCloudOpsSyncForTests();
  window.__CLOUDOPS_ENVIRONMENT__ = "PROD";
  useFinOpsStore.setState({
    environment: "PROD",
    costSummary: null,
    costBreakdown: [],
    loading: false,
    error: null,
  });
});

afterEach(() => {
  resetFinOpsCloudOpsSyncForTests();
});

describe("FinOps CloudOps listener", () => {
  it("uses the cloudops:environment-changed event name", () => {
    expect(CLOUDOPS_EVENT).toBe("cloudops:environment-changed");
  });

  it("bootstraps from the shared environment and reloads costs on DEV → PROD", async () => {
    publishCloudOpsEnvironment("DEV");
    expect(getSharedEnvironment()).toBe("DEV");
    const stop = startFinOpsCloudOpsSync();

    await vi.waitFor(() => {
      expect(useFinOpsStore.getState().environment).toBe("DEV");
      expect(useFinOpsStore.getState().costSummary?.environment).toBe("DEV");
    });

    publishCloudOpsEnvironment("PROD");

    await vi.waitFor(() => {
      expect(useFinOpsStore.getState().environment).toBe("PROD");
      expect(useFinOpsStore.getState().costSummary?.environment).toBe("PROD");
      expect(useFinOpsStore.getState().costBreakdown.length).toBeGreaterThan(0);
    });

    stop();
  });

  it("does not register duplicate window listeners", async () => {
    useFinOpsStore.setState({
      environment: "PROD",
      costSummary: { environment: "PROD", monthlyCost: 1, previousMonthCost: 1 },
    });
    const spy = vi.spyOn(api, "getCosts");
    const first = startFinOpsCloudOpsSync();
    const second = startFinOpsCloudOpsSync();
    spy.mockClear();

    publishCloudOpsEnvironment("QA");

    await vi.waitFor(() => {
      expect(useFinOpsStore.getState().environment).toBe("QA");
    });

    expect(spy).toHaveBeenCalledTimes(1);
    first();
    second();
    spy.mockRestore();
  });
});
