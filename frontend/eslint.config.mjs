import globals from "globals";
import pluginJs from "@eslint/js";
import pluginReact from "eslint-plugin-react";

/** @type {import('eslint').Linter.Config[]} */
export default [
        pluginJs.configs.recommended,
        pluginReact.configs.flat.recommended,
        {
                files: ["**/*.js", "**/*.jsx", "**/*.mjs", "**/*.cjs"],
                languageOptions: {
                        ecmaVersion: "latest",
                        sourceType: "module",
                        globals: {
                                ...globals.browser,
                                ...globals.jest, // adds test, expect, describe, etc.
                                process: "readonly", // allow process.env usage
                        },
                },
                rules: {
                        "react/react-in-jsx-scope": "off", // CRA doesn’t need React import
                },
                settings: {
                        react: {
                                version: "detect", // auto-detect from package.json
                        },
                },
        },
];
