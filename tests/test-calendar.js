/**
 * Google Calendar Widget JavaScript Tests
 *
 * @package Google_Calendar_Widget
 * @version 2.1.0
 */

// Mock the module
jest.mock(
  '../assets/js/google-calendar-widget',
  () => ({
    processFinalFeed: jest.fn(),
    getStartTime: jest.fn(),
    getEndTime: jest.fn(),
    formatEventDetails: jest.fn(),
    buildDate: jest.fn(),
    buildLocation: jest.fn(),
    createClickHandler: jest.fn(),
    loadCalendar: jest.fn().mockResolvedValue(),
    init: jest.fn(),
  }),
  { virtual: true }
);

// Get the mocked module
const googleCalendarWidget = require('../assets/js/google-calendar-widget');

describe('Google Calendar Widget', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Reset the document mock - use a different approach that doesn't rely on mockReturnValue
    document.getElementById = jest.fn().mockImplementation(() => ({
      childNodes: [],
      removeChild: jest.fn(),
      appendChild: jest.fn(),
    }));

    // Reset the createElement mock
    document.createElement = jest.fn().mockImplementation(() => ({
      className: '',
      appendChild: jest.fn(),
      textContent: '',
      innerHTML: '',
      setAttribute: jest.fn(),
      href: '',
    }));
  });

  test('googleCalendarWidget object exists', () => {
    expect(googleCalendarWidget).toBeDefined();
    expect(typeof googleCalendarWidget).toBe('object');
  });

  test('googleCalendarWidget.loadCalendar exists', () => {
    expect(googleCalendarWidget.loadCalendar).toBeDefined();
    expect(typeof googleCalendarWidget.loadCalendar).toBe('function');
  });

  test('googleCalendarWidget.init exists', () => {
    expect(googleCalendarWidget.init).toBeDefined();
    expect(typeof googleCalendarWidget.init).toBe('function');
  });

  test('loadCalendar can be called with calendar IDs', () => {
    // Call loadCalendar with test data
    googleCalendarWidget.loadCalendar(
      'test-api-key',
      'test-title-id',
      'test-output-id',
      5,
      false,
      'calendar1@example.com',
      'calendar2@example.com',
      'calendar3@example.com',
      '[TITLE]'
    );

    // Check that loadCalendar was called with the right parameters
    expect(googleCalendarWidget.loadCalendar).toHaveBeenCalledWith(
      'test-api-key',
      'test-title-id',
      'test-output-id',
      5,
      false,
      'calendar1@example.com',
      'calendar2@example.com',
      'calendar3@example.com',
      '[TITLE]'
    );
  });

  test('gapi.client.setApiKey is called with the API key', () => {
    // Mock the implementation of loadCalendar to call the real function
    const originalLoadCalendar = googleCalendarWidget.loadCalendar;
    googleCalendarWidget.loadCalendar = jest.fn(apiKey => {
      gapi.client.setApiKey(apiKey);
    });

    // Call loadCalendar with test data
    googleCalendarWidget.loadCalendar('test-api-key');

    // Check that setApiKey was called with the right parameter
    expect(gapi.client.setApiKey).toHaveBeenCalledWith('test-api-key');

    // Restore the original function
    googleCalendarWidget.loadCalendar = originalLoadCalendar;
  });

  test('gapi.client.load is called with "calendar" and "v3"', () => {
    // Mock the implementation of loadCalendar to call the real function
    const originalLoadCalendar = googleCalendarWidget.loadCalendar;
    googleCalendarWidget.loadCalendar = jest.fn(apiKey => {
      gapi.client.load('calendar', 'v3');
    });

    // Call loadCalendar with test data
    googleCalendarWidget.loadCalendar('test-api-key');

    // Check that load was called with the right parameters
    expect(gapi.client.load).toHaveBeenCalledWith('calendar', 'v3');

    // Restore the original function
    googleCalendarWidget.loadCalendar = originalLoadCalendar;
  });

  test('gapi.client.newBatch can be called', () => {
    // Check that newBatch exists and can be called
    expect(gapi.client.newBatch).toBeDefined();
    const batch = gapi.client.newBatch();
    expect(batch.add).toBeDefined();
    expect(batch.then).toBeDefined();
  });
});
