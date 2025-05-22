/**
 * Google Calendar Widget TypeScript
 *
 * This file handles the fetching and display of Google Calendar events.
 * It uses the Google Calendar API v3 to retrieve events and display them
 * in a customizable format.
 *
 * @package Google_Calendar_Widget
 * @version 2.1.0
 * @author Thomas Vincent
 * @copyright 2025 Thomas Vincent
 * @license GPL-2.0+ https://www.gnu.org/licenses/gpl-2.0.txt
 */

/*
 * Google Calendar Widget - Display Google Calendar events in WordPress
 * Copyright (C) 2025 Thomas Vincent
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */

// Define type interfaces for the Google Calendar API
export interface GoogleCalendarWidgetLocalization {
  all_day?: string;
  all_day_event?: string;
  [key: string]: string | undefined;
}

interface GoogleCalendarTime {
  dateTime?: string;
  date?: string;
  timeZone?: string;
}

interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  start: GoogleCalendarTime;
  end: GoogleCalendarTime;
  [key: string]: any;
}

interface GoogleCalendarResponse {
  items: GoogleCalendarEvent[];
  error?: {
    message: string;
  };
  [key: string]: any;
}

interface BatchResponse {
  result: {
    [key: string]: {
      result: GoogleCalendarResponse;
    };
  };
}

interface TimeObject {
  getDate(): Date | null;
  isDateOnly(): boolean;
}

// Declare global variables from external dependencies
declare global {
  interface Window {
    googleCalendarWidgetDebug?: boolean;
    google_calendar_widget_loc: GoogleCalendarWidgetLocalization;
  }

  const gapi: {
    client: {
      setApiKey(apiKey: string): void;
      load(api: string, version: string): Promise<any>;
      newBatch(): any;
      calendar: {
        events: {
          list(params: any): any;
        };
      };
    };
  };

  interface Date {
    toString(format: string): string;
  }

  const Wiky: {
    toHtml(text: string): string;
  };
}

/**
 * Define the exported interface for the widget
 */
export interface GoogleCalendarWidget {
  loadCalendar: (
    apiKey: string,
    titleId: string,
    outputId: string,
    maxResults: number,
    autoExpand: boolean,
    calendarUrl?: string,
    calendarUrl2?: string,
    calendarUrl3?: string,
    titleFormat?: string
  ) => void;
  init: () => void;
}

/**
 * Main calendar module using module pattern to avoid global namespace pollution
 */
