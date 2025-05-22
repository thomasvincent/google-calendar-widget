/**
 * ESLint configuration for Google Calendar Widget
 * 
 * @package Google_Calendar_Widget
 * @version 2.1.0
 */

const jestPlugin = require('eslint-plugin-jest');
const typescriptPlugin = require('@typescript-eslint/eslint-plugin');
const typescriptParser = require('@typescript-eslint/parser');

module.exports = [
  // Base configuration for JavaScript files
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2020, 
      sourceType: 'module',
      globals: {
        'google_calendar_widget_loc': 'readonly',
        'gapi': 'readonly',
        'jQuery': 'readonly',
        'Wiky': 'readonly',
        'document': 'readonly',
        'window': 'readonly',
        '$': 'readonly'
      }
    },
    plugins: {
      jest: jestPlugin
    },
    rules: {
      // JavaScript rules
      'indent': ['error', 2],
      'linebreak-style': ['error', 'unix'],
      'quotes': ['error', 'single', { 'allowTemplateLiterals': true }],
      'semi': ['error', 'always'],
      'no-unused-vars': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      
      // Jest rules
      'jest/no-disabled-tests': 'warn',
      'jest/no-focused-tests': 'error',
      'jest/no-identical-title': 'error',
      'jest/prefer-to-have-length': 'warn',
      'jest/valid-expect': 'error'
    }
  },
  
  // TypeScript specific configuration
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      ecmaVersion: 2020, 
      sourceType: 'module',
      parser: typescriptParser,
      parserOptions: {
        project: './tsconfig.json'
      },
      globals: {
        'google_calendar_widget_loc': 'readonly',
        'gapi': 'readonly',
        'jQuery': 'readonly',
        'Wiky': 'readonly',
        'document': 'readonly',
        'window': 'readonly',
        '$': 'readonly'
      }
    },
    plugins: {
      jest: jestPlugin,
      '@typescript-eslint': typescriptPlugin
    },
    rules: {
      // TypeScript rules
      'indent': ['error', 2],
      'linebreak-style': ['error', 'unix'],
      'quotes': ['error', 'single', { 'allowTemplateLiterals': true }],
      'semi': ['error', 'always'],
      'no-unused-vars': 'off', // Disable JS rule
      '@typescript-eslint/no-unused-vars': 'warn', // Enable TS rule
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      
      // Jest rules
      'jest/no-disabled-tests': 'warn',
      'jest/no-focused-tests': 'error',
      'jest/no-identical-title': 'error',
      'jest/prefer-to-have-length': 'warn',
      'jest/valid-expect': 'error'
    }
  },
  
  {
    ignores: [
      'node_modules/',
      'vendor/',
      'dist/',
      'build/',
      'coverage/',
      'assets/js/date.js',
      'assets/js/wiky.js'
    ]
  }
];