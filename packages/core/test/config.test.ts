import { describe, expect, it } from "vitest";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadArchitectConfig, defaultConfig } from "../src/config.js";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const fixtureDir = join(__dirname, "fixtures", "with-config");
const withArchitectConfigDir = join(
  __dirname,
  "fixtures",
  "with-architect-config"
);
const withInvalidConfigDir = join(__dirname, "fixtures", "with-invalid-config");

describe("loadArchitectConfig", () => {
  it("returns defaultConfig when config file does not exist", async () => {
    const config = await loadArchitectConfig(fixtureDir);
    expect(config.sortClasses).toBe(defaultConfig.sortClasses);
    expect(config.classFunctions).toEqual(defaultConfig.classFunctions);
    expect(Array.isArray(config.plugins)).toBe(true);
  });

  it("returns merged config when valid config file exists", async () => {
    const config = await loadArchitectConfig(withArchitectConfigDir);
    expect(config.sortClasses).toBe(true);
    expect(config.removeRedundant).toBe(false);
    expect(config.classFunctions).toEqual(["cn", "clsx"]);
    expect(config.plugins).toEqual(["some-plugin"]);
  });

  it("returns defaultConfig when config file contains invalid JSON", async () => {
    const config = await loadArchitectConfig(withInvalidConfigDir);
    expect(config).toBeDefined();
    expect(config.sortClasses).toBe(defaultConfig.sortClasses);
    expect(Array.isArray(config.classFunctions)).toBe(true);
    expect(Array.isArray(config.plugins)).toBe(true);
  });

  it("returns defaultConfig when config has invalid types (e.g. classFunctions not array)", async () => {
    const { writeFile, mkdir } = await import("node:fs/promises");
    const tmpDir = join(__dirname, "fixtures", "with-malformed-config");
    await mkdir(tmpDir, { recursive: true }).catch(() => {});
    await writeFile(
      join(tmpDir, "tailwind-architect.config.json"),
      JSON.stringify({
        classFunctions: "not-an-array",
        plugins: "not-an-array"
      })
    );
    const config = await loadArchitectConfig(tmpDir);
    expect(Array.isArray(config.classFunctions)).toBe(true);
    expect(config.classFunctions).toEqual(defaultConfig.classFunctions);
    expect(Array.isArray(config.plugins)).toBe(true);
    expect(config.plugins).toEqual(defaultConfig.plugins);
  });
});
