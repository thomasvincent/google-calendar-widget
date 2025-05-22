# Google JavaScript/TypeScript Style Guide

This project follows the [Google JavaScript Style Guide](https://google.github.io/styleguide/jsguide.html) and [Google TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html).

## Key Principles

### Code Formatting
- **Line Length**: 80 characters maximum
- **Indentation**: 2 spaces (no tabs)
- **Semicolons**: Always required
- **Quotes**: Single quotes preferred
- **Trailing Commas**: Required in multiline

### Tools
- **Prettier**: Code formatter with 80-character line length
- **ESLint**: Style guide enforcement and linting
- **TypeScript**: Type checking for .ts files

### Running Style Checks

```bash
# Format code
npm run prettier:fix
# or
npx prettier --write .

# Lint and fix
npm run lint:fix
# or 
npx eslint --fix .

# Check only (no fixes)
npm run lint
npx prettier --check .

# Type checking (if TypeScript)
npx tsc --noEmit
```

### Configuration Files
- `.prettierrc`: Prettier configuration
- `eslint.config.js`: ESLint configuration
- `.editorconfig`: Editor settings
- `tsconfig.json`: TypeScript configuration

## Code Style Rules

### Spacing and Formatting
- Object curly braces: No spacing `{key: value}`
- Array brackets: No spacing `[item1, item2]`
- Function parentheses: No space before `function()`
- Keywords: Space before and after `if (condition)`

### Naming Conventions
- Variables/Functions: camelCase
- Constants: SCREAMING_SNAKE_CASE
- Classes: PascalCase
- Files: kebab-case.js

## Integration

Style checks are integrated into:
- Pre-commit hooks
- CI/CD pipeline
- IDE/editor settings via `.editorconfig`
- npm scripts for development workflow