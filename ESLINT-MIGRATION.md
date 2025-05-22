# ESLint v9 Migration Guide

This project has been updated to use ESLint v9.27.0, which includes significant changes to the configuration format. The following changes have been made:

## Configuration Changes

- The configuration format has changed from `.eslintrc.js` to `eslint.config.js`
- The new configuration is exported as a flat array instead of a nested object
- Using CommonJS format for compatibility with Jest and existing tooling

## Package Changes

- Updated `eslint` to version 9.27.0
- Removed deprecated config packages no longer needed with ESLint 9

## Using ESLint

The same commands continue to work:

```bash
npm run lint          # Lint all JS files
npm run lint:fix      # Lint and fix all JS files
```

## Additional Resources

For more information about the ESLint v9 changes, please refer to the official migration guide:
https://eslint.org/docs/latest/use/configure/migration-guide
