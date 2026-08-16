import { describe, it, expect, beforeEach } from "vitest";
import { CLOUDOPS_EVENT, getSharedEnvironment } from "@cloudops/contracts";
import useShellStore from "../store/useShellStore";

beforeEach(() => {
  window.__CLOUDOPS_ENVIRONMENT__ = "PROD";
  useShellStore.setState({ selectedEnvironment: "PROD" });
});

describe("Shell environment event", () => {
  it("publishes the cloudops event when the selector changes environment", () => {
    const received: string[] = [];
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{ environment: string }>).detail;
      received.push(detail.environment);
    };
    window.addEventListener(CLOUDOPS_EVENT, handler);

    useShellStore.getState().setEnvironment("DEV");

    expect(useShellStore.getState().selectedEnvironment).toBe("DEV");
    expect(getSharedEnvironment()).toBe("DEV");
    expect(received).toEqual(["DEV"]);

    window.removeEventListener(CLOUDOPS_EVENT, handler);
  });
});
