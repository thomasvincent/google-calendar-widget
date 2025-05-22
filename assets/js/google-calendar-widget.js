/**
 * Google Calendar Widget JavaScript
 *
 * This file handles the fetching and display of Google Calendar events.
 * It uses the Google Calendar API v3 to retrieve events and display them
 * in a customizable format.
 *
 * @package Google_Calendar_Widget
 * @version 2.1.0
 * @author Kaz Okuda
 * @author Thomas Vincent (2025)
 * @copyright 2020-2023 Kaz Okuda
 * @copyright 2025 Thomas Vincent
 * @license GPL-2.0+ https://www.gnu.org/licenses/gpl-2.0.txt
 */

/*
 * Google Calendar Widget - Display Google Calendar events in WordPress
 * Copyright (C) 2020-2023 Kaz Okuda
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

/**
 * Main calendar module using IIFE pattern to avoid global namespace pollution
 */
const google_calendar_widget = (function ($) {
  'use strict';

  // Module object to be returned
  const result = {};

  /**
   * Log a message to the console (for debugging)
   *
   * @param {string} message - The message to log
   */
  function log(message) {
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
   *
   * @param {string} message - The error message to log
   */
  function error(message) {
    if (typeof console === 'object' && typeof console.error === 'function') {
      console.error('[Google Calendar Widget Error] ' + message);
    }
  }

  /**
   * Build the date display for a calendar entry
   *
   * @param {Object} entry - The calendar entry
   * @returns {HTMLElement} - The date row element
   */
  function buildDate(entry) {
    /* display the date/time */
    let dateString =
      google_calendar_widget_loc.all_day_event || 'All Day Event';

    /* if the event has a date & time, override the default text */
    const startTime = getStartTime(entry);
    const endTime = getEndTime(entry);

    if (startTime && endTime) {
      const startJSDate = startTime.getDate();
      const endJSDate = endTime.getDate();

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
          google_calendar_widget_loc.all_day_event || 'All Day Event';
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
   *
   * @param {Object} entry - The calendar entry
   * @returns {HTMLElement} - The location element
   */
  function buildLocation(entry) {
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
   *
   * @param {string} titleFormat - The format string
   * @param {Object} event - The calendar event
   * @returns {string} - The formatted event details
   */
  function formatEventDetails(titleFormat, event) {
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

    let startTimeString = null;
    let endTimeString = null;

    const title = event.summary;
    const startDateTime = getStartTime(event);
    const endDateTime = getEndTime(event);

    if (startDateTime) {
      if (startDateTime.isDateOnly()) {
        startTimeString = google_calendar_widget_loc.all_day || 'All Day';
      } else {
        startTimeString = startDateTime.getDate().toString('h:mm tt');
        if (endDateTime) {
          endTimeString = endDateTime.getDate().toString('h:mm tt');
        }
      }
    }

    function replaceTITLE(strMatchingString, strGroup1, strGroup2) {
      return title ? strGroup1 + title + strGroup2 : '';
    }

    function replaceSTARTTIME(strMatchingString, strGroup1, strGroup2) {
      return startTimeString ? strGroup1 + startTimeString + strGroup2 : '';
    }

    function replaceENDTIME(strMatchingString, strGroup1, strGroup2) {
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
   * Get a time object from a calendar time
   *
   * @param {Object} calendarTime - The calendar time object
   * @returns {Object} - A time object with getDate and isDateOnly methods
   */
  function getTime(calendarTime) {
    const result = {
      getDate: function () {
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
      isDateOnly: function () {
        return calendarTime.date != null;
      },
    };

    return result;
  }

  /**
   * Get the start time of a calendar entry
   *
   * @param {Object} calendarEntry - The calendar entry
   * @returns {Object|null} - The start time object or null
   */
  function getStartTime(calendarEntry) {
    return calendarEntry ? getTime(calendarEntry.start) : null;
  }

  /**
   * Get the end time of a calendar entry
   *
   * @param {Object} calendarEntry - The calendar entry
   * @returns {Object|null} - The end time object or null
   */
  function getEndTime(calendarEntry) {
    return calendarEntry ? getTime(calendarEntry.end) : null;
  }

  /**
   * Create a click handler for a calendar entry
   *
   * @param {HTMLElement} item - The HTML element to add/remove the entry details to/from
   * @param {Object} entry - The calendar entry
   * @returns {Function} - The click handler function
   */
  function createClickHandler(item, entry) {
    let descDiv = null;

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
   *
   * @param {string} titleId - The ID of the title element
   * @param {string} outputId - The ID of the output element
   * @param {number} maxResults - The maximum number of results to display
   * @param {boolean} autoExpand - Whether to auto-expand entries
   * @param {Object} googleService - The Google Calendar service
   * @param {Array} calendars - Array of calendar IDs
   * @param {string} titleFormat - The format for event titles
   */
  function createListEvents(
    titleId,
    outputId,
    maxResults,
    autoExpand,
    googleService,
    calendars,
    titleFormat
  ) {
    /**
     * Merge multiple calendar feeds into one
     *
     * @param {Object} resultObject - The result object from the batch request
     * @returns {Array} - The merged array of events
     */
    function mergeFeeds(resultObject) {
      // This function merges the input arrays of feeds into one single feed array.
      // It is assumed that each feed is sorted by date. We find the earliest item in
      // the lists by comparing the items at the start of each array.

      // Store all of the feed arrays in an array so we can "shift" items off the list.
      const entries = [];

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
      const output = [];

      while (output.length < maxResults) {
        let firstStartTime = null;
        let firstStartIndex = null;

        for (let i = 0; i < entries.length; i++) {
          if (entries[i] && entries[i].length > 0) {
            const startTime = getStartTime(entries[i][0]);
            if (startTime) {
              const startDate = startTime.getDate();
              if (firstStartTime === null || startDate < firstStartTime) {
                firstStartTime = startDate;
                firstStartIndex = i;
              }
            }
          }
        }

        if (firstStartTime !== null) {
          // Add the entry to the output and shift it off the input.
          const uid = entries[firstStartIndex][0].id;
          log('Pushing ' + firstStartTime + ' ' + uid);
          let uniqueEntry = true;

          // Remove duplicate events. They are events with the same start time and the same Uid.
          if (output.length > 0) {
            const lastOutput = output[output.length - 1];
            const lastStartTime = getStartTime(lastOutput);
            const lastUid = lastOutput.id;

            if (
              lastStartTime.getDate().getTime() === firstStartTime.getTime() &&
              lastUid === uid
            ) {
              // This is a duplicate.
              log('Duplicate event');
              uniqueEntry = false;
            }
          }

          if (uniqueEntry) {
            output.push(entries[firstStartIndex].shift());
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
     *
     * @param {Array} entries - The array of calendar entries
     */
    function processFinalFeed(entries) {
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
      let prevDateString = null;
      let eventList = null;
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

        eventList.appendChild(li);
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
      .then(function (resp) {
        const finalFeed = mergeFeeds(resp.result);
        processFinalFeed(finalFeed);
      })
      .catch(function (error) {
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
   *
   * @param {string} apiKey - The Google API key
   * @param {string} titleId - The ID of the title element
   * @param {string} outputId - The ID of the output element
   * @param {number} maxResults - The maximum number of results to display
   * @param {boolean} autoExpand - Whether to auto-expand entries
   * @param {string} calendarUrl - The first calendar ID
   * @param {string} calendarUrl2 - The second calendar ID (optional)
   * @param {string} calendarUrl3 - The third calendar ID (optional)
   * @param {string} titleFormat - The format for event titles
   */
  result.loadCalendar = function (
    apiKey,
    titleId,
    outputId,
    maxResults,
    autoExpand,
    calendarUrl,
    calendarUrl2,
    calendarUrl3,
    titleFormat
  ) {
    // Set up default localization if not provided by WordPress
    if (typeof google_calendar_widget_loc === 'undefined') {
      // When running stand along without the wordpress localization
      // we need to supply the default loc text.
      window.google_calendar_widget_loc = {
        all_day: 'All Day',
        all_day_event: 'All Day Event',
      };
    }

    const calendars = [];

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
  result.init = function () {
    // The Google Client API is ready to be used.
    log('Google Calendar Widget initialized');
  };

  return result;
})(jQuery);

/**
 * Callback function for the Google client.js onload parameter
 * This should be used as the callback function in the google client.js query parameters.
 */
function google_calendar_widget_google_init() {
  // The Google Client API is ready to be used.
  google_calendar_widget.init();
}
