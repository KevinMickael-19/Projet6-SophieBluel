import js from "@eslint/js";
import globals from "globals";
import prettierPlugin from "eslint-plugin-prettier";
import prettierConfig from "eslint-config-prettier";
import { defineConfig } from "eslint/config";

export default defineConfig([
  js.configs.recommended,

  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: globals.browser,
    },

    plugins: {
      prettier: prettierPlugin,
    },

    rules: {

      "prettier/prettier": "error",

      "no-unused-vars": "error",
      "no-console": "warn",
      "no-var": "error",
      "prefer-const": "error",
      eqeqeq: "error",
      "no-duplicate-imports": "error",
      "no-unreachable": "error",
      "max-depth": ["warn", 3],
      complexity: ["warn", 10],
    },
  },

  prettierConfig,
]);