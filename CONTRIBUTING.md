# Contributing to Google Calendar Widget

Thank you for considering contributing to the Google Calendar Widget plugin! This document outlines the process for contributing to this project.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone.

## GitHub Flow

This project follows the [GitHub Flow](https://guides.github.com/introduction/flow/) branching strategy:

1. **Fork the repository** (if you don't have write access)
2. **Create a branch** from `main` for your feature or bugfix
   - Use a descriptive name: `feature/add-new-option` or `fix/calendar-display-issue`
3. **Develop your changes** on your branch
4. **Write or update tests** as needed
5. **Ensure all tests pass** locally
6. **Create a pull request** to merge your changes into `main`
7. **Code review** and address any feedback
8. **Merge** once approved

## Development Workflow

### Setting Up the Development Environment

1. Clone the repository:

   ```
   git clone https://github.com/yourusername/google-calendar-widget.git
   cd google-calendar-widget
   ```

2. Install dependencies:

   ```
   composer install
   npm install
   ```

3. Set up the WordPress test environment:
   ```
   bin/install-wp-tests.sh wordpress_test root root localhost latest
   ```

### Running Tests

- Run PHP tests:

  ```
  composer test
  ```

- Run JavaScript tests:

  ```
  npm test
  ```

- Run PHP CodeSniffer:
  ```
  composer phpcs
  ```

### Coding Standards

- PHP code should follow the [WordPress Coding Standards](https://developer.wordpress.org/coding-standards/wordpress-coding-standards/php/)
- JavaScript code should follow modern ES6+ practices
- CSS should be well-organized and follow BEM naming conventions where appropriate

## Pull Request Process

1. Update the README.md and documentation with details of changes if appropriate
2. Update the CHANGELOG.md with details of changes
3. The version number will be updated by maintainers following [Semantic Versioning](https://semver.org/)
4. Your pull request will be merged once approved by a maintainer

## Release Process

Releases are managed by the project maintainers following these steps:

1. Update version numbers in:

   - `ko-calendar.php` (plugin header)
   - `package.json`
   - `composer.json`
   - `CHANGELOG.md`

2. Create a release branch:

   ```
   git checkout -b release/vX.Y.Z
   ```

3. Commit version changes:

   ```
   git add .
   git commit -m "Prepare release vX.Y.Z"
   ```

4. Create a pull request to merge into `main`

5. After merging, tag the release:

   ```
   git checkout main
   git pull
   git tag -a vX.Y.Z -m "Release vX.Y.Z"
   git push origin vX.Y.Z
   ```

6. The GitHub Actions workflow will automatically create a GitHub release and build the plugin

## Questions?

If you have any questions about contributing, please open an issue with the label "question".
