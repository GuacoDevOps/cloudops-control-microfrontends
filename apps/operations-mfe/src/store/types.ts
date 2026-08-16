import type { Environment, ServiceStatus } from "@cloudops/contracts";

export type IncidentSeverity = "critical" | "warning" | "info";
export type IncidentStatus = "open" | "acknowledged" | "resolved";

export interface CloudService {
  id: string;
  name: string;
  environment: Environment;
  status: ServiceStatus;
  availability: number;
  responseTime: number;
}

export interface Incident {
  id: string;
  service: string;
  title: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  environment: Environment;
  createdAt: string;
}

export interface IncidentFilters {
  search: string;
  severity: IncidentSeverity | "all";
  status: IncidentStatus | "all";
}

export interface OperationsState {
  environment: Environment;
  services: CloudService[];
  incidents: Incident[];
  loading: boolean;
  error: string | null;
  incidentFilters: IncidentFilters;
}

export interface OperationsActions {
  setEnvironment: (environment: Environment) => void;
  loadServices: () => Promise<void>;
  loadIncidents: () => Promise<void>;
  acknowledgeIncident: (id: string) => void;
  resolveIncident: (id: string) => void;
  setSeverityFilter: (severity: IncidentSeverity | "all") => void;
  setStatusFilter: (status: IncidentStatus | "all") => void;
  setSearchFilter: (search: string) => void;
  resetFilters: () => void;
  simulateApiError: () => void;
  clearError: () => void;
}
