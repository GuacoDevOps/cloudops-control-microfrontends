import type { Environment } from "@cloudops/contracts";
import type { CloudService, Incident } from "../store/types";
import { mockServices, mockIncidents } from "../data/mockOperationsData";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const randomDelay = () => delay(500 + Math.random() * 300);

let simulateError = false;
let incidentsData: Incident[] = structuredClone(mockIncidents);

export function resetIncidentsData() {
  incidentsData = structuredClone(mockIncidents);
}

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
    throw new Error("Simulated API error: Unable to reach Cloud Operations services");
  }
}

export async function getServices(environment: Environment): Promise<CloudService[]> {
  await checkError();
  return mockServices.filter((s) => s.environment === environment);
}

export async function getIncidents(environment: Environment): Promise<Incident[]> {
  await checkError();
  return incidentsData.filter((incident) => incident.environment === environment);
}

export async function acknowledgeIncident(id: string): Promise<Incident | undefined> {
  await delay(200);
  const incident = incidentsData.find((item) => item.id === id);
  if (!incident || incident.status !== "open") {
    return undefined;
  }
  incident.status = "acknowledged";
  return incident;
}

export async function resolveIncident(id: string): Promise<Incident | undefined> {
  await delay(200);
  const incident = incidentsData.find((item) => item.id === id);
  if (!incident || incident.status !== "acknowledged") {
    return undefined;
  }
  incident.status = "resolved";
  return incident;
}
