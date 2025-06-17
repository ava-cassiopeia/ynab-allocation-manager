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

## Contributing

Contributions welcome! This is still a beta, so there's a lot that's still in
flight, including a better contributing guide. For now, feel free to open issues
and PRs if you're so inclined!
