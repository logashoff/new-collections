import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

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

    extends: compat.extends(
      'plugin:@angular-eslint/recommended',
      'plugin:@angular-eslint/template/process-inline-templates',
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended'
    ),

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
    extends: compat.extends('plugin:@angular-eslint/template/recommended'),
    rules: {},
  },
]);
