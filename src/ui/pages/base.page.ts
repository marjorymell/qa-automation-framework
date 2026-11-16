import type { Page } from '@playwright/test';
import { Footer } from '../components/footer.component';
import { Header } from '../components/header.component';

export abstract class BasePage {
  /** Path relative to the UI baseURL, e.g. '/login'. */
  protected abstract readonly path: string;
  readonly header: Header;
  readonly footer: Footer;

  constructor(protected readonly page: Page) {
    this.header = new Header(page);
    this.footer = new Footer(page);
  }

  async goto(): Promise<void> {
    await this.page.goto(this.path);
  }
}
