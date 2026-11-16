import type { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

export class TestCasesPage extends BasePage {
  protected readonly path = '/test_cases';

  readonly heading: Locator;
  readonly titles: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.locator('h2.title', { hasText: 'Test Cases' });
    this.titles = page.locator('.panel-group h4.panel-title a');
  }
}
