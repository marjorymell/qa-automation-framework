# QA Automation Framework

[![CI](https://github.com/marjorymell/qa-automation-framework/actions/workflows/ci.yml/badge.svg)](https://github.com/marjorymell/qa-automation-framework/actions/workflows/ci.yml)
![Playwright](https://img.shields.io/badge/Playwright-1.x-2EAD33?logo=playwright&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)

A test automation framework built with **Playwright** and **TypeScript**, with two suites:

- **API** — 53 tests for the [ServeRest](https://serverest.dev) REST API (an e-commerce simulator):
  authentication, users, products and carts.
- **UI** — 29 tests for [Automation Exercise](https://automationexercise.com), written with
  Page Objects: signup and login, product catalog and search, cart, contact form, newsletter
  and navigation.

**[Latest test report →](https://marjorymell.github.io/qa-automation-framework/)**

## Highlights

- **Self-contained API runs.** The suite starts its own ServeRest instance, so tests never depend
  on shared data or fixed IDs. Point it at any other instance with `API_BASE_URL`.
- **Isolated, parallel-safe tests.** Each test creates the data it needs through fixtures and
  removes it afterwards — users, products and carts in ServeRest, accounts in Automation Exercise.
- **UI tests checked against the API.** Product listings, details and search results in the
  browser are compared with what the site's own API returns, instead of hard-coded names and prices.
- **Fast UI setup.** Login tests create their accounts through the API; only the signup test goes
  through the full form.
- **Contract checks.** API responses are validated against [zod](https://zod.dev) schemas.
- **Business rules, not just status codes.** Cart totals, stock that goes down on purchase and
  back up on cancellation, quantities that add up in the cart.
- **Stable UI runs.** Third-party ads are blocked, and traces, screenshots and videos are kept
  for failed tests.
- **CI on every push and daily.** Typecheck, lint, API and UI jobs on GitHub Actions; the reports
  are merged and published to GitHub Pages.

## Getting started

Requires Node.js 20 or later.

```bash
npm install
npm run install:browsers   # Chromium for the UI suite
npm test                   # runs both suites
npm run report             # opens the last HTML report
```

| Script | What it does |
| --- | --- |
| `npm test` | Runs every suite |
| `npm run test:api` | API suite only (starts a local ServeRest) |
| `npm run test:ui` | UI suite only |
| `npm run check` | Typecheck (`tsc`) and lint (`eslint`) |
| `npm run serverest` | Starts ServeRest on port 3210, to explore the API by hand |

| Variable | Default | Purpose |
| --- | --- | --- |
| `API_BASE_URL` | local ServeRest | Run the API suite against another instance |
| `SERVEREST_PORT` | `3210` | Port for the local ServeRest |
| `UI_BASE_URL` | `https://automationexercise.com` | Site for the UI suite |

## Project structure

```
src/
├── api/          # typed clients for each ServeRest resource
├── constants/    # ServeRest response messages
├── data/         # test data factories (faker)
├── fixtures/     # Playwright fixtures: sessions, accounts, pages, cleanup
├── schemas/      # zod response contracts
├── support/      # assertion helpers
└── ui/
    ├── components/   # header, footer, cart modal
    ├── pages/        # Page Objects
    ├── account-api.ts
    └── catalog-api.ts
tests/
├── api/          # auth, users, products, carts
└── ui/           # auth, products, cart, contact and subscription, navigation
```

An API test:

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

A UI test:

```ts
test('logs in with valid credentials', async ({ loginPage, account }) => {
  await loginPage.goto();

  await loginPage.login(account.email, account.password);

  await expect(loginPage.header.loggedInAs).toContainText(account.name);
});
```

`account` is registered through the site's API before the test and deleted after it.

## Coverage

| Suite | Area | Tests | What is covered |
| --- | --- | --- | --- |
| API | Auth | 5 | Valid login, wrong password, unknown email, required fields, token use |
| API | Users | 13 | CRUD, filters, duplicate email, upsert via PUT, users with carts |
| API | Products | 19 | CRUD, filters, duplicate names, auth and admin-only rules, products in carts |
| API | Carts | 16 | Totals, stock changes, duplicates, one cart per user, cancel vs. complete purchase |
| UI | Auth | 7 | Signup, login, wrong password, unknown email, logout, existing email, delete account |
| UI | Products | 6 | Full listing, product details, search (3 terms) and empty search, all checked against the API |
| UI | Cart | 5 | Add from list and from details, quantities, repeated product, remove, empty cart |
| UI | Contact and subscription | 4 | Contact form with attachment, required email, newsletter on home and cart pages |
| UI | Navigation | 7 | Every header link, test cases page |

> ServeRest answers in Portuguese, so request fields and expected messages stay in Portuguese.
> Everything else in this repository is in English.

## Roadmap

- [x] API tests for ServeRest, migrated from Cypress and expanded
- [x] UI tests for Automation Exercise with Page Objects, migrated from Cypress and expanded
- [x] CI with merged, published reports
- [ ] Checkout and order flows (Automation Exercise test cases 14–16, 23–24)
- [ ] Performance tests with k6
- [ ] Allure reporting

## Background

This project replaces two earlier Cypress projects of mine,
[automation-test-api](https://github.com/marjorymell/automation-test-api) and
[automation-project](https://github.com/marjorymell/automation-project).
Compared with them, tests no longer rely on fixed IDs or shared accounts, every test cleans up
after itself, selectors no longer depend on element positions, and assertions check contracts,
business rules and consistency between the UI and the API.

## License

[MIT](LICENSE)
