import type { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

export class HomePage extends BasePage {
  protected readonly path = '/';
  readonly carousel: Locator;

  constructor(page: Page) {
    super(page);
    this.carousel = page.locator('#slider-carousel');
  }
}
