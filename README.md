# Allocation Manager for YNAB

**Prod:** [yam.ynab.rocks](https://yam.ynab.rocks)

Allocation Manager for YNAB is an Angular webapp that helps YNAB users assign
money to their budgeting accounts!

**It is in beta now,** and as such, this documentation is too. More
code documentation in the future!

## Development

To start the main local simulator, run:

```
./dev.sh
```

Which starts two screen sessions, one for the live build-rebuild cycle, and one
for the Firebase emulators.

### Testing

All tests can be run with:

```
npm run test
```

Angular-only tests can be run with:

```
npm run test:ng
```

Firebase Cloud Function tests can be run with:

```
npm run test:fn
```

### Testing with Docker (Recommended for CI consistency)

To ensure a consistent testing environment that mirrors CI, you can use Docker.
This is the recommended way to run the full test suite if you have Docker installed.

1.  **Ensure Docker is running.**
2.  **Run the test script:**

    ```bash
    ./run-tests-docker.sh
    ```

    This script will:
    *   Build the Docker image (if it doesn't exist or if `Dockerfile` or related files have changed). This image includes Google Chrome and all necessary dependencies.
    *   Run all tests (`npm test`) inside the Docker container.

This method ensures that tests are executed in an environment identical to the one used by the GitHub Actions workflow. For local development, changes to your source code will be reflected immediately in test runs without needing to rebuild the Docker image, thanks to volume mounting.

## Contributing

Contributions welcome! This is still a beta, so there's a lot that's still in
flight, including a better contributing guide. For now, feel free to open issues
and PRs if you're so inclined!
