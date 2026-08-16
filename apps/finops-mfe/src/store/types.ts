import type { Environment } from "@cloudops/contracts";

export interface CostSummary {
  environment: Environment;
  monthlyCost: number;
  previousMonthCost: number;
}

export interface CostBreakdownItem {
  category: string;
  percentage: number;
  estimatedCost: number;
}

export interface FinOpsState {
  environment: Environment;
  costSummary: CostSummary | null;
  costBreakdown: CostBreakdownItem[];
  loading: boolean;
  error: string | null;
}

export interface FinOpsActions {
  setEnvironment: (environment: Environment) => void;
  loadCosts: () => Promise<void>;
  retryCosts: () => Promise<void>;
  simulateApiError: () => void;
}
