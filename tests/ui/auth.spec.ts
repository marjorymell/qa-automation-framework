import { test, expect } from '@src/fixtures/ui.fixtures';

test.describe('Authentication', () => {
  test('registers a new account and deletes it', async ({
    page,
    homePage,
    loginPage,
    signupPage,
    accountStatusPage,
    newAccount,
  }) => {
    await homePage.goto();
    await expect(homePage.carousel).toBeVisible();

    await homePage.header.goTo('Signup / Login');
    await expect(loginPage.signupHeading).toBeVisible();

    await loginPage.startSignup(newAccount.name, newAccount.email);
    await expect(signupPage.heading).toBeVisible();
    await expect(signupPage.name).toHaveValue(newAccount.name);
    await expect(signupPage.email).toHaveValue(newAccount.email);

    await signupPage.createAccount(newAccount);
    await expect(accountStatusPage.accountCreated).toBeVisible();

    await accountStatusPage.continueButton.click();
    await expect(homePage.header.loggedInAs).toContainText(newAccount.name);

    await homePage.header.goTo('Delete Account');
    await expect(accountStatusPage.accountDeleted).toBeVisible();
    await accountStatusPage.continueButton.click();
    await expect(page).toHaveURL('/');
    await expect(homePage.header.link('Signup / Login')).toBeVisible();
  });

  test('logs in with valid credentials', async ({ loginPage, account }) => {
    await loginPage.goto();
    await expect(loginPage.loginHeading).toBeVisible();

    await loginPage.login(account.email, account.password);

    await expect(loginPage.header.loggedInAs).toContainText(account.name);
    await expect(loginPage.header.link('Logout')).toBeVisible();
  });

  test('shows an error for a wrong password', async ({ page, loginPage, account }) => {
    await loginPage.goto();

    await loginPage.login(account.email, `${account.password}-wrong`);

    await expect(loginPage.loginError).toBeVisible();
    await expect(page).toHaveURL('/login');
    await expect(loginPage.header.loggedInAs).toBeHidden();
  });

  test('shows an error for an email that is not registered', async ({ loginPage, newAccount }) => {
    await loginPage.goto();

    await loginPage.login(newAccount.email, newAccount.password);

    await expect(loginPage.loginError).toBeVisible();
  });

  test('logs out and returns to the login page', async ({ page, loginPage, account }) => {
    await loginPage.goto();
    await loginPage.login(account.email, account.password);
    await expect(loginPage.header.loggedInAs).toBeVisible();

    await loginPage.header.goTo('Logout');

    await expect(page).toHaveURL('/login');
    await expect(loginPage.loginHeading).toBeVisible();
    await expect(loginPage.header.loggedInAs).toBeHidden();
  });

  test('rejects signup with an email already registered', async ({
    loginPage,
    signupPage,
    account,
  }) => {
    await loginPage.goto();

    await loginPage.startSignup(account.name, account.email);

    await expect(loginPage.signupError).toBeVisible();
    await expect(signupPage.heading).toBeHidden();
  });

  test('deletes the account from the account menu', async ({
    page,
    loginPage,
    accountStatusPage,
    accountApi,
    account,
  }) => {
    await loginPage.goto();
    await loginPage.login(account.email, account.password);

    await loginPage.header.goTo('Delete Account');

    await expect(accountStatusPage.accountDeleted).toBeVisible();
    await accountStatusPage.continueButton.click();
    await expect(page).toHaveURL('/');
    expect(await accountApi.delete(account.email, account.password), 'account should be gone').toBe(
      false,
    );
  });
});
