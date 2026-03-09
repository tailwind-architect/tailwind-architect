import * as esbuild from "esbuild";
import { copyFileSync, mkdirSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootLogo = join(__dirname, "../../logo.png");
const destLogo = join(__dirname, "images/logo.png");
if (existsSync(rootLogo)) {
  mkdirSync(join(__dirname, "images"), { recursive: true });
  copyFileSync(rootLogo, destLogo);
}

const REQUIRE_SHIM_BANNER = `import { createRequire } from "module";
globalThis.require = createRequire(import.meta.url);
`;

await esbuild.build({
  entryPoints: ["out/extension.js"],
  bundle: true,
  outfile: "out/extension.bundle.js",
  platform: "node",
  format: "esm",
  external: ["vscode"],
  banner: { js: REQUIRE_SHIM_BANNER },
});
