import type { Page } from '@playwright/test';
import { Header } from '../components/header.component';

export abstract class BasePage {
  /** Path relative to the UI baseURL, e.g. '/login'. */
  protected abstract readonly path: string;
  readonly header: Header;

  constructor(protected readonly page: Page) {
    this.header = new Header(page);
  }

  async goto(): Promise<void> {
    await this.page.goto(this.path);
  }
}
