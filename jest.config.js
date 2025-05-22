/**
 * Jest configuration for Google Calendar Widget
 *
 * @package Google_Calendar_Widget
 * @version 2.1.0
 */

module.exports = {
  // The test environment that will be used for testing
  testEnvironment: 'jsdom',

  // The glob patterns Jest uses to detect test files
  testMatch: [
    '**/tests/**/*.js',
    '**/tests/**/*.ts',
    '**/tests/**/*.tsx',
    '!**/node_modules/**',
    '!**/vendor/**',
  ],

  // An array of file extensions your modules use
  moduleFileExtensions: ['js', 'ts', 'tsx', 'json'],

  // A list of paths to directories that Jest should use to search for files in
  roots: ['<rootDir>/tests', '<rootDir>/assets/js'],

  // Automatically clear mock calls and instances between every test
  clearMocks: true,

  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: true,

  // The directory where Jest should output its coverage files
  coverageDirectory: 'coverage',

  // An array of regexp pattern strings used to skip coverage collection
  coveragePathIgnorePatterns: ['/node_modules/', '/tests/'],

  // A list of reporter names that Jest uses when writing coverage reports
  coverageReporters: ['text', 'lcov'],

  // The paths to modules that run some code to configure or set up the testing framework before each test
  setupFilesAfterEnv: [
    '<rootDir>/tests/setup.js',
    '<rootDir>/tests/setup-jest.js',
  ],

  // A map from regular expressions to module names that allow to stub out resources with a single module
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': '<rootDir>/tests/mocks/styleMock.js',
    '\\.(gif|ttf|eot|svg|png)$': '<rootDir>/tests/mocks/fileMock.js',
  },

  // An array of regexp pattern strings that are matched against all test paths, matched tests are skipped
  testPathIgnorePatterns: [
    '/node_modules/',
    '/vendor/',
    '/tests/mocks/',
    '/tests/setup.js',
    '/tests/setup-jest.js',
  ],

  // Indicates whether each individual test should be reported during the run
  verbose: true,

  // Transform files with ts-jest
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
};
