import { describe, it, expect, beforeEach } from "vitest";
import useFinOpsStore from "../store/useFinOpsStore";
import { selectCostVariation } from "../store/selectors";
import { mockCosts } from "../data/mockFinOpsData";

beforeEach(() => {
  useFinOpsStore.setState({
    environment: "PROD",
    costSummary: null,
    costBreakdown: [],
    loading: false,
    error: null,
  });
});

describe("FinOps environment costs", () => {
  it("returns different monthly costs for DEV, QA, and PROD", () => {
    const prod = mockCosts.find((row) => row.environment === "PROD");
    const qa = mockCosts.find((row) => row.environment === "QA");
    const dev = mockCosts.find((row) => row.environment === "DEV");

    expect(prod?.monthlyCost).toBe(12850);
    expect(qa?.monthlyCost).toBe(4320);
    expect(dev?.monthlyCost).toBe(1480);
  });
});

describe("FinOps cost variation", () => {
  it("computes monthly, previous, difference, and variation % for PROD", () => {
    const prod = mockCosts[0];
    useFinOpsStore.setState({ costSummary: prod });

    const variation = selectCostVariation(useFinOpsStore.getState());
    expect(variation.monthlyCost).toBe(12850);
    expect(variation.previousMonthCost).toBe(11200);
    expect(variation.difference).toBe(1650);
    expect(variation.variationPct).toBe("14.7");
    expect(variation.isIncrease).toBe(true);
  });

  it("computes a decrease for DEV", () => {
    const dev = mockCosts[2];
    useFinOpsStore.setState({ costSummary: dev, environment: "DEV" });

    const variation = selectCostVariation(useFinOpsStore.getState());
    expect(variation.monthlyCost).toBe(1480);
    expect(variation.previousMonthCost).toBe(1600);
    expect(variation.difference).toBe(-120);
    expect(variation.variationPct).toBe("-7.5");
    expect(variation.isIncrease).toBe(false);
  });
});
