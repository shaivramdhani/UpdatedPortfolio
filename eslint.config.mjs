import js from "@eslint/js";
import astro from "eslint-plugin-astro";

export default [
  {
    ignores: ["dist/**", ".astro/**", ".next/**", "node_modules/**"]
  },
  js.configs.recommended,
  ...astro.configs["flat/recommended"]
];
