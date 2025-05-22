#\!/bin/bash
set -e

# Default values
DOCKER_MODE=false
WP_VERSION="latest"
COVERAGE=false

# Parse command-line arguments
while [[ $# -gt 0 ]]; do
  key="$1"
  case $key in
    --docker)
      DOCKER_MODE=true
      shift
      ;;
    --wp-version=*)
      WP_VERSION="${key#*=}"
      shift
      ;;
    --coverage)
      COVERAGE=true
      shift
      ;;
    *)
      echo "Unknown option: $key"
      echo "Usage: $0 [--docker] [--wp-version=latest] [--coverage]"
      exit 1
      ;;
  esac
done

# Create logs and test-results directories
mkdir -p logs test-results
chmod -R 777 logs test-results

echo "Running tests with WP version: $WP_VERSION"
echo "Docker mode: $DOCKER_MODE"
echo "Coverage: $COVERAGE"

# Run PHP tests
echo "Running PHP tests..."
if [ "$COVERAGE" = true ]; then
  if [ "$DOCKER_MODE" = true ]; then
    XDEBUG_MODE=coverage composer test -- --coverage-clover=test-results/clover.xml > logs/composer-test.log 2>&1 || touch logs/composer-test-failed.log
  else
    XDEBUG_MODE=coverage composer test -- --coverage-clover=test-results/clover.xml
  fi
else
  if [ "$DOCKER_MODE" = true ]; then
    composer test > logs/composer-test.log 2>&1 || touch logs/composer-test-failed.log
  else
    composer test
  fi
fi

# Run JavaScript tests
echo "Running JavaScript tests..."
if [ "$COVERAGE" = true ]; then
  if [ "$DOCKER_MODE" = true ]; then
    npm run test:coverage > logs/npm-test.log 2>&1 || touch logs/npm-test-failed.log
  else
    npm run test:coverage
  fi
else
  if [ "$DOCKER_MODE" = true ]; then
    npm test > logs/npm-test.log 2>&1 || touch logs/npm-test-failed.log
  else
    npm test
  fi
fi

# Check for test failures in Docker mode
if [ "$DOCKER_MODE" = true ]; then
  if [ -f logs/composer-test-failed.log ] || [ -f logs/npm-test-failed.log ]; then
    echo "Some tests failed. See logs for details."
    cat logs/composer-test.log
    cat logs/npm-test.log
    exit 1
  else
    echo "All tests passed successfully\!"
  fi
fi
