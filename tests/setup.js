/**
 * Jest setup file for Google Calendar Widget
 *
 * This file sets up the testing environment for Jest.
 *
 * @package Google_Calendar_Widget
 * @version 2.1.0
 */

// Set up Jest mock functions
jest.mock('jquery', () => jest.fn());

// Mock the global window object
global.window = {
  googleCalendarWidgetDebug: true,
  google_calendar_widget_loc: {
    all_day: 'All Day',
    all_day_event: 'All Day Event',
  },
  performance: {
    now: jest.fn(),
  },
};

// Mock the global document object with proper Jest mock functions
global.document = {
  getElementById: jest.fn(() => ({
    childNodes: [],
    appendChild: jest.fn(),
    removeChild: jest.fn(),
  })),
  createElement: jest.fn(() => ({
    className: '',
    textContent: '',
    innerHTML: '',
    appendChild: jest.fn(),
    setAttribute: jest.fn(),
  })),
};

// Mock the global gapi object with proper Jest mock functions
global.gapi = {
  client: {
    setApiKey: jest.fn(),
    load: jest.fn(() => Promise.resolve()),
    newBatch: jest.fn(() => ({
      add: jest.fn(),
      then: jest.fn(callback => {
        callback({
          result: {},
        });
        return { catch: jest.fn() };
      }),
    })),
    calendar: {
      events: {
        list: jest.fn(),
      },
    },
  },
};

// Mock the global console object
const originalConsole = global.console;
beforeEach(() => {
  global.console = {
    log: jest.fn(),
    error: jest.fn(),
    time: jest.fn(),
    timeEnd: jest.fn(),
  };

  // Reset all mocks before each test
  jest.clearAllMocks();
});

afterEach(() => {
  global.console = originalConsole;
});

// Create directory for mocks if it doesn't exist
const fs = require('fs');
const path = require('path');
const mockDir = path.join(__dirname, 'mocks');

if (!fs.existsSync(mockDir)) {
  fs.mkdirSync(mockDir);
}

// Mock the process.memoryUsage function for memory tests
process.memoryUsage = jest.fn(() => ({
  rss: 1024 * 1024 * 10,
  heapTotal: 1024 * 1024 * 5,
  heapUsed: 1024 * 1024 * 3,
  external: 1024 * 1024 * 1,
}));

// Set up a mock Date object
const OriginalDate = global.Date;
global.Date = class extends OriginalDate {
  constructor(...args) {
    if (args.length === 0) {
      super(2025, 3, 15, 10, 0, 0);
    } else {
      super(...args);
    }
  }
};
