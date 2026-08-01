import globals from "globals";
import pluginJs from "@eslint/js";
import pluginReact from "eslint-plugin-react";

export default [
        pluginJs.configs.recommended,
        pluginReact.configs.flat.recommended,
        {
                files: ["frontend/src/**/*.test.{js,jsx}"],
                languageOptions: {
                        ecmaVersion: "latest",
                        sourceType: "module",
                        globals: {
                                ...globals.browser,
                                ...globals.jest,
                                process: "readonly",
                        },
                },
        },
        {
                files: ["frontend/src/**/*.{js,jsx}"],
                languageOptions: {
                        ecmaVersion: "latest",
                        sourceType: "module",
                        globals: {
                                ...globals.browser,
                                process: "readonly",
                        },
                },
                rules: {
                        "react/react-in-jsx-scope": "off",
                },
                settings: {
                        react: {
                                version: "detect",
                        },
                },
        },
];
