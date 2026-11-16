import type { Locator, Page } from '@playwright/test';

/** Footer with the newsletter subscription form, shared by every page. */
export class Footer {
  readonly subscriptionHeading: Locator;
  readonly emailInput: Locator;
  readonly subscribeButton: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    const footer = page.locator('#footer');
    this.subscriptionHeading = footer.getByRole('heading', { name: 'Subscription' });
    // The id is misspelled on the site itself.
    this.emailInput = page.locator('#susbscribe_email');
    this.subscribeButton = page.locator('#subscribe');
    this.successMessage = page.locator('#success-subscribe');
  }

  async subscribe(email: string): Promise<void> {
    await this.subscriptionHeading.scrollIntoViewIfNeeded();
    await this.emailInput.fill(email);
    await this.subscribeButton.click();
  }
}
