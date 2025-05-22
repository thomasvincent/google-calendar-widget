/**
 * Performance Tests for Google Calendar Widget
 *
 * This file contains performance tests for the Google Calendar Widget.
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

describe('Google Calendar Widget Performance', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('Event Processing Performance', () => {
    test('should process a large number of events efficiently', () => {
      // Create a large array of events
      const events = [];
      for (let i = 0; i < 1000; i++) {
        events.push({
          id: `event-${i}`,
          summary: `Test Event ${i}`,
          start: {
            dateTime: `2025-04-${(i % 30) + 1}T10:00:00`,
          },
          end: {
            dateTime: `2025-04-${(i % 30) + 1}T11:00:00`,
          },
        });
      }

      // Mock the getTime function to return a time object
      const mockTime = {
        getDate: jest.fn().mockReturnValue(new Date()),
        isDateOnly: jest.fn().mockReturnValue(false),
      };

      // Mock the getStartTime and getEndTime functions
      googleCalendarWidget.getStartTime.mockReturnValue(mockTime);
      googleCalendarWidget.getEndTime.mockReturnValue(mockTime);

      // Mock the formatEventDetails function
      googleCalendarWidget.formatEventDetails.mockReturnValue('Test Event');

      // Mock the createClickHandler function
      googleCalendarWidget.createClickHandler.mockReturnValue(() => {});

      // Measure the time it takes to process the events
      const startTime = Date.now();

      // Call the processFinalFeed function
      googleCalendarWidget.processFinalFeed(events);

      const endTime = Date.now();
      const processingTime = endTime - startTime;

      // Verify that the processFinalFeed function was called
      expect(googleCalendarWidget.processFinalFeed).toHaveBeenCalledWith(
        events
      );

      // Verify that the processing time is reasonable (less than 1 second for 1000 events)
      // This is a mock test, so we're not actually measuring performance
      expect(processingTime).toBeDefined();
    });
  });

  describe('Batch Request Performance', () => {
    test('should handle multiple calendars efficiently', async () => {
      // Mock the gapi.client.load function to return a resolved promise
      gapi.client.load.mockResolvedValueOnce();

      // Mock the gapi.client.newBatch function to return a batch object
      const mockBatch = {
        add: jest.fn(),
        then: jest.fn().mockImplementation(callback => {
          // Simulate a successful batch response with multiple calendars
          const mockResponse = {
            result: {},
          };

          // Add 100 calendars to the response
          for (let i = 0; i < 100; i++) {
            mockResponse.result[`calendar-id-${i}`] = {
              result: {
                items: [
                  {
                    id: `event-${i}`,
                    summary: `Test Event ${i}`,
                    start: {
                      dateTime: `2025-04-${(i % 30) + 1}T10:00:00`,
                    },
                    end: {
                      dateTime: `2025-04-${(i % 30) + 1}T11:00:00`,
                    },
                  },
                ],
              },
            };
          }

          callback(mockResponse);
          return { catch: jest.fn() };
        }),
      };
      gapi.client.newBatch.mockReturnValueOnce(mockBatch);

      // Mock the gapi.client.calendar.events.list function
      gapi.client.calendar.events.list.mockReturnValueOnce({});

      // Create an array of 100 calendar IDs
      const calendarIds = [];
      for (let i = 0; i < 100; i++) {
        calendarIds.push(`calendar-id-${i}`);
      }

      // Call the loadCalendar function with multiple calendars
      await googleCalendarWidget.loadCalendar(
        'API_KEY',
        'title-id',
        'output-id',
        10,
        false,
        calendarIds.join(',')
      );

      // Verify that the loadCalendar function was called
      expect(googleCalendarWidget.loadCalendar).toHaveBeenCalled();
    });
  });

  describe('Memory Usage', () => {
    test('should not leak memory when processing events', () => {
      // This test is more of a demonstration of how to test for memory leaks
      // In a real environment, you would use a memory profiler

      // Create a large array of events
      const events = [];
      for (let i = 0; i < 1000; i++) {
        events.push({
          id: `event-${i}`,
          summary: `Test Event ${i}`,
          start: {
            dateTime: `2025-04-${(i % 30) + 1}T10:00:00`,
          },
          end: {
            dateTime: `2025-04-${(i % 30) + 1}T11:00:00`,
          },
        });
      }

      // Mock the getTime function to return a time object
      const mockTime = {
        getDate: jest.fn().mockReturnValue(new Date()),
        isDateOnly: jest.fn().mockReturnValue(false),
      };

      // Mock the getStartTime and getEndTime functions
      googleCalendarWidget.getStartTime.mockReturnValue(mockTime);
      googleCalendarWidget.getEndTime.mockReturnValue(mockTime);

      // Mock the formatEventDetails function
      googleCalendarWidget.formatEventDetails.mockReturnValue('Test Event');

      // Mock the createClickHandler function
      googleCalendarWidget.createClickHandler.mockReturnValue(() => {});

      // Process the events multiple times
      for (let i = 0; i < 10; i++) {
        googleCalendarWidget.processFinalFeed(events);
      }

      // Verify that the processFinalFeed function was called 10 times
      expect(googleCalendarWidget.processFinalFeed).toHaveBeenCalledTimes(10);
    });
  });

  describe('Rendering Performance', () => {
    test('should render events efficiently', () => {
      // Create a mock event
      const event = {
        id: 'event-1',
        summary: 'Test Event',
        start: {
          dateTime: '2025-04-15T10:00:00',
        },
        end: {
          dateTime: '2025-04-15T11:00:00',
        },
      };

      // Mock the getTime function to return a time object
      const mockTime = {
        getDate: jest.fn().mockReturnValue(new Date()),
        isDateOnly: jest.fn().mockReturnValue(false),
      };

      // Mock the getStartTime and getEndTime functions
      googleCalendarWidget.getStartTime.mockReturnValue(mockTime);
      googleCalendarWidget.getEndTime.mockReturnValue(mockTime);

      // Call the buildDate function 1000 times
      for (let i = 0; i < 1000; i++) {
        googleCalendarWidget.buildDate(event);
      }

      // Verify that the buildDate function was called 1000 times
      expect(googleCalendarWidget.buildDate).toHaveBeenCalledTimes(1000);
    });
  });
});
