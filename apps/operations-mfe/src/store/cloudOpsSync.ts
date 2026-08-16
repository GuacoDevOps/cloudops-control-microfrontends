import { useEffect } from "react";
import { getSharedEnvironment, subscribeCloudOpsEnvironment } from "@cloudops/contracts";
import useOperationsStore from "./useOperationsStore";

let subscriberCount = 0;
let unsubscribe: (() => void) | null = null;
let bootstrapped = false;

function applyEnvironment(environment: ReturnType<typeof getSharedEnvironment>, forceLoad: boolean) {
  const store = useOperationsStore.getState();
  const changed = store.environment !== environment;
  if (changed) {
    store.setEnvironment(environment);
  }
  if (forceLoad || changed || store.services.length === 0) {
    void store.loadServices();
    void store.loadIncidents();
  }
}

export function startOperationsCloudOpsSync() {
  if (subscriberCount === 0) {
    applyEnvironment(getSharedEnvironment(), !bootstrapped);
    bootstrapped = true;
    unsubscribe = subscribeCloudOpsEnvironment((payload) => {
      applyEnvironment(payload.environment, false);
    });
  }
  subscriberCount += 1;

  return () => {
    subscriberCount -= 1;
    if (subscriberCount === 0) {
      unsubscribe?.();
      unsubscribe = null;
    }
  };
}

export function useOperationsCloudOpsSync() {
  useEffect(() => startOperationsCloudOpsSync(), []);
}

export function resetOperationsCloudOpsSyncForTests() {
  unsubscribe?.();
  unsubscribe = null;
  subscriberCount = 0;
  bootstrapped = false;
}
