# QA Automation Framework

[![CI](https://github.com/marjorymell/qa-automation-framework/actions/workflows/ci.yml/badge.svg)](https://github.com/marjorymell/qa-automation-framework/actions/workflows/ci.yml)
![Playwright](https://img.shields.io/badge/Playwright-1.x-2EAD33?logo=playwright&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)

A test automation framework built with **Playwright** and **TypeScript**.
It currently covers the [ServeRest](https://serverest.dev) REST API (an e-commerce simulator)
with 53 tests across authentication, users, products and carts.

**[Latest test report →](https://marjorymell.github.io/qa-automation-framework/)**

## Highlights

- **Self-contained runs.** The suite starts its own ServeRest instance, so tests never depend on
  shared data or fixed IDs. Point it at any other instance with `API_BASE_URL`.
- **Isolated, parallel-safe tests.** Each test creates the users, products and carts it needs
  through Playwright fixtures and removes them afterwards, in the order the API allows.
- **Contract checks.** Responses are validated against [zod](https://zod.dev) schemas, with
  readable failure messages.
- **Business rules, not just status codes.** Cart tests check totals and that stock goes down
  on purchase and back up on cancellation.
- **Typed API clients.** One client per resource; tests read as plain steps.
- **CI on every push.** Typecheck, lint and tests on GitHub Actions; the HTML report is published
  to GitHub Pages.

## Getting started

Requires Node.js 20 or later.

```bash
npm install
npm test            # starts a local ServeRest and runs every suite
npm run report      # opens the last HTML report
```

Run against another ServeRest instance:

```bash
API_BASE_URL=https://serverest.dev npm run test:api
```

| Script | What it does |
| --- | --- |
| `npm test` | Runs all Playwright projects |
| `npm run test:api` | Runs the API suite only |
| `npm run check` | Typecheck (`tsc`) and lint (`eslint`) |
| `npm run serverest` | Starts ServeRest on port 3210, to explore the API by hand |

## Project structure

```
src/
├── api/          # typed clients for each ServeRest resource
├── constants/    # API response messages
├── data/         # test data factories (faker)
├── fixtures/     # Playwright fixtures: sessions, test data, cleanup
├── schemas/      # zod response contracts
└── support/      # assertion helpers
tests/
└── api/          # auth, users, products and carts specs
```

A test reads like this:

```ts
test('takes the items out of stock', async ({ api, customer, createProduct }) => {
  const product = await createProduct({ quantidade: 10 });

  await expectStatus(
    await customer.api.carts.create({ produtos: [{ idProduto: product._id, quantidade: 3 }] }),
    201,
  );

  expect(await stockOf(api, product)).toBe(7);
});
```

`customer` is a freshly registered, logged-in user; `createProduct` creates a product as an
administrator. Both are cleaned up when the test ends.

## Coverage

| Area | Tests | What is covered |
| --- | --- | --- |
| Auth | 5 | Valid login, wrong password, unknown email, required fields, token use |
| Users | 13 | CRUD, filters, duplicate email, upsert via PUT, users with carts |
| Products | 19 | CRUD, filters, duplicate names, auth and admin-only rules, products in carts |
| Carts | 16 | Totals, stock changes, duplicates, one cart per user, cancel vs. complete purchase |

> ServeRest answers in Portuguese, so request fields and expected messages stay in Portuguese.
> Everything else in this repository is in English.

## Roadmap

- [x] API tests for ServeRest, migrated from Cypress and expanded
- [x] CI with a published HTML report
- [ ] UI tests for [Automation Exercise](https://automationexercise.com) with Page Objects
- [ ] Performance tests with k6
- [ ] Allure reporting

## Background

This project replaces two earlier Cypress projects of mine,
[automation-test-api](https://github.com/marjorymell/automation-test-api) and
[automation-project](https://github.com/marjorymell/automation-project).
Compared with them, the tests no longer rely on fixed IDs in a shared public environment,
every test cleans up after itself, and the suite checks response contracts and business rules.

## License

[MIT](LICENSE)
