# TypeScript Migration Guide

This project is in the process of migrating from JavaScript to TypeScript. This document provides information about the migration process and how to work with TypeScript in this project.

## Benefits of TypeScript

- **Static Type Checking**: Catch errors at compile time rather than at runtime
- **Better IDE Support**: Improved intellisense, auto-completion, and refactoring
- **Improved Code Quality**: More explicit interfaces and better documentation
- **Enhanced Maintainability**: Easier to understand and refactor code

## Project Structure

The TypeScript source files are located in the `assets/js/src` directory. The compiled JavaScript files are output to the `assets/js/dist` directory.

## Development Workflow

1. Write TypeScript code in the `assets/js/src` directory
2. Run `npm run build:ts` to compile TypeScript to JavaScript
3. Run `npm run watch` to watch for changes and compile automatically
4. Run `npm run typecheck` to check for TypeScript errors without compiling
5. Run `npm run lint` to lint TypeScript files
6. Run `npm test` to run tests (including TypeScript tests)

## Gradual Migration

We are using a gradual migration approach:

1. Added TypeScript configuration and build tools
2. Created TypeScript interfaces for existing JavaScript objects
3. Converting existing JavaScript files to TypeScript one at a time
4. Adding TypeScript tests for each converted file

## Working with TypeScript

### Adding Type Definitions

When working with existing JavaScript code, you may need to add type definitions:

```typescript
// Define an interface for existing JavaScript object
interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  start: {
    dateTime?: string;
    date?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
  };
}
```

### Declaring Global Variables

For global variables used in WordPress environment:

```typescript
declare global {
  interface Window {
    google_calendar_widget_loc: {
      all_day?: string;
      all_day_event?: string;
    };
  }
}
```

## Migration Status

- [x] Project setup with TypeScript
- [x] Basic TypeScript infrastructure (tsconfig.json, build scripts)
- [x] TypeScript tests setup
- [x] Main module converted to TypeScript
- [ ] Utility functions converted to TypeScript
- [ ] Complete test coverage with TypeScript tests
- [ ] Documentation updated for TypeScript usage
