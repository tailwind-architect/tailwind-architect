import { describe, expect, it } from "vitest";
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const cliDir = join(__dirname, "..");
const cliPath = join(cliDir, "dist", "cli.js");

function runCli(args: string[]): {
  stdout: string;
  stderr: string;
  status: number;
} {
  const result = spawnSync(process.execPath, [cliPath, ...args], {
    cwd: cliDir,
    encoding: "utf8",
    env: { ...process.env }
  });
  return {
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
    status: result.status ?? (result.signal ? 1 : 0)
  };
}

describe("CLI rootDir validation", () => {
  it("exits with 1 and prints error when rootDir does not exist", () => {
    const { stderr, status } = runCli(["analyze", "/nonexistent-path-12345"]);
    expect(status).toBe(1);
    expect(stderr).toMatch(/directory not found|ENOENT|not found/i);
  });

  it("exits with 1 and prints error when rootDir is a file not a directory", () => {
    const filePath = join(
      cliDir,
      "..",
      "core",
      "test",
      "fixtures",
      "with-config",
      "Button.tsx"
    );
    const { stderr: err, status } = runCli(["analyze", filePath]);
    expect(status).toBe(1);
    expect(err).toMatch(/not a directory/i);
  });

  it("succeeds when rootDir is a valid directory", () => {
    const dirPath = join(
      cliDir,
      "..",
      "core",
      "test",
      "fixtures",
      "with-config"
    );
    const { stdout, status } = runCli(["analyze", dirPath]);
    expect(status).toBe(0);
    expect(stdout).toMatch(/Scanned files:/);
  });

  it("--report json includes log, truncated, and filesLimit", () => {
    const dirPath = join(
      cliDir,
      "..",
      "core",
      "test",
      "fixtures",
      "with-config"
    );
    const { stdout, status } = runCli(["analyze", dirPath, "--report", "json"]);
    expect(status).toBe(0);
    const payload = JSON.parse(stdout) as Record<string, unknown>;
    expect(Array.isArray(payload.log)).toBe(true);
    expect(payload.truncated).toBe(false);
    expect(payload.filesLimit).toBe(null);
    expect(
      (payload.log as Array<{ message: string }>).some((e) =>
        e.message.includes("Collected")
      )
    ).toBe(true);
  });
});