const createGoogleCalendarWidget = ($: JQueryStatic): GoogleCalendarWidget => {
  // 'use strict' is implicit in modules

  // Module object to be returned
  const result: {
    loadCalendar: (
      apiKey: string,
      titleId: string,
      outputId: string,
      maxResults: number,
      autoExpand: boolean,
      calendarUrl?: string,
      calendarUrl2?: string,
      calendarUrl3?: string,
      titleFormat?: string
    ) => void;
    init: () => void;
  } = {
    loadCalendar: () => {},
    init: () => {},
  };

  /**
   * Log a message to the console (for debugging)
   */
  function log(message: string): void {
    if (
      typeof console === 'object' &&
      typeof console.log === 'function' &&
      window.googleCalendarWidgetDebug
    ) {
      console.log('[Google Calendar Widget] ' + message);
    }
  }

  /**
   * Log an error to the console
   */
  function error(message: string): void {
    if (typeof console === 'object' && typeof console.error === 'function') {
      console.error('[Google Calendar Widget Error] ' + message);
    }
  }

  /**
   * Get a time object from a calendar time
   */
  function getTime(calendarTime: GoogleCalendarTime): TimeObject {
    const result: TimeObject = {
      getDate: function (): Date | null {
        if (calendarTime.dateTime) {
          return new Date(calendarTime.dateTime);
        } else if (calendarTime.date) {
          const date = new Date(calendarTime.date);
          // Since the date does not include any time zone information, Date() assumes that it is UTC.
          // But since it is just a date, it is midnight UTC, which is the day before in North America.
          // This will add the timezone offset to the date to convert the date into local time.
          return new Date(
            date.getTime() + date.getTimezoneOffset() * 60 * 1000
          );
        }
        return null;
      },
      isDateOnly: function (): boolean {
        return calendarTime.date != null;
      },
    };

    return result;
  }

  /**
   * Get the start time of a calendar entry
   */
  function getStartTime(
    calendarEntry?: GoogleCalendarEvent
  ): TimeObject | null {
    return calendarEntry ? getTime(calendarEntry.start) : null;
  }

  /**
   * Get the end time of a calendar entry
   */
  function getEndTime(calendarEntry?: GoogleCalendarEvent): TimeObject | null {
    return calendarEntry ? getTime(calendarEntry.end) : null;
  }

  /**
   * Build the date display for a calendar entry
   */
  function buildDate(entry: GoogleCalendarEvent): HTMLElement {
    /* display the date/time */
    let dateString =
      window.google_calendar_widget_loc.all_day_event || 'All Day Event';

    /* if the event has a date & time, override the default text */
    const startTime = getStartTime(entry);
    const endTime = getEndTime(entry);

    if (startTime && endTime) {
      const startJSDate = startTime.getDate();
      const endJSDate = endTime.getDate();

      if (startJSDate && endJSDate) {
        // If the start and end are dates (full day event)
        // then the end day is after the last day of the event (midnight that morning)
        let allDayEvent = false;
        if (startTime.isDateOnly() && endTime.isDateOnly()) {
          endJSDate.setDate(endJSDate.getDate() - 1);

          if (endJSDate.getTime() === startJSDate.getTime()) {
            // This is a one day event.
            allDayEvent = true;
          }
        }

        let oneDayEvent = false;
        {
          const startDay = new Date(
            startJSDate.getFullYear(),
            startJSDate.getMonth(),
            startJSDate.getDate()
          );
          const endDay = new Date(
            endJSDate.getFullYear(),
            endJSDate.getMonth(),
            endJSDate.getDate()
          );
          if (startDay.getTime() === endDay.getTime()) {
            oneDayEvent = true;
          }
        }

        if (allDayEvent) {
          dateString =
            window.google_calendar_widget_loc.all_day_event || 'All Day Event';
        } else if (oneDayEvent) {
          dateString = startJSDate.toString('ddd, MMM d, yyyy');
          dateString += ', ';
          dateString += startJSDate.toString('h:mm tt');
          dateString += ' - ';
          dateString += endJSDate.toString('h:mm tt');
        } else {
          if (!startTime.isDateOnly()) {
            dateString = startJSDate.toString('ddd, MMM d, yyyy h:mm tt');
          } else {
            dateString = startJSDate.toString('ddd, MMM d, yyyy');
          }
          dateString += ' - ';
          if (!endTime.isDateOnly()) {
            dateString += endJSDate.toString('ddd, MMM d, yyyy h:mm tt');
          } else {
            dateString += endJSDate.toString('ddd, MMM d, yyyy');
          }
        }
      }
    }

    const dateRow = document.createElement('div');
    dateRow.className = 'google-calendar-widget-entry-date-row';

    const dateDisplay = document.createElement('div');
    dateDisplay.innerHTML = dateString;
    dateDisplay.className = 'google-calendar-widget-entry-date-text';
    dateRow.appendChild(dateDisplay);

    return dateRow;
  }

  /**
   * Build the location display for a calendar entry
   */
  function buildLocation(entry: GoogleCalendarEvent): HTMLElement {
    const locationDiv = document.createElement('div');
    const locationString = entry.location;

    if (locationString) {
      locationDiv.textContent = locationString;
      locationDiv.className = 'google-calendar-widget-entry-location-text';
    }

    return locationDiv;
  }

  /**
   * Format event details according to the specified format
   */
  function formatEventDetails(
    titleFormat: string,
    event: GoogleCalendarEvent
  ): string {
    // titleFormat contains the format string from the user.
    // event is the calendar event.
    //
    // [TITLE] will be substituted with the event title.
    // [STARTTIME] will become the start time (or "All Day" if it is an all day event).
    // [ENDTIME] will become the end time (or blank if it is an all day event).
    //
    // Any extra characters included within the [] will be inserted if the value exists.
    // That is, [ENDTIME - ] will insert " - " after the end time, if and only if there is an end time.
    //
    // If an event is an all-day event, then [STARTTIME] will be replaced with "All Day" and
    // no [ENDTIME] will defined.

    let startTimeString: string | null = null;
    let endTimeString: string | null = null;

    const title = event.summary;
    const startDateTime = getStartTime(event);
    const endDateTime = getEndTime(event);

    if (startDateTime) {
      const date = startDateTime.getDate();
      if (date) {
        if (startDateTime.isDateOnly()) {
          startTimeString =
            window.google_calendar_widget_loc.all_day || 'All Day';
        } else {
          startTimeString = date.toString('h:mm tt');
          if (endDateTime) {
            const endDate = endDateTime.getDate();
            if (endDate) {
              endTimeString = endDate.toString('h:mm tt');
            }
          }
        }
      }
    }

    function replaceTITLE(
      strMatchingString: string,
      strGroup1: string,
      strGroup2: string
    ): string {
      return title ? strGroup1 + title + strGroup2 : '';
    }

    function replaceSTARTTIME(
      strMatchingString: string,
      strGroup1: string,
      strGroup2: string
    ): string {
      return startTimeString ? strGroup1 + startTimeString + strGroup2 : '';
    }

    function replaceENDTIME(
      strMatchingString: string,
      strGroup1: string,
      strGroup2: string
    ): string {
      return endTimeString ? strGroup1 + endTimeString + strGroup2 : '';
    }

    let output = titleFormat.replace(
      /\[([^\]]*)TITLE([^\]]*)\]/g,
      replaceTITLE
    );
    output = output.replace(/\[([^\]]*)STARTTIME([^\]]*)\]/g, replaceSTARTTIME);
    output = output.replace(/\[([^\]]*)ENDTIME([^\]]*)\]/g, replaceENDTIME);

    return output;
  }

  /**
   * Create a click handler for a calendar entry
   */
  function createClickHandler(
    item: HTMLElement,
    entry: GoogleCalendarEvent
  ): (e: { preventDefault: () => void }) => void {
    let descDiv: HTMLDivElement | null = null;

    return function (e) {
      e.preventDefault();

      if (descDiv === null) {
        descDiv = document.createElement('div');

        descDiv.appendChild(buildDate(entry));
        descDiv.appendChild(buildLocation(entry));

        const bodyDiv = document.createElement('div');
        bodyDiv.className = 'google-calendar-widget-entry-body';

        // Use Wiky.js to convert wiki markup to HTML if available
        if (typeof Wiky !== 'undefined' && typeof Wiky.toHtml === 'function') {
          bodyDiv.innerHTML = Wiky.toHtml(entry.description || '');
        } else {
          bodyDiv.innerHTML = entry.description || '';
        }

        descDiv.appendChild(bodyDiv);
        item.appendChild(descDiv);

        // Add accessibility attributes
        item.setAttribute('aria-expanded', 'true');
      } else {
        // Hide all the children of this node (which should be text we added above)
        item.removeChild(descDiv);
        descDiv = null;

        // Update accessibility attributes
        item.setAttribute('aria-expanded', 'false');
      }
    };
  }

  /**
   * Create a list of events from the calendar feed
   */
  function createListEvents(
    titleId: string,
    outputId: string,
    maxResults: number,
    autoExpand: boolean,
    googleService: any,
    calendars: string[],
    titleFormat: string
  ): void {
    /**
     * Merge multiple calendar feeds into one
     */
    function mergeFeeds(resultObject: any): GoogleCalendarEvent[] {
      // This function merges the input arrays of feeds into one single feed array.
      // It is assumed that each feed is sorted by date. We find the earliest item in
      // the lists by comparing the items at the start of each array.

      // Store all of the feed arrays in an array so we can "shift" items off the list.
      const entries: GoogleCalendarEvent[][] = [];

      for (const key in resultObject) {
        const entry = resultObject[key].result;
        if (entry) {
          // Check for errors
          if (entry.error) {
            error(
              'Error downloading Calendar ' + key + ' : ' + entry.error.message
            );
          } else {
            log('Feed ' + key + ' has ' + entry.items.length + ' entries');
            entries.push(entry.items);
          }
        }
      }

      log(
        'Merging ' + entries.length + ' feeds into ' + maxResults + ' results.'
      );

      // Now look at the first element in each feed to figure out which one is first.
      // Insert them in the output in chronological order.
      const output: GoogleCalendarEvent[] = [];

      while (output.length < maxResults) {
        let firstStartTime: Date | null = null;
        let firstStartIndex: number | null = null;

        for (let i = 0; i < entries.length; i++) {
          if (entries[i] && entries[i].length > 0) {
            const startTime = getStartTime(entries[i][0]);
            if (startTime) {
              const startDate = startTime.getDate();
              if (
                startDate &&
                (firstStartTime === null || startDate < firstStartTime)
              ) {
                firstStartTime = startDate;
                firstStartIndex = i;
              }
            }
          }
        }

        if (firstStartTime !== null && firstStartIndex !== null) {
          // Add the entry to the output and shift it off the input.
          const uid = entries[firstStartIndex][0].id;
          log('Pushing ' + firstStartTime + ' ' + uid);
          let uniqueEntry = true;

          // Remove duplicate events. They are events with the same start time and the same Uid.
          if (output.length > 0) {
            const lastOutput = output[output.length - 1];
            const lastStartTime = getStartTime(lastOutput);
            const lastUid = lastOutput.id;

            const lastStartDate = lastStartTime?.getDate();
            if (
              lastStartDate &&
              lastStartDate.getTime() === firstStartTime.getTime() &&
              lastUid === uid
            ) {
              // This is a duplicate.
              log('Duplicate event');
              uniqueEntry = false;
            }
          }

          if (uniqueEntry) {
            const event = entries[firstStartIndex].shift();
            if (event) {
              output.push(event);
            }
          } else {
            entries[firstStartIndex].shift();
          }
        } else {
          // No new items were found, so we must have run out.
          break;
        }
      }

      return output;
    }

    /**
     * Process the final feed and display the events
     */
    function processFinalFeed(entries: GoogleCalendarEvent[]): void {
      const eventDiv = document.getElementById(outputId);

      if (!eventDiv) {
        error('Could not find output element with ID: ' + outputId);
        return;
      }

      // Remove all the children of this node (should just be the loading gif)
      while (eventDiv.childNodes.length > 0) {
        eventDiv.removeChild(eventDiv.childNodes[0]);
      }

      // If no entries, display a message
      if (!entries || entries.length === 0) {
        const noEventsDiv = document.createElement('div');
        noEventsDiv.className = 'google-calendar-widget-no-events';
        noEventsDiv.textContent = 'No upcoming events found.';
        eventDiv.appendChild(noEventsDiv);
        return;
      }

      /* loop through each event in the feed */
      let prevDateString: string | null = null;
      let eventList: HTMLDivElement | null = null;
      const len = entries.length;

      for (let i = 0; i < len; i++) {
        const entry = entries[i];
        const startDateTime = getStartTime(entry);
        const startJSDate = startDateTime ? startDateTime.getDate() : null;

        if (!startJSDate) {
          continue;
        }

        const dateString = startJSDate.toString('MMM dd');

        if (dateString !== prevDateString) {
          // Append the previous list of events to the widget
          if (eventList !== null) {
            eventDiv.appendChild(eventList);
          }

          // Create a date div element
          const dateDiv = document.createElement('div');
          dateDiv.className = 'google-calendar-widget-date';
          dateDiv.textContent = dateString;

          // Add the date to the calendar
          eventDiv.appendChild(dateDiv);

          // Create a div to add each agenda item
          eventList = document.createElement('div');
          eventList.className = 'google-calendar-widget-event-list';

          prevDateString = dateString;
        }

        const li = document.createElement('div');
        li.className = 'google-calendar-widget-event-item';

        // Add the title as the first thing in the list item
        // Make it an anchor so that we can set an onclick handler and
        // make it look like a clickable link
        const entryTitle = document.createElement('a');
        entryTitle.className = 'google-calendar-widget-entry-title';
        entryTitle.href = '#';
        entryTitle.setAttribute('role', 'button');
        entryTitle.setAttribute('aria-expanded', 'false');

        const titleString = formatEventDetails(titleFormat, entry);
        entryTitle.innerHTML = titleString;

        // Show and hide the entry text when the entryTitle is clicked.
        entryTitle.onclick = createClickHandler(li, entry);

        li.appendChild(entryTitle);

        if (autoExpand) {
          entryTitle.onclick({ preventDefault: function () {} });
        }

        if (eventList) {
          eventList.appendChild(li);
        }
      }

      if (eventList !== null) {
        eventDiv.appendChild(eventList);
      }
    }

    // Create a batch request to fetch events from multiple calendars
    const batch = gapi.client.newBatch();

    for (
      let calendarIndex = 0;
      calendarIndex < calendars.length;
      calendarIndex++
    ) {
      const idString = calendars[calendarIndex];

      // Skip blank calendars.
      if (idString && idString !== '') {
        // Split the url by ',' to allow more than just the 3 allowed by the 3 parameters.
        const idArray = idString.split(',');

        for (let idIndex = 0; idIndex < idArray.length; idIndex++) {
          const calendarId = idArray[idIndex].trim();

          if (calendarId) {
            const timeMin = new Date().toISOString();
            const params = {
              maxResults: maxResults,
              calendarId: calendarId,
              singleEvents: true,
              orderBy: 'startTime',
              timeMin: timeMin,
            };

            batch.add(googleService.events.list(params), { id: calendarId });
          }
        }
      }
    }

    // Execute the batch request
    batch
      .then(function (resp: BatchResponse) {
        const finalFeed = mergeFeeds(resp.result);
        processFinalFeed(finalFeed);
      })
      .catch(function (error: Error) {
        console.error('Error fetching calendar events:', error);

        // Display error message in the widget
        const eventDiv = document.getElementById(outputId);
        if (eventDiv) {
          while (eventDiv.childNodes.length > 0) {
            eventDiv.removeChild(eventDiv.childNodes[0]);
          }

          const errorDiv = document.createElement('div');
          errorDiv.className = 'google-calendar-widget-error';
          errorDiv.textContent =
            'Error loading calendar events. Please check your API key and calendar IDs.';
          eventDiv.appendChild(errorDiv);
        }
      });
  }

  /**
   * Load a calendar with the specified parameters
   */
  result.loadCalendar = function (
    apiKey: string,
    titleId: string,
    outputId: string,
    maxResults: number,
    autoExpand: boolean,
    calendarUrl?: string,
    calendarUrl2?: string,
    calendarUrl3?: string,
    titleFormat: string = '[TITLE]'
  ): void {
    // Set up default localization if not provided by WordPress
    if (typeof window.google_calendar_widget_loc === 'undefined') {
      // When running stand along without the wordpress localization
      // we need to supply the default loc text.
      window.google_calendar_widget_loc = {
        all_day: 'All Day',
        all_day_event: 'All Day Event',
      };
    }

    const calendars: string[] = [];

    if (calendarUrl) calendars.push(calendarUrl);
    if (calendarUrl2) calendars.push(calendarUrl2);
    if (calendarUrl3) calendars.push(calendarUrl3);

    // Initialize the Google API client with the API key
    gapi.client.setApiKey(apiKey);

    // Load the Calendar API
    gapi.client
      .load('calendar', 'v3')
      .then(function (result) {
        if (result && result.error) {
          error(
            'Error loading calendar client API (Could be due to an invalid API Key) : ' +
              result.error.message
          );
        } else {
          createListEvents(
            titleId,
            outputId,
            maxResults,
            autoExpand,
            gapi.client.calendar,
            calendars,
            titleFormat
          );
        }
      })
      .catch(function (err) {
        error('Error loading Google Calendar API: ' + err.message);

        // Display error message in the widget
        const eventDiv = document.getElementById(outputId);
        if (eventDiv) {
          while (eventDiv.childNodes.length > 0) {
            eventDiv.removeChild(eventDiv.childNodes[0]);
          }

          const errorDiv = document.createElement('div');
          errorDiv.className = 'google-calendar-widget-error';
          errorDiv.textContent =
            'Error loading Google Calendar API. Please check your API key.';
          eventDiv.appendChild(errorDiv);
        }
      });
  };

  /**
   * Initialize the calendar module when the Google Client API is ready
   */
  result.init = function (): void {
    // The Google Client API is ready to be used.
    log('Google Calendar Widget initialized');
  };

  return result;
};

// Initialize the widget with jQuery from the window
const google_calendar_widget = createGoogleCalendarWidget(window.jQuery);

/**
 * Callback function for the Google client.js onload parameter
 * This should be used as the callback function in the google client.js query parameters.
 */
export function google_calendar_widget_google_init(): void {
  // The Google Client API is ready to be used.
  google_calendar_widget.init();
}

// Export for module usage
export default google_calendar_widget;
