import angular from "@angular-eslint/eslint-plugin";
import angularTemplate from "@angular-eslint/eslint-plugin-template";
import templateParser from "@angular-eslint/template-parser";
import { FlatCompat } from '@eslint/eslintrc';
import { default as eslint, default as js } from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import tseslint from "typescript-eslint";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default defineConfig([
  globalIgnores(['projects/**/*']),
  {
    files: ['**/*.ts'],
    plugins: {
      '@angular-eslint': angular
    },
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
    ],

    languageOptions: {
      ecmaVersion: 5,
      sourceType: 'script',

      parserOptions: {
        createDefaultProgram: true,
        project: ['tsconfig.json', 'e2e/tsconfig.json'],
      },
    },

    rules: {
      '@angular-eslint/component-selector': [
        'error',
        {
          prefix: 'nc',
          style: 'kebab-case',
          type: 'element',
        },
      ],

      '@angular-eslint/directive-selector': [
        'error',
        {
          prefix: '',
          style: 'camelCase',
          type: 'attribute',
        },
      ],

      '@angular-eslint/no-output-native': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'after-used',
          caughtErrors: 'none',
          ignoreRestSiblings: false,
          reportUsedIgnorePattern: false,
          vars: 'all',
        },
      ],
      'no-async-promise-executor': 'warn',
      'no-case-declarations': 'off',
      'no-console': [
        'error',
        {
          allow: ['warn', 'error'],
        },
      ],
      'no-duplicate-imports': ['error'],
      'no-empty': [
        'error',
        {
          allowEmptyCatch: true,
        },
      ],
      'no-unused-private-class-members': 'error',
      'no-unused-vars': 'off',
    },
  },
  {
    files: ['**/*.html'],
    languageOptions: {
      parser: templateParser,
    },
    plugins: {
      "@angular-eslint/template": angularTemplate,
    },
  },
]);
