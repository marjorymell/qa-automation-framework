import type { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

export interface CartRow {
  root: Locator;
  name: Locator;
  price: Locator;
  quantity: Locator;
  total: Locator;
  remove: Locator;
}

export class CartPage extends BasePage {
  protected readonly path = '/view_cart';

  readonly rows: Locator;
  readonly emptyMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.rows = page.locator('#cart_info_table tbody tr[id^="product-"]');
    this.emptyMessage = page.locator('#empty_cart').getByText('Cart is empty!');
  }

  row(productId: number): CartRow {
    const root = this.page.locator(`#product-${productId}`);
    return {
      root,
      name: root.locator('.cart_description h4 a'),
      price: root.locator('.cart_price p'),
      quantity: root.locator('.cart_quantity button'),
      total: root.locator('.cart_total_price'),
      remove: root.locator('.cart_quantity_delete'),
    };
  }

  async removeProduct(productId: number): Promise<void> {
    const row = this.row(productId);
    await row.remove.click();
    await row.root.waitFor({ state: 'detached' });
  }
}
