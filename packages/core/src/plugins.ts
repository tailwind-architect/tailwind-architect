import { relative, resolve } from "node:path";
import type { TailwindArchitectPlugin } from "./types.js";

/** Reject plugin names that could escape node_modules (path traversal). */
function isSafePluginName(name: string): boolean {
  if (typeof name !== "string" || name.length === 0) return false;
  if (name.includes("..")) return false;
  return /^[@a-zA-Z0-9./_-]+$/.test(name);
}

/** Ensure resolved path is strictly under cwd/node_modules. */
function isPathUnderNodeModules(cwd: string, resolvedPath: string): boolean {
  const nodeModulesRoot = resolve(cwd, "node_modules");
  const normalizedResolved = resolve(resolvedPath);
  const rel = relative(nodeModulesRoot, normalizedResolved);
  return rel !== "" && !rel.startsWith("..") && !rel.startsWith("/");
}

export async function loadPlugins(
  cwd: string,
  pluginNames: string[]
): Promise<TailwindArchitectPlugin[]> {
  const plugins: TailwindArchitectPlugin[] = [];
  const nodeModulesRoot = resolve(cwd, "node_modules");

  for (const name of pluginNames) {
    if (!isSafePluginName(name)) continue;

    const resolved = resolve(nodeModulesRoot, name);
    if (!isPathUnderNodeModules(cwd, resolved)) continue;

    try {
      const mod = await import(resolved);
      if (mod == null) continue;
      const plugin = ((mod as { default?: TailwindArchitectPlugin }).default ??
        mod) as TailwindArchitectPlugin;
      if (plugin && typeof plugin.name === "string") {
        plugins.push(plugin);
      }
    } catch {
      // Skip invalid or missing plugin
    }
  }
  return plugins;
}
