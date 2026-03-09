import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { AnalyzerConfig } from "./types.js";
import { architectConfigSchema } from "./config-schema.js";

const DEFAULT_CONFIG: AnalyzerConfig = {
  sortClasses: true,
  removeRedundant: true,
  detectConflicts: true,
  readabilityMode: false,
  autoFix: true,
  classFunctions: ["clsx", "cn", "cva", "tw"],
  plugins: []
};

export const defaultConfig: AnalyzerConfig = { ...DEFAULT_CONFIG };

function normalizeParsed(parsed: unknown): AnalyzerConfig {
  const result = architectConfigSchema.safeParse(parsed);
  if (!result.success) {
    return { ...DEFAULT_CONFIG };
  }
  const data = result.data;
  const classFunctions =
    Array.isArray(data.classFunctions) && data.classFunctions.length > 0
      ? data.classFunctions.filter((s): s is string => typeof s === "string")
      : DEFAULT_CONFIG.classFunctions;
  const plugins = Array.isArray(data.plugins)
    ? data.plugins.filter((s): s is string => typeof s === "string")
    : DEFAULT_CONFIG.plugins;
  return {
    sortClasses:
      typeof data.sortClasses === "boolean"
        ? data.sortClasses
        : DEFAULT_CONFIG.sortClasses,
    removeRedundant:
      typeof data.removeRedundant === "boolean"
        ? data.removeRedundant
        : DEFAULT_CONFIG.removeRedundant,
    detectConflicts:
      typeof data.detectConflicts === "boolean"
        ? data.detectConflicts
        : DEFAULT_CONFIG.detectConflicts,
    readabilityMode:
      typeof data.readabilityMode === "boolean"
        ? data.readabilityMode
        : DEFAULT_CONFIG.readabilityMode,
    autoFix:
      typeof data.autoFix === "boolean" ? data.autoFix : DEFAULT_CONFIG.autoFix,
    classFunctions,
    plugins
  };
}

export async function loadArchitectConfig(
  cwd: string
): Promise<AnalyzerConfig> {
  const filePath = join(cwd, "tailwind-architect.config.json");

  try {
    const content = await readFile(filePath, "utf8");
    const parsed = JSON.parse(content) as unknown;
    return normalizeParsed(parsed);
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}
