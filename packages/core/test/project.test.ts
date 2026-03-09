import { describe, expect, it } from "vitest";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { analyzeProject } from "../src/project.js";
import { defaultConfig } from "../src/config.js";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

describe("analyzeProject", () => {
  const fixtureDir = join(__dirname, "fixtures", "with-config");

  it("reports same counts with maxWorkers 1 and 2 when workers are used", async () => {
    const result1 = await analyzeProject({
      rootDir: fixtureDir,
      config: defaultConfig,
      mode: "analyze",
      maxWorkers: 1
    });
    const result2 = await analyzeProject({
      rootDir: fixtureDir,
      config: defaultConfig,
      mode: "analyze",
      maxWorkers: 2
    });
    expect(result2.report.filesScanned).toBe(result1.report.filesScanned);
    expect(result2.report.conflictCount).toBe(result1.report.conflictCount);
    expect(result2.report.redundancyCount).toBe(result1.report.redundancyCount);
    expect(result2.report.suggestionCount).toBe(result1.report.suggestionCount);
  });

  it("truncates to maxFiles when set and sets report.truncated and report.filesLimit", async () => {
    const result = await analyzeProject({
      rootDir: fixtureDir,
      config: defaultConfig,
      mode: "analyze",
      maxFiles: 1
    });
    expect(result.report.filesScanned).toBe(1);
    expect(result.report.truncated).toBe(true);
    expect(result.report.filesLimit).toBe(1);
    expect(Array.isArray(result.report.log)).toBe(true);
    expect(result.report.log!.length).toBeGreaterThanOrEqual(1);
    expect(
      result.report.log!.some((e) => e.message.includes("Truncated"))
    ).toBe(true);
  });

  it("populates report.log with collected and scan complete entries", async () => {
    const result = await analyzeProject({
      rootDir: fixtureDir,
      config: defaultConfig,
      mode: "analyze"
    });
    expect(Array.isArray(result.report.log)).toBe(true);
    expect(
      result.report.log!.some((e) => e.message.includes("Collected"))
    ).toBe(true);
    expect(
      result.report.log!.some((e) => e.message.includes("Scan complete"))
    ).toBe(true);
  });
});
