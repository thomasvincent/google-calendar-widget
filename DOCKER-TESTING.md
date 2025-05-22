# Docker Testing for Google Calendar Widget

This project includes a fully containerized testing environment using Docker and Docker Compose. This ensures consistent test results across different development environments and CI/CD pipelines.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Running Tests with Docker

### Basic Usage

To run all tests using the default WordPress version (latest):

```bash
# Create necessary directories
mkdir -p logs test-results

# Build and run tests
docker compose build
docker compose up
```

### Specifying WordPress Version

You can test against a specific WordPress version by setting the `WP_VERSION` environment variable:

```bash
WP_VERSION=6.4 docker compose up
```

Available WordPress versions include:

- `latest` (default)
- `6.4`
- `6.3`
- `6.2`
- Any valid WordPress version number

### Running Only PHP Tests

To run only the PHP tests:

```bash
docker compose run --rm wordpress-tests composer test
```

### Running Only JavaScript Tests

To run only the JavaScript tests:

```bash
docker compose run --rm wordpress-tests npm test
```

## Test Logs

Test logs are automatically saved to the `logs` directory:

- PHP test logs: `logs/composer-test.log`
- JavaScript test logs: `logs/npm-test.log`

## Understanding the Container Environment

The container environment consists of:

1. **WordPress Test Container**: A PHP 8.0 environment with all necessary dependencies installed, including:

   - WordPress core (specific version can be specified)
   - PHPUnit with Xdebug for code coverage
   - Composer dependencies
   - Node.js 18.x and npm dependencies

2. **MySQL Container**: A MySQL 8.0 database server for WordPress tests with proper health checks

## Debugging Tests

### Enabling Xdebug

The Docker setup includes Xdebug for PHP debugging. To enable it:

1. Set the Xdebug mode in your docker-compose command:

```bash
XDEBUG_MODE=debug docker compose up
```

2. Configure your IDE to listen for Xdebug connections (typically on port 9003).

## Custom Test Commands

You can run custom commands inside the Docker container:

```bash
docker compose run --rm wordpress-tests bash -c "your-command-here"
```

Examples:

```bash
# Run PHP tests with coverage
docker compose run --rm wordpress-tests bash -c "XDEBUG_MODE=coverage composer test"

# Run a specific JavaScript test file
docker compose run --rm wordpress-tests bash -c "npm test -- tests/test-calendar.js"

# Run WordPress coding standards check
docker compose run --rm wordpress-tests bash -c "composer phpcs"
```

## CI Integration

The Docker testing setup is integrated with GitHub Actions. Every pull request automatically runs tests in the containerized environment against multiple WordPress versions.

## Customizing the Environment

You can customize the environment by modifying:

- `Dockerfile`: Change PHP version, add extensions, or modify the base environment
- `docker-compose.yml`: Adjust service configurations, add services, or modify environment variables
- `docker-entrypoint.sh`: Modify the container startup process

## Troubleshooting

### MySQL Connection Issues

If tests fail with MySQL connection errors:

```bash
# Verify MySQL is running properly
docker compose logs mysql

# Restart the test container
docker compose restart wordpress-tests
```

### Node.js or npm Issues

If you encounter Node.js or npm errors:

```bash
# Reset node_modules and reinstall
docker compose run --rm wordpress-tests bash -c "rm -rf node_modules && npm install"
```

### Test Setup Issues

If you encounter issues with the WordPress test setup:

```bash
# Verify the test environment
docker compose run --rm wordpress-tests bash -c "ls -la /tmp/wordpress-tests-lib"

# Manually trigger test environment setup
docker compose run --rm wordpress-tests bash -c "bin/install-wp-tests.sh wordpress_test root root mysql latest"
```
