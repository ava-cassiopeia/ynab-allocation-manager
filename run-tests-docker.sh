#!/bin/bash
set -e # Exit immediately if a command exits with a non-zero status.

# Script to build the Docker image and run tests using Docker Compose.

# Navigate to the directory where this script is located
# to ensure docker-compose.yml and Dockerfile are found correctly.
cd "$(dirname "$0")"

echo "Building Docker image (if necessary)..."
docker compose build test

echo "Running tests in Docker container..."
# Using --rm to automatically remove the container after it exits.
# The 'test' service is defined in docker-compose.yml.
docker compose run --rm test

echo "Tests complete."
