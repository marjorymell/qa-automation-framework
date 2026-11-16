import type { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

/** /login holds two forms: log in, and the first step of signing up. */
export class LoginPage extends BasePage {
  protected readonly path = '/login';

  readonly loginHeading: Locator;
  readonly loginEmail: Locator;
  readonly loginPassword: Locator;
  readonly loginButton: Locator;
  readonly loginError: Locator;

  readonly signupHeading: Locator;
  readonly signupName: Locator;
  readonly signupEmail: Locator;
  readonly signupButton: Locator;
  readonly signupError: Locator;

  constructor(page: Page) {
    super(page);
    const loginForm = page.locator('.login-form');
    this.loginHeading = loginForm.getByRole('heading', { name: 'Login to your account' });
    this.loginEmail = page.locator('[data-qa="login-email"]');
    this.loginPassword = page.locator('[data-qa="login-password"]');
    this.loginButton = page.locator('[data-qa="login-button"]');
    this.loginError = loginForm.getByText('Your email or password is incorrect!');

    const signupForm = page.locator('.signup-form');
    this.signupHeading = signupForm.getByRole('heading', { name: 'New User Signup!' });
    this.signupName = page.locator('[data-qa="signup-name"]');
    this.signupEmail = page.locator('[data-qa="signup-email"]');
    this.signupButton = page.locator('[data-qa="signup-button"]');
    this.signupError = signupForm.getByText('Email Address already exist!');
  }

  async login(email: string, password: string): Promise<void> {
    await this.loginEmail.fill(email);
    await this.loginPassword.fill(password);
    await this.loginButton.click();
  }

  async startSignup(name: string, email: string): Promise<void> {
    await this.signupName.fill(name);
    await this.signupEmail.fill(email);
    await this.signupButton.click();
  }
}
