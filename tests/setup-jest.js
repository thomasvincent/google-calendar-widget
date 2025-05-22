/**
 * Jest setup file for Google Calendar Widget
 *
 * This file sets up the testing environment for Jest tests.
 * It mocks global objects and functions that the calendar code depends on.
 */

// Mock the global document object
global.document = {
  getElementById: jest.fn().mockImplementation(() => ({
    childNodes: [],
    removeChild: jest.fn(),
    appendChild: jest.fn(),
  })),
  createElement: jest.fn().mockImplementation(() => ({
    className: '',
    appendChild: jest.fn(),
    textContent: '',
    innerHTML: '',
    setAttribute: jest.fn(),
    href: '',
  })),
};

// Mock the global console object
global.console = {
  log: jest.fn(),
  error: jest.fn(),
};

// Mock the global window object
global.window = {
  googleCalendarWidgetDebug: true,
  google_calendar_widget_loc: {
    all_day: 'All Day',
    all_day_event: 'All Day Event',
  },
};

// Mock the jQuery object
global.jQuery = jest.fn(() => ({
  on: jest.fn(),
  off: jest.fn(),
  trigger: jest.fn(),
}));
global.$ = global.jQuery;

// Mock the gapi object
global.gapi = {
  client: {
    setApiKey: jest.fn(),
    load: jest.fn(() => Promise.resolve()),
    newBatch: jest.fn(() => ({
      add: jest.fn(),
      then: jest.fn(() => ({
        catch: jest.fn(),
      })),
    })),
    calendar: {
      events: {
        list: jest.fn(),
      },
    },
  },
};

// Mock the Wiky object
global.Wiky = {
  toHtml: jest.fn(str => str),
};

// Mock the Date.prototype.toString method used by date.js
Date.prototype.toString = function (format) {
  if (format === 'ddd, MMM d, yyyy') {
    return 'Mon, Jan 1, 2023';
  }
  if (format === 'h:mm tt') {
    return '12:00 PM';
  }
  if (format === 'ddd, MMM d, yyyy h:mm tt') {
    return 'Mon, Jan 1, 2023 12:00 PM';
  }
  if (format === 'MMM dd') {
    return 'Jan 01';
  }
  return this.toISOString();
};

// Mock the google_calendar_widget object
global.google_calendar_widget = {
  loadCalendar: jest.fn(),
  init: jest.fn(),
};

// Mock the google_calendar_widget_google_init function
global.google_calendar_widget_google_init = jest.fn(() => {
  google_calendar_widget.init();
});
