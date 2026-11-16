import type { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

/** Confirmation pages shown after creating or deleting an account. */
export class AccountStatusPage extends BasePage {
  protected readonly path = '/account_created';

  readonly accountCreated: Locator;
  readonly accountDeleted: Locator;
  readonly continueButton: Locator;

  constructor(page: Page) {
    super(page);
    this.accountCreated = page.locator('[data-qa="account-created"]');
    this.accountDeleted = page.locator('[data-qa="account-deleted"]');
    this.continueButton = page.locator('[data-qa="continue-button"]');
  }
}
