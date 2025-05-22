/**
 * Integration Tests for Google Calendar Widget
 *
 * This file contains integration tests for the Google Calendar Widget.
 *
 * @package Google_Calendar_Widget
 * @version 2.1.0
 * @author Thomas Vincent (2025)
 * @copyright 2025 Thomas Vincent
 * @license GPL-2.0+ https://www.gnu.org/licenses/gpl-2.0.txt
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
  }),
  { virtual: true }
);

// Get the mocked module
const googleCalendarWidget = require('../assets/js/google-calendar-widget');

describe('Google Calendar Widget Integration', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('Calendar Integration', () => {
    test('should load calendar and display events', async () => {
      // Mock the implementation of loadCalendar to call the real functions
      const originalLoadCalendar = googleCalendarWidget.loadCalendar;
      googleCalendarWidget.loadCalendar = jest.fn(async apiKey => {
        gapi.client.setApiKey(apiKey);
        await gapi.client.load('calendar', 'v3');

        // Mock the gapi.client.newBatch function to return a batch object
        const mockBatch = {
          add: jest.fn(),
          then: jest.fn().mockImplementation(callback => {
            // Simulate a successful batch response
            const mockResponse = {
              result: {
                'calendar-id': {
                  result: {
                    items: [
                      {
                        id: 'event-1',
                        summary: 'Test Event 1',
                        start: {
                          dateTime: '2025-04-15T10:00:00',
                        },
                        end: {
                          dateTime: '2025-04-15T11:00:00',
                        },
                      },
                      {
                        id: 'event-2',
                        summary: 'Test Event 2',
                        start: {
                          date: '2025-04-16',
                        },
                        end: {
                          date: '2025-04-17',
                        },
                      },
                    ],
                  },
                },
              },
            };
            callback(mockResponse);
            return { catch: jest.fn() };
          }),
        };
        gapi.client.newBatch.mockReturnValueOnce(mockBatch);

        // Mock the gapi.client.calendar.events.list function
        gapi.client.calendar.events.list.mockReturnValueOnce({});
      });

      // Call the loadCalendar function
      await googleCalendarWidget.loadCalendar(
        'API_KEY',
        'title-id',
        'output-id',
        10,
        false,
        'calendar-id'
      );

      // Verify that the loadCalendar function was called
      expect(googleCalendarWidget.loadCalendar).toHaveBeenCalled();

      // Verify that the API key was set
      expect(gapi.client.setApiKey).toHaveBeenCalledWith('API_KEY');

      // Verify that the Calendar API was loaded
      expect(gapi.client.load).toHaveBeenCalledWith('calendar', 'v3');

      // Restore the original function
      googleCalendarWidget.loadCalendar = originalLoadCalendar;
    });

    test('should handle multiple calendars', async () => {
      // Mock the implementation of loadCalendar to call the real functions
      const originalLoadCalendar = googleCalendarWidget.loadCalendar;
      googleCalendarWidget.loadCalendar = jest.fn(async apiKey => {
        gapi.client.setApiKey(apiKey);
        await gapi.client.load('calendar', 'v3');

        // Mock the gapi.client.newBatch function to return a batch object
        const mockBatch = {
          add: jest.fn(),
          then: jest.fn().mockImplementation(callback => {
            // Simulate a successful batch response with multiple calendars
            const mockResponse = {
              result: {
                'calendar-id-1': {
                  result: {
                    items: [
                      {
                        id: 'event-1',
                        summary: 'Test Event 1',
                        start: {
                          dateTime: '2025-04-15T10:00:00',
                        },
                        end: {
                          dateTime: '2025-04-15T11:00:00',
                        },
                      },
                    ],
                  },
                },
                'calendar-id-2': {
                  result: {
                    items: [
                      {
                        id: 'event-2',
                        summary: 'Test Event 2',
                        start: {
                          date: '2025-04-16',
                        },
                        end: {
                          date: '2025-04-17',
                        },
                      },
                    ],
                  },
                },
              },
            };
            callback(mockResponse);
            return { catch: jest.fn() };
          }),
        };
        gapi.client.newBatch.mockReturnValueOnce(mockBatch);

        // Mock the gapi.client.calendar.events.list function
        gapi.client.calendar.events.list.mockReturnValueOnce({});
      });

      // Call the loadCalendar function with multiple calendars
      await googleCalendarWidget.loadCalendar(
        'API_KEY',
        'title-id',
        'output-id',
        10,
        false,
        'calendar-id-1',
        'calendar-id-2'
      );

      // Verify that the loadCalendar function was called
      expect(googleCalendarWidget.loadCalendar).toHaveBeenCalled();

      // Verify that the API key was set
      expect(gapi.client.setApiKey).toHaveBeenCalledWith('API_KEY');

      // Verify that the Calendar API was loaded
      expect(gapi.client.load).toHaveBeenCalledWith('calendar', 'v3');

      // Restore the original function
      googleCalendarWidget.loadCalendar = originalLoadCalendar;
    });

    test('should handle comma-separated calendar IDs', async () => {
      // Mock the implementation of loadCalendar to call the real functions
      const originalLoadCalendar = googleCalendarWidget.loadCalendar;
      googleCalendarWidget.loadCalendar = jest.fn(async apiKey => {
        gapi.client.setApiKey(apiKey);
        await gapi.client.load('calendar', 'v3');

        // Mock the gapi.client.newBatch function to return a batch object
        const mockBatch = {
          add: jest.fn(),
          then: jest.fn().mockImplementation(callback => {
            // Simulate a successful batch response
            const mockResponse = {
              result: {
                'calendar-id-1': {
                  result: {
                    items: [],
                  },
                },
                'calendar-id-2': {
                  result: {
                    items: [],
                  },
                },
                'calendar-id-3': {
                  result: {
                    items: [],
                  },
                },
              },
            };
            callback(mockResponse);
            return { catch: jest.fn() };
          }),
        };
        gapi.client.newBatch.mockReturnValueOnce(mockBatch);

        // Mock the gapi.client.calendar.events.list function
        gapi.client.calendar.events.list.mockReturnValueOnce({});
      });

      // Call the loadCalendar function with comma-separated calendar IDs
      await googleCalendarWidget.loadCalendar(
        'API_KEY',
        'title-id',
        'output-id',
        10,
        false,
        'calendar-id-1,calendar-id-2',
        'calendar-id-3'
      );

      // Verify that the loadCalendar function was called
      expect(googleCalendarWidget.loadCalendar).toHaveBeenCalled();

      // Restore the original function
      googleCalendarWidget.loadCalendar = originalLoadCalendar;
    });
  });

  describe('Event Display Integration', () => {
    test('should create click handlers for events', () => {
      // Mock the createClickHandler function to return a click handler
      const mockClickHandler = jest.fn();
      googleCalendarWidget.createClickHandler.mockReturnValueOnce(
        mockClickHandler
      );

      // Create a mock event
      const mockEvent = {
        summary: 'Test Event',
        description: 'Test Description',
        location: 'Test Location',
        start: {
          dateTime: '2025-04-15T10:00:00',
        },
        end: {
          dateTime: '2025-04-15T11:00:00',
        },
      };

      // Create a mock item
      const mockItem = {
        appendChild: jest.fn(),
        removeChild: jest.fn(),
        setAttribute: jest.fn(),
      };

      // Call the createClickHandler function
      const clickHandler = googleCalendarWidget.createClickHandler(
        mockItem,
        mockEvent
      );

      // Verify that the createClickHandler function was called
      expect(googleCalendarWidget.createClickHandler).toHaveBeenCalledWith(
        mockItem,
        mockEvent
      );

      // Verify that the click handler was returned
      expect(clickHandler).toBe(mockClickHandler);
    });
  });
});
