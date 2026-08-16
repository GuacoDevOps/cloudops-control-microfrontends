import { create } from "zustand";
import { getSharedEnvironment, type Environment } from "@cloudops/contracts";
import type { FinOpsState, FinOpsActions } from "./types";
import * as api from "../services/mockFinOpsApi";
import { enableSimulatedError } from "../services/mockFinOpsApi";
import { COST_BREAKDOWN_RATIOS } from "../data/mockFinOpsData";

function buildBreakdown(monthlyCost: number) {
  return COST_BREAKDOWN_RATIOS.map(({ category, percentage }) => ({
    category,
    percentage,
    estimatedCost: Math.round(monthlyCost * percentage),
  }));
}

const useFinOpsStore = create<FinOpsState & FinOpsActions>((set, get) => ({
  environment: getSharedEnvironment(),
  costSummary: null,
  costBreakdown: [],
  loading: false,
  error: null,

  setEnvironment: (environment: Environment) => {
    set({ environment });
  },

  loadCosts: async () => {
    const { environment } = get();
    set({ loading: true, error: null });
    try {
      const costSummary = await api.getCosts(environment);
      set({
        costSummary,
        costBreakdown: buildBreakdown(costSummary.monthlyCost),
        loading: false,
      });
    } catch (err) {
      set({
        loading: false,
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }
  },

  retryCosts: async () => {
    set({ error: null });
    await get().loadCosts();
  },

  simulateApiError: () => {
    enableSimulatedError();
    void get().loadCosts();
  },
}));

export default useFinOpsStore;
