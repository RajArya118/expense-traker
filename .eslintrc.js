module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
  },
  env: {
    browser: true,
    node: true,
    es2022: true,
  },
  ignorePatterns: ["node_modules/", ".next/", "dist/", "scratch/", "scripts/"],
  rules: {
    "no-unused-vars": "off",
  },
};
