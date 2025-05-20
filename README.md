# Google Calendar Widget

[![CI Status](https://github.com/thomasvincent/google-calendar-widget/workflows/CI/badge.svg)](https://github.com/thomasvincent/google-calendar-widget/actions)
[![WordPress Plugin Version](https://img.shields.io/wordpress/plugin/v/google-calendar-widget.svg)](https://wordpress.org/plugins/google-calendar-widget/)
[![WordPress Plugin Rating](https://img.shields.io/wordpress/plugin/rating/google-calendar-widget.svg)](https://wordpress.org/plugins/google-calendar-widget/)
[![WordPress Plugin Downloads](https://img.shields.io/wordpress/plugin/dt/google-calendar-widget.svg)](https://wordpress.org/plugins/google-calendar-widget/)
[![License: GPL v2](https://img.shields.io/badge/License-GPL%20v2-blue.svg)](https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html)

> A WordPress plugin that displays upcoming events from one or more Google Calendars in a customizable widget.

## Table of Contents

- [Google Calendar Widget](#google-calendar-widget)
  - [Table of Contents](#table-of-contents)
  - [Background](#background)
  - [Features](#features)
  - [Install](#install)
    - [WordPress Admin](#wordpress-admin)
    - [Manual Installation](#manual-installation)
  - [Usage](#usage)
    - [Getting a Google API Key](#getting-a-google-api-key)
    - [Widget Settings](#widget-settings)
    - [Event Title Format](#event-title-format)
  - [FAQ](#faq)
    - [How do I find my Google Calendar ID?](#how-do-i-find-my-google-calendar-id)
    - [How do I make my Google Calendar public?](#how-do-i-make-my-google-calendar-public)
    - [Can I display events from multiple calendars?](#can-i-display-events-from-multiple-calendars)
    - [Does this plugin work with private calendars?](#does-this-plugin-work-with-private-calendars)
  - [Security](#security)
  - [API](#api)
  - [Maintainers](#maintainers)
  - [Contributing](#contributing)
    - [Development Setup](#development-setup)
  - [License](#license)

## Background

Google Calendar Widget allows you to display upcoming events from Google Calendars on your WordPress site. The widget is highly customizable and can display events from multiple calendars, with options for formatting and display.

## Features

- Display upcoming events from one or more Google Calendars
- Customize the number of events to display
- Format event titles with customizable templates
- Option to expand event details by default
- Responsive design that works on all devices
- Accessibility-ready with keyboard navigation and screen reader support
- Internationalization support with translation-ready text
- RTL language support
- High contrast mode support

## Install

### WordPress Admin

1. Go to Plugins > Add New in your WordPress admin
2. Search for "Google Calendar Widget"
3. Click "Install Now" and then "Activate"
4. Go to Settings > Google Calendar Widget to configure your Google API key
5. Add the Google Calendar Widget to your sidebar through the 'Widgets' menu

### Manual Installation

1. Download the plugin zip file from [the releases page](https://github.com/thomasvincent/google-calendar-widget/releases)
2. Upload the `google-calendar-widget` folder to the `/wp-content/plugins/` directory
3. Activate the plugin through the 'Plugins' menu in WordPress
4. Go to Settings > Google Calendar Widget to configure your Google API key
5. Add the Google Calendar Widget to your sidebar through the 'Widgets' menu

## Usage

### Getting a Google API Key

1. Go to the [Google Cloud Console](https://console.developers.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Calendar API for your project
4. Create an API key
5. Restrict the API key to your domain for security
6. Enter the API key in the plugin settings (Settings > Google Calendar Widget)

### Widget Settings

- **Calendar Title**: The title displayed above the calendar events
- **Maximum Results**: The maximum number of events to display (1-50)
- **Expand Entries by Default**: Whether to show event details by default
- **Calendar IDs**: The ID(s) of the Google Calendar(s) to display events from
  - You can find the Calendar ID in your Google Calendar settings
  - You can add multiple Calendar IDs by separating them with commas
- **Event Title Format**: Customize how event titles are displayed

### Event Title Format

Use the following placeholders in the Event Title Format field:
- `[TITLE]`: The event title
- `[STARTTIME]`: The start time (or "All Day" for all-day events)
- `[ENDTIME]`: The end time (blank for all-day events)

You can also include additional text within the brackets, which will only appear if the value exists. For example, `[STARTTIME - ][TITLE]` will display the start time followed by a dash and a space, but only if there is a start time.

## FAQ

### How do I find my Google Calendar ID?

1. Go to [Google Calendar](https://calendar.google.com/)
2. Click on the three dots next to the calendar name in the left sidebar
3. Select "Settings and sharing"
4. Scroll down to "Integrate calendar"
5. The Calendar ID is listed there (e.g., `example@group.calendar.google.com`)

### How do I make my Google Calendar public?

1. Go to [Google Calendar](https://calendar.google.com/)
2. Click on the three dots next to the calendar name in the left sidebar
3. Select "Settings and sharing"
4. Under "Access permissions," check "Make available to public"
5. Save your changes

### Can I display events from multiple calendars?

Yes, you can display events from up to three different calendars. Enter each Calendar ID in the widget settings, or separate multiple IDs with commas in a single field.

### Does this plugin work with private calendars?

The plugin works with public calendars by default. To display events from private calendars, you would need to implement additional authentication methods, which are not currently supported in this version of the plugin.

## Security

This plugin follows WordPress security best practices:

- All user inputs are properly sanitized and validated
- All outputs are properly escaped
- The plugin uses WordPress nonces for form submissions
- API keys are stored securely in the WordPress options table

## API

## System Requirements

- PHP 8.1 or higher (tested with 8.1, 8.2, 8.3)
- WordPress 6.3 or higher (tested with 6.3, 6.4, 6.5, and latest)
- Node.js 20.x (for development only)

The plugin provides the following JavaScript API for developers:

```javascript
// Initialize the calendar with custom settings
google_calendar_widget.loadCalendar(
    'YOUR_API_KEY',
    'element-title-id',
    'element-events-id',
    10, // Maximum number of events
    false, // Auto-expand events
    'primary-calendar-id@example.com',
    'secondary-calendar-id@example.com',
    'tertiary-calendar-id@example.com',
    '[STARTTIME - ][TITLE]' // Event title format
);
```

See the [examples/standalone.html](examples/standalone.html) file for a complete example of using the plugin outside of WordPress.

## Maintainers

[@thomasvincent](https://github.com/thomasvincent)

## Contributing

Feel free to dive in! [Open an issue](https://github.com/thomasvincent/google-calendar-widget/issues/new) or submit PRs.

This project follows the [Contributor Covenant](http://contributor-covenant.org/version/1/3/0/) Code of Conduct.

### Development Setup

1. Clone the repository
2. Run `composer install` to install PHP dependencies
3. Run `npm install` to install JavaScript dependencies
4. Run `npm test` to run the JavaScript tests
5. Run `composer test` to run the PHP tests

See [CONTRIBUTING.md](CONTRIBUTING.md) for more details.

## License

[GPL-2.0](LICENSE) © Thomas Vincent