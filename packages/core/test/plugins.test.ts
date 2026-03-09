import { describe, expect, it } from "vitest";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadPlugins } from "../src/plugins.js";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const fixtureDir = join(__dirname, "fixtures", "with-config");

describe("loadPlugins", () => {
  it("loads a valid plugin from node_modules", async () => {
    const plugins = await loadPlugins(fixtureDir, [
      "tailwind-architect-plugin-test"
    ]);
    expect(plugins).toHaveLength(1);
    expect(plugins[0].name).toBe("tailwind-architect-plugin-test");
  });

  it("returns empty array for non-existent plugin without throwing", async () => {
    const plugins = await loadPlugins(fixtureDir, ["non-existent-plugin"]);
    expect(plugins).toEqual([]);
  });

  it("rejects plugin name with path traversal and does not load from outside node_modules", async () => {
    const plugins = await loadPlugins(fixtureDir, ["../../../package.json"]);
    expect(plugins).toHaveLength(0);
  });

  it("rejects plugin name containing ..", async () => {
    const plugins = await loadPlugins(fixtureDir, [
      "..",
      "foo/../bar",
      "tailwind-architect-plugin-test"
    ]);
    expect(plugins).toHaveLength(1);
    expect(plugins[0].name).toBe("tailwind-architect-plugin-test");
  });

  it("rejects empty or invalid plugin names", async () => {
    expect(await loadPlugins(fixtureDir, [""])).toHaveLength(0);
    expect(await loadPlugins(fixtureDir, ["foo\x00bar"])).toHaveLength(0);
  });

  it("returns multiple valid plugins and skips invalid ones", async () => {
    const plugins = await loadPlugins(fixtureDir, [
      "tailwind-architect-plugin-test",
      "non-existent",
      "tailwind-architect-plugin-test"
    ]);
    expect(plugins).toHaveLength(2);
    expect(
      plugins.every((p) => p.name === "tailwind-architect-plugin-test")
    ).toBe(true);
  });
});
