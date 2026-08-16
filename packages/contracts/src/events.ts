import type { Environment } from "./environment";
import { ENVIRONMENTS } from "./environment";

export const CLOUDOPS_EVENT = "cloudops";
export const CLOUDOPS_ENVIRONMENT_KEY = "__CLOUDOPS_ENVIRONMENT__";

export interface CloudOpsEventPayload {
  environment: Environment;
}

declare global {
  interface Window {
    __CLOUDOPS_ENVIRONMENT__?: Environment;
  }
}

export function isCloudOpsEventPayload(value: unknown): value is CloudOpsEventPayload {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const environment = (value as { environment?: unknown }).environment;
  return ENVIRONMENTS.includes(environment as Environment);
}

export function getSharedEnvironment(): Environment {
  if (typeof window === "undefined") {
    return "PROD";
  }
  const current = window[CLOUDOPS_ENVIRONMENT_KEY];
  return current && ENVIRONMENTS.includes(current) ? current : "PROD";
}

export function publishCloudOpsEnvironment(environment: Environment): void {
  if (typeof window === "undefined") {
    return;
  }
  window[CLOUDOPS_ENVIRONMENT_KEY] = environment;
  window.dispatchEvent(
    new CustomEvent<CloudOpsEventPayload>(CLOUDOPS_EVENT, {
      detail: { environment },
    }),
  );
}

export function subscribeCloudOpsEnvironment(
  listener: (payload: CloudOpsEventPayload) => void,
): () => void {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handler = (event: Event) => {
    const detail = (event as CustomEvent<CloudOpsEventPayload>).detail;
    if (isCloudOpsEventPayload(detail)) {
      listener(detail);
    }
  };

  window.addEventListener(CLOUDOPS_EVENT, handler);
  return () => {
    window.removeEventListener(CLOUDOPS_EVENT, handler);
  };
}
