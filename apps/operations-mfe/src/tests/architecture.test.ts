import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const repoRoot = path.resolve(process.cwd(), "../..");

function collectSource(dir: string): string {
  const entries = readdirSync(dir);
  return entries
    .map((entry) => {
      if (entry === "tests" || entry === "node_modules" || entry === "dist") {
        return "";
      }
      const fullPath = path.join(dir, entry);
      const stats = statSync(fullPath);
      if (stats.isDirectory()) {
        return collectSource(fullPath);
      }
      if (/\.(ts|tsx)$/.test(entry) && !entry.endsWith(".d.ts") && !entry.includes(".test.")) {
        return readFileSync(fullPath, "utf8");
      }
      return "";
    })
    .join("\n");
}

describe("Store independence", () => {
  it("does not let Shell import Operations or FinOps stores", () => {
    const source = collectSource(path.join(repoRoot, "apps/shell/src"));
    expect(source).not.toMatch(/useOperationsStore/);
    expect(source).not.toMatch(/useFinOpsStore/);
  });

  it("does not let Operations import the FinOps store", () => {
    const source = collectSource(path.join(repoRoot, "apps/operations-mfe/src"));
    expect(source).not.toMatch(/useFinOpsStore/);
  });

  it("does not let FinOps import the Operations store", () => {
    const source = collectSource(path.join(repoRoot, "apps/finops-mfe/src"));
    expect(source).not.toMatch(/useOperationsStore/);
  });
});
