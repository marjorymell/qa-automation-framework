import type { Locator, Page } from '@playwright/test';

/** Confirmation dialog shown after adding a product to the cart. */
export class AddedToCartModal {
  readonly root: Locator;
  readonly message: Locator;

  constructor(page: Page) {
    this.root = page.locator('#cartModal');
    this.message = this.root.getByText('Your product has been added to cart.');
  }

  async continueShopping(): Promise<void> {
    await this.root.getByRole('button', { name: 'Continue Shopping' }).click();
    await this.root.waitFor({ state: 'hidden' });
  }

  async viewCart(): Promise<void> {
    await this.root.getByRole('link', { name: 'View Cart' }).click();
  }
}
