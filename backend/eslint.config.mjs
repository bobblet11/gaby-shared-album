import globals from "globals";
import pluginJs from "@eslint/js";
import pluginReact from "eslint-plugin-react";

/** @type {import('eslint').Linter.Config[]} */
export default [
        { ignores: ["src/libs/**", "tests/**"] },
        { files: ["**/*.{js,mjs,cjs,jsx}"] },
        { files: ["**/*.js"], languageOptions: { sourceType: "commonjs" } },
        { languageOptions: { globals: globals.node } },
        pluginJs.configs.recommended,
        pluginReact.configs.flat.recommended,
        {
                rules: {
                        "no-unused-vars": ["error", { argsIgnorePattern: "^next$" }],
                },
        },
];
