import js from "@eslint/js";
import typescriptParser from "@typescript-eslint/parser";
import astro from "eslint-plugin-astro";

export default [
  {
    ignores: ["dist/**", ".astro/**", ".next/**", "node_modules/**"]
  },
  js.configs.recommended,
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: typescriptParser
    }
  },
  ...astro.configs["flat/recommended"]
];
