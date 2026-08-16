import { create } from "zustand";
import { getSharedEnvironment, type Environment } from "@cloudops/contracts";
import type { OperationsState, OperationsActions, IncidentSeverity, IncidentStatus } from "./types";
import * as api from "../services/mockOperationsApi";
import { enableSimulatedError } from "../services/mockOperationsApi";

const DEFAULT_FILTERS = {
  search: "",
  severity: "all" as const,
  status: "all" as const,
};

let inFlight = 0;

function beginLoad(set: (partial: Partial<OperationsState>) => void) {
  inFlight += 1;
  set({ loading: true, error: null });
}

function endLoad(set: (partial: Partial<OperationsState>) => void) {
  inFlight = Math.max(0, inFlight - 1);
  if (inFlight === 0) {
    set({ loading: false });
  }
}

const useOperationsStore = create<OperationsState & OperationsActions>((set, get) => ({
  environment: getSharedEnvironment(),
  services: [],
  incidents: [],
  loading: false,
  error: null,
  incidentFilters: { ...DEFAULT_FILTERS },

  setEnvironment: (environment: Environment) => {
    set({ environment });
  },

  loadServices: async () => {
    const { environment } = get();
    beginLoad(set);
    try {
      const services = await api.getServices(environment);
      set({ services });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      endLoad(set);
    }
  },

  loadIncidents: async () => {
    const { environment } = get();
    beginLoad(set);
    try {
      const incidents = await api.getIncidents(environment);
      set({ incidents });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      endLoad(set);
    }
  },

  acknowledgeIncident: (id: string) => {
    void api.acknowledgeIncident(id);
    set((state) => ({
      incidents: state.incidents.map((incident) =>
        incident.id === id && incident.status === "open"
          ? { ...incident, status: "acknowledged" }
          : incident,
      ),
    }));
  },

  resolveIncident: (id: string) => {
    void api.resolveIncident(id);
    set((state) => ({
      incidents: state.incidents.map((incident) =>
        incident.id === id && incident.status === "acknowledged"
          ? { ...incident, status: "resolved" }
          : incident,
      ),
    }));
  },

  setSeverityFilter: (severity: IncidentSeverity | "all") => {
    set((state) => ({ incidentFilters: { ...state.incidentFilters, severity } }));
  },

  setStatusFilter: (status: IncidentStatus | "all") => {
    set((state) => ({ incidentFilters: { ...state.incidentFilters, status } }));
  },

  setSearchFilter: (search: string) => {
    set((state) => ({ incidentFilters: { ...state.incidentFilters, search } }));
  },

  resetFilters: () => {
    set({ incidentFilters: { ...DEFAULT_FILTERS } });
  },

  simulateApiError: () => {
    enableSimulatedError();
    void get().loadServices();
  },

  clearError: () => {
    set({ error: null });
  },
}));

export default useOperationsStore;

export function resetOperationsLoadCounter() {
  inFlight = 0;
}

