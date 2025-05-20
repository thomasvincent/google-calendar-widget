#!/bin/bash
set -e

# Wait for MySQL to be ready with a timeout
echo "Waiting for MySQL to be ready..."
max_attempts=30
attempt=0
until mysql -h mysql -u root -proot -e "SELECT 1" &> /dev/null || [ $attempt -ge $max_attempts ]; do
  attempt=$((attempt+1))
  echo "Attempt $attempt/$max_attempts: Waiting for MySQL to be ready..."
  sleep 2
done

if [ $attempt -ge $max_attempts ]; then
  echo "Error: MySQL did not become ready in time"
  exit 1
fi

echo "MySQL is ready"

# Make sure install-wp-tests.sh exists and is executable
if [ ! -f "bin/install-wp-tests.sh" ]; then
  echo "Error: bin/install-wp-tests.sh is missing"
  ls -la bin/
  exit 1
fi

chmod +x bin/install-wp-tests.sh

# Set up WordPress test environment
if [ ! -d "/tmp/wordpress-tests-lib" ]; then
  echo "Setting up WordPress test environment..."
  bash bin/install-wp-tests.sh wordpress_test root root mysql "${WP_VERSION:-latest}"
fi

# Create logs and test-results directories if they don't exist
mkdir -p logs test-results
chmod -R 777 logs test-results

# Ensure node_modules is properly installed
if [ ! -d "node_modules" ]; then
  echo "Installing npm dependencies..."
  npm install --no-audit --legacy-peer-deps
fi

# Ensure composer dependencies are properly installed
if [ ! -d "vendor" ]; then
  echo "Installing composer dependencies..."
  composer install --no-interaction --no-progress
fi

# Show current environment
echo "============== ENVIRONMENT INFO =============="
echo "PHP version: $(php -v | head -n 1)"
echo "Node version: $(node -v)"
echo "npm version: $(npm -v)"
echo "MySQL version: $(mysql -h mysql -u root -proot -e "SELECT VERSION()" | tail -n 1)"
echo "WordPress version: ${WP_VERSION:-latest}"
echo "=============================================="

# Run tests if no command is provided
if [ $# -eq 0 ]; then
  echo "Running PHP tests..."
  composer test > logs/composer-test.log 2>&1 || touch logs/composer-test-failed.log
  
  echo "Running JavaScript tests..."
  npm test > logs/npm-test.log 2>&1 || touch logs/npm-test-failed.log
  
  if [ -f logs/composer-test-failed.log ] || [ -f logs/npm-test-failed.log ]; then
    echo "Some tests failed. See logs for details."
    cat logs/composer-test.log
    cat logs/npm-test.log
    exit 1
  else
    echo "All tests passed successfully!"
  fi
else
  # Execute the command passed to docker run
  exec "$@"
fi