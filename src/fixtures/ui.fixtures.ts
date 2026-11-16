import { test as base } from '@playwright/test';
import { buildAccount } from '@src/data/factories';
import { AccountApi } from '@src/ui/account-api';
import { AccountStatusPage } from '@src/ui/pages/account-status.page';
import { HomePage } from '@src/ui/pages/home.page';
import { LoginPage } from '@src/ui/pages/login.page';
import { SignupPage } from '@src/ui/pages/signup.page';
import type { Account } from '@src/ui/types';

/**
 * Automation Exercise serves ads that open overlays and slow pages down.
 * Blocking them keeps the tests fast and stable.
 */
const AD_HOSTS =
  /googlesyndication\.com|doubleclick\.net|googleadservices\.com|adservice\.google|fundingchoicesmessages\.google\.com|googletagservices\.com/;

interface UiFixtures {
  accountApi: AccountApi;
  /** An account registered through the API, deleted after the test. */
  account: Account;
  /** Fresh account data, not registered. Deleted after the test if a test creates it. */
  newAccount: Account;
  homePage: HomePage;
  loginPage: LoginPage;
  signupPage: SignupPage;
  accountStatusPage: AccountStatusPage;
}

export const test = base.extend<UiFixtures>({
  context: async ({ context }, use) => {
    await context.route(AD_HOSTS, (route) => route.abort());
    await use(context);
  },

  accountApi: async ({ request, baseURL }, use) => {
    await use(new AccountApi(request, baseURL!));
  },

  account: async ({ accountApi }, use) => {
    const account = buildAccount();
    await accountApi.create(account);
    await use(account);
    await accountApi.delete(account.email, account.password);
  },

  newAccount: async ({ accountApi }, use) => {
    const account = buildAccount();
    await use(account);
    await accountApi.delete(account.email, account.password);
  },

  homePage: async ({ page }, use) => use(new HomePage(page)),
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  signupPage: async ({ page }, use) => use(new SignupPage(page)),
  accountStatusPage: async ({ page }, use) => use(new AccountStatusPage(page)),
});

export { expect } from '@playwright/test';
