import type { Locator, Page } from '@playwright/test';
import { AddedToCartModal } from '../components/added-to-cart-modal.component';
import { BasePage } from './base.page';

export class ProductDetailsPage extends BasePage {
  protected path = '/product_details/1';

  readonly name: Locator;
  readonly category: Locator;
  readonly price: Locator;
  readonly quantity: Locator;
  readonly addToCartButton: Locator;
  readonly availability: Locator;
  readonly condition: Locator;
  readonly brand: Locator;
  readonly addedToCart: AddedToCartModal;

  constructor(page: Page) {
    super(page);
    const info = page.locator('.product-information');
    this.name = info.locator('h2');
    this.category = info.locator('p', { hasText: 'Category:' });
    this.price = info.locator('span > span');
    this.quantity = page.locator('#quantity');
    this.addToCartButton = info.getByRole('button', { name: 'Add to cart' });
    this.availability = info.locator('p', { hasText: 'Availability:' });
    this.condition = info.locator('p', { hasText: 'Condition:' });
    this.brand = info.locator('p', { hasText: 'Brand:' });
    this.addedToCart = new AddedToCartModal(page);
  }

  async gotoProduct(productId: number): Promise<void> {
    this.path = `/product_details/${productId}`;
    await this.goto();
  }

  async addToCart(quantity = 1): Promise<void> {
    await this.quantity.fill(String(quantity));
    await this.addToCartButton.click();
    await this.addedToCart.root.waitFor({ state: 'visible' });
  }
}
