import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default tseslint.config(
  js.configs.recommended,

  ...tseslint.configs.recommended,

  {
    files: ['src/**/*.{js,jsx,ts,tsx}'],

    languageOptions: {
      parserOptions: {
        tsconfigRootDir: __dirname,
      },
    },

    rules: {
      // your rules
    },
  },

  {
    ignores: ['dist/**', 'node_modules/**'],
  },

  eslintConfigPrettier,
);