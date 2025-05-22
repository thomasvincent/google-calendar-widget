/**
 * TypeScript Tests for Google Calendar Widget
 *
 * @package Google_Calendar_Widget
 * @version 2.1.0
 */

// Import the widget and types
import google_calendar_widget, {
  GoogleCalendarWidgetLocalization,
  GoogleCalendarWidget,
} from '../../assets/js/src/google-calendar-widget';
// Mock global objects
declare global {
  interface Window {
    google_calendar_widget_loc: GoogleCalendarWidgetLocalization;
    jQuery: any;
  }
}

// Setup test environment
beforeAll(() => {
  // Setup global window object if needed in test environment
  global.window = global.window || ({} as Window & typeof globalThis);

  // Setup localization
  window.google_calendar_widget_loc = {
    all_day: 'All Day',
    all_day_event: 'All Day Event',
  };

  // Mock jQuery
  const mockJQuery = {} as any;
  window.jQuery = mockJQuery;
  (global as any).jQuery = mockJQuery;
});

describe('Google Calendar Widget', () => {
  test('Widget is defined', () => {
    expect(google_calendar_widget).toBeDefined();
  });

  test('Widget has loadCalendar function', () => {
    expect(google_calendar_widget.loadCalendar).toBeDefined();
    expect(typeof google_calendar_widget.loadCalendar).toBe('function');
  });

  test('Widget has init function', () => {
    expect(google_calendar_widget.init).toBeDefined();
    expect(typeof google_calendar_widget.init).toBe('function');
  });
});
