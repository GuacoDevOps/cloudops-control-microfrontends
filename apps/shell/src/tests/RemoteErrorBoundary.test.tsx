import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import type { ReactNode } from "react";
import "@testing-library/jest-dom";
import { RemoteErrorBoundary } from "../mfe/RemoteErrorBoundary";

vi.spyOn(console, "error").mockImplementation(() => undefined);

function Boom(): never {
  throw new Error("remote explode");
}

describe("RemoteErrorBoundary", () => {
  it("shows the Operations unavailable message and Retry without crashing the shell", () => {
    render(
      <div>
        <header>CloudOps Shell</header>
        <RemoteErrorBoundary fallbackMessage="Cloud Operations module is temporarily unavailable.">
          <Boom />
        </RemoteErrorBoundary>
      </div>,
    );

    expect(screen.getByText("CloudOps Shell")).toBeInTheDocument();
    expect(
      screen.getByText("Cloud Operations module is temporarily unavailable."),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
  });

  it("shows the FinOps unavailable message", () => {
    render(
      <RemoteErrorBoundary fallbackMessage="FinOps module is temporarily unavailable.">
        <Boom />
      </RemoteErrorBoundary>,
    );

    expect(screen.getByText("FinOps module is temporarily unavailable.")).toBeInTheDocument();
  });

  it("remounts children when Retry is pressed", () => {
    let shouldThrow = true;

    function Flaky(): ReactNode {
      if (shouldThrow) {
        throw new Error("temporary remote failure");
      }
      return <p>Remote recovered</p>;
    }

    render(
      <RemoteErrorBoundary fallbackMessage="Cloud Operations module is temporarily unavailable.">
        <Flaky />
      </RemoteErrorBoundary>,
    );

    shouldThrow = false;
    fireEvent.click(screen.getByRole("button", { name: /retry/i }));
    expect(screen.getByText("Remote recovered")).toBeInTheDocument();
  });
});
