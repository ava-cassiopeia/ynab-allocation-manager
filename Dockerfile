# Base image
FROM node:22-bookworm-slim

# Set environment variables
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    CHROME_BIN=/usr/bin/google-chrome-stable

# Install Google Chrome and other dependencies
RUN apt-get update && \
    apt-get install -y wget gnupg ca-certificates procps libxss1 && \
    wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add - && \
    echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list && \
    apt-get update && \
    apt-get install -y google-chrome-stable libgbm-dev libnss3 libxss1 libasound2 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 libgtk-3-0 libnspr4 libpango-1.0-0 libx11-xcb1 libxcb-dri3-0 libxcomposite1 libxdamage1 libxfixes3 libxrandr2 libxshmfence1 && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Install firebase-tools
RUN npm install -g firebase-tools

# Set working directory
WORKDIR /app

# Copy application dependency manifests
COPY package.json package-lock.json ./
COPY angular.json tsconfig.json tsconfig.app.json tsconfig.spec.json ./
COPY firebase.json .firebaserc ./
COPY functions/package.json functions/package-lock.json ./functions/
COPY functions/tsconfig.json ./functions/tsconfig.json
COPY functions/.gitignore ./functions/.gitignore # Copied for completeness, though not strictly needed for runtime
COPY functions/esbuild.js ./functions/esbuild.js

# Install main project dependencies
RUN npm ci

# Install functions dependencies
RUN npm --prefix functions ci

# Copy the rest of the application code
# Note: This order helps optimize Docker layer caching.
COPY public ./public
COPY src ./src
COPY functions/src ./functions/src
# If there are other essential config files for functions (e.g. .env files IF they are not secret and part of the build)
# ensure they are copied here or handled via CI secrets.
# COPY functions/.env.local functions/.env.test functions/.env.ynab-allocation-manager ./functions/

# Build the applications (Angular and Functions)
# This ensures that the `dist` and functions `lib` folders are created within the image
# The test script might depend on these build artifacts
RUN npm run build && npm --prefix functions run build

# Expose port if your app needs to be served (optional for tests, but good practice if image is reused)
# EXPOSE 8080

# Default command to run tests
CMD ["npm", "test"]
