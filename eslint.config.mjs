import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";
import jsxA11y from "eslint-plugin-jsx-a11y";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // eslint-config-next already registers jsx-a11y, but with only a handful of
    // rules: turn on the whole recommended set.
    files: ["**/*.{ts,tsx}"],
    rules: {
      ...jsxA11y.flatConfigs.recommended.rules,
      "@typescript-eslint/consistent-type-imports": "error",
    },
  },
  prettier,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "coverage/**",
    "playwright-report/**",
    "test-results/**",
    "src/generated/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
