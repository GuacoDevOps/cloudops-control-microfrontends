import type { OperationsState, OperationsActions } from "./types";

type Store = OperationsState & OperationsActions;

export const selectActiveIncidents = (state: Store) =>
  state.incidents.filter((i) => i.status !== "resolved");

export const selectCriticalIncidents = (state: Store) =>
  state.incidents.filter((i) => i.severity === "critical");

export const selectHealthyServices = (state: Store) =>
  state.services.filter((s) => s.status === "healthy");

export const selectFilteredIncidents = (state: Store) => {
  const { incidents, incidentFilters } = state;
  return incidents.filter((incident) => {
    const matchesSeverity =
      incidentFilters.severity === "all" || incident.severity === incidentFilters.severity;
    const matchesStatus =
      incidentFilters.status === "all" || incident.status === incidentFilters.status;
    const matchesSearch =
      incidentFilters.search === "" ||
      incident.title.toLowerCase().includes(incidentFilters.search.toLowerCase()) ||
      incident.service.toLowerCase().includes(incidentFilters.search.toLowerCase());
    return matchesSeverity && matchesStatus && matchesSearch;
  });
};

export const selectAvailabilityAverage = (state: Store): number => {
  if (state.services.length === 0) {
    return 0;
  }
  const total = state.services.reduce((sum, s) => sum + s.availability, 0);
  return total / state.services.length;
};
