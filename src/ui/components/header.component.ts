import type { Locator, Page } from '@playwright/test';

export type NavItem =
  | 'Home'
  | 'Products'
  | 'Cart'
  | 'Signup / Login'
  | 'Test Cases'
  | 'API Testing'
  | 'Contact us'
  | 'Logout'
  | 'Delete Account';

/** Top navigation, shared by every page. */
export class Header {
  readonly logo: Locator;
  readonly loggedInAs: Locator;

  constructor(private readonly page: Page) {
    const nav = page.locator('.shop-menu');
    // The logo's alt text differs between pages, so locate it by its container.
    this.logo = page.locator('.logo img');
    this.loggedInAs = nav.locator('li', { hasText: 'Logged in as' });
  }

  link(item: NavItem): Locator {
    return this.page.locator('.shop-menu').getByRole('link', { name: item, exact: false });
  }

  /** Clicks a menu link and waits until the new page has fully loaded, scripts included. */
  async goTo(item: NavItem): Promise<void> {
    await this.link(item).click();
    await this.page.waitForLoadState('load');
  }
}
