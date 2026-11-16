import type { Locator, Page } from '@playwright/test';
import { AddedToCartModal } from '../components/added-to-cart-modal.component';
import { BasePage } from './base.page';

export class ProductsPage extends BasePage {
  protected readonly path = '/products';

  readonly heading: Locator;
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly cards: Locator;
  readonly addedToCart: AddedToCartModal;

  constructor(page: Page) {
    super(page);
    const items = page.locator('.features_items');
    this.heading = items.locator('h2.title');
    this.searchInput = page.locator('#search_product');
    this.searchButton = page.locator('#submit_search');
    this.cards = items.locator('.product-image-wrapper');
    this.addedToCart = new AddedToCartModal(page);
  }

  /** Product names in the order they are listed. */
  async productNames(): Promise<string[]> {
    const names = await this.cards.locator('.productinfo p').allTextContents();
    return names.map((name) => name.trim());
  }

  async search(term: string): Promise<void> {
    await this.searchInput.fill(term);
    await this.searchButton.click();
    await this.page.waitForURL(/\/products\?search=/);
  }

  card(productId: number): Locator {
    return this.cards.filter({
      has: this.page.locator(`.productinfo [data-product-id="${productId}"]`),
    });
  }

  async addToCart(productId: number): Promise<void> {
    await this.card(productId).locator('.productinfo .add-to-cart').click();
    await this.addedToCart.root.waitFor({ state: 'visible' });
  }

  async openDetails(productId: number): Promise<void> {
    await this.card(productId).getByRole('link', { name: 'View Product' }).click();
  }
}
