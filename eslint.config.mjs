import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/coverage/**",
      "**/*.bundle.js",
      "**/out/**",
      "**/*.cjs",
      "**/fixtures/**",
      "website/.vitepress/cache/**",
      "examples/**"
    ]
  },
  // metrics/ is browser-only; define globals so lint passes in Node (CI) and when run explicitly
  {
    files: ["metrics/**/*.js"],
    languageOptions: {
      parserOptions: { ecmaVersion: "latest", sourceType: "script" },
      globals: {
        fetch: "readonly",
        document: "readonly",
        window: "readonly",
        Chart: "readonly",
        console: "readonly"
      }
    },
    rules: { "no-undef": "off" }
  },
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.mjs"],
    ignores: ["metrics/**"],
    languageOptions: {
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module"
      },
      globals: {
        console: "readonly",
        process: "readonly",
        Buffer: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        module: "readonly",
        require: "readonly",
        exports: "writable"
      }
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" }
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "no-console": "off"
    }
  }
);
