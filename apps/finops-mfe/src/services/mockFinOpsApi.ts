import type { Environment } from "@cloudops/contracts";
import type { CostSummary } from "../store/types";
import { mockCosts } from "../data/mockFinOpsData";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const randomDelay = () => delay(500 + Math.random() * 300);

let simulateError = false;

export function enableSimulatedError() {
  simulateError = true;
}

export function clearSimulatedError() {
  simulateError = false;
}

async function checkError() {
  await randomDelay();
  if (simulateError) {
    simulateError = false;
    throw new Error("Simulated API error: Unable to reach FinOps services");
  }
}

export async function getCosts(environment: Environment): Promise<CostSummary> {
  await checkError();
  return mockCosts.find((c) => c.environment === environment) ?? mockCosts[0];
}
