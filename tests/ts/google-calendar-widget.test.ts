/**
 * TypeScript Tests for Google Calendar Widget
 * 
 * @package Google_Calendar_Widget
 * @version 2.1.0
 */

// Import the widget
import google_calendar_widget from '../../assets/js/src/google-calendar-widget';

// Mock global objects
declare global {
  interface Window {
    google_calendar_widget_loc: {
      all_day?: string;
      all_day_event?: string;
    };
  }
}

// Setup global objects needed by the widget
window.google_calendar_widget_loc = {
  all_day: 'All Day',
  all_day_event: 'All Day Event'
};

// Mock jQuery
global.jQuery = {};

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