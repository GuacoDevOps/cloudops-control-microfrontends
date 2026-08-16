import type { CostSummary } from "../store/types";

export const mockCosts: CostSummary[] = [
  { environment: "PROD", monthlyCost: 12850, previousMonthCost: 11200 },
  { environment: "QA", monthlyCost: 4320, previousMonthCost: 4100 },
  { environment: "DEV", monthlyCost: 1480, previousMonthCost: 1600 },
];

export const COST_BREAKDOWN_RATIOS = [
  { category: "Compute", percentage: 0.45 },
  { category: "Database", percentage: 0.25 },
  { category: "Networking", percentage: 0.12 },
  { category: "Storage", percentage: 0.1 },
  { category: "Observability", percentage: 0.08 },
];
