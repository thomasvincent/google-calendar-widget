/**
 * ESLint configuration for Google Calendar Widget
 *
 * @package Google_Calendar_Widget
 * @version 2.1.0
 */

module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: true,
    jquery: true,
  },
  extends: ['eslint:recommended', 'plugin:jest/recommended'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['jest'],
  rules: {
    indent: ['error', 2],
    'linebreak-style': ['error', 'unix'],
    quotes: ['error', 'single', { allowTemplateLiterals: true }],
    semi: ['error', 'always'],
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'jest/no-disabled-tests': 'warn',
    'jest/no-focused-tests': 'error',
    'jest/no-identical-title': 'error',
    'jest/prefer-to-have-length': 'warn',
    'jest/valid-expect': 'error',
  },
  globals: {
    google_calendar_widget_loc: 'readonly',
    gapi: 'readonly',
    jQuery: 'readonly',
    Wiky: 'readonly',
  },
  ignorePatterns: ['node_modules/', 'vendor/', 'dist/', 'build/', 'coverage/'],
};
