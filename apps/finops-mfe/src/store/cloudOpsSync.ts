import { useEffect } from "react";
import { getSharedEnvironment, subscribeCloudOpsEnvironment } from "@cloudops/contracts";
import useFinOpsStore from "./useFinOpsStore";

let subscriberCount = 0;
let unsubscribe: (() => void) | null = null;
let bootstrapped = false;

function applyEnvironment(environment: ReturnType<typeof getSharedEnvironment>, forceLoad: boolean) {
  const store = useFinOpsStore.getState();
  const changed = store.environment !== environment;
  if (changed) {
    store.setEnvironment(environment);
  }
  if (forceLoad || changed || store.costSummary === null) {
    void store.loadCosts();
  }
}

export function startFinOpsCloudOpsSync() {
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

export function useFinOpsCloudOpsSync() {
  useEffect(() => startFinOpsCloudOpsSync(), []);
}

export function resetFinOpsCloudOpsSyncForTests() {
  unsubscribe?.();
  unsubscribe = null;
  subscriberCount = 0;
  bootstrapped = false;
}
