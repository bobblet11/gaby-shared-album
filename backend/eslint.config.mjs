import globals from "globals";
import pluginJs from "@eslint/js";
import pluginReact from "eslint-plugin-react";

/** @type {import('eslint').Linter.Config[]} */
export default [
        { files: ["**/*.{js,mjs,cjs,jsx}"] },
        { files: ["**/*.js"], languageOptions: { sourceType: "commonjs" } },
        { languageOptions: { globals: globals.node } },
        pluginJs.configs.recommended,
        pluginReact.configs.flat.recommended,
        {
                ignores: ["src/libs/**"],
                rules: {
                        // ✅ Ignore unused "next" in Express handlers
                        "no-unused-vars": ["error", { argsIgnorePattern: "^next$" }],
                },
        },
];
