import type { FinOpsState, FinOpsActions } from "./types";

type Store = FinOpsState & FinOpsActions;

export const selectMonthlyCost = (state: Store): number =>
  state.costSummary?.monthlyCost ?? 0;

export const selectPreviousMonthCost = (state: Store): number =>
  state.costSummary?.previousMonthCost ?? 0;

export function selectCostVariation(state: Store) {
  const monthlyCost = selectMonthlyCost(state);
  const previousMonthCost = selectPreviousMonthCost(state);
  const difference = monthlyCost - previousMonthCost;
  const variationPct =
    previousMonthCost > 0 ? ((difference / previousMonthCost) * 100).toFixed(1) : "0.0";

  return {
    monthlyCost,
    previousMonthCost,
    difference,
    variationPct,
    isIncrease: difference > 0,
  };
}
