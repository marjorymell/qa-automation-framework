import { test, expect } from '@src/fixtures/ui.fixtures';
import type { NavItem } from '@src/ui/components/header.component';

test.describe('Navigation', () => {
  const pages: Array<{ item: NavItem; url: string; title: RegExp }> = [
    { item: 'Products', url: '/products', title: /All Products/ },
    { item: 'Cart', url: '/view_cart', title: /Checkout/ },
    { item: 'Signup / Login', url: '/login', title: /Signup \/ Login/ },
    { item: 'Test Cases', url: '/test_cases', title: /Test Cases/ },
    { item: 'API Testing', url: '/api_list', title: /API Testing/ },
    { item: 'Contact us', url: '/contact_us', title: /Contact Us/ },
  ];

  for (const { item, url, title } of pages) {
    test(`header link "${item}" opens ${url}`, async ({ page, homePage }) => {
      await homePage.goto();

      await homePage.header.goTo(item);

      await expect(page).toHaveURL(url);
      await expect(page).toHaveTitle(title);
      await expect(homePage.header.logo).toBeVisible();
    });
  }

  test('lists the test cases in order', async ({ homePage, testCasesPage }) => {
    await homePage.goto();
    await homePage.header.goTo('Test Cases');
    await expect(testCasesPage.heading).toBeVisible();

    const titles = (await testCasesPage.titles.allTextContents())
      .map((title) => title.trim())
      .filter((title) => /^Test Case \d+:/.test(title));

    expect(titles.length).toBeGreaterThanOrEqual(20);
    expect(titles[0]).toBe('Test Case 1: Register User');
    titles.forEach((title, index) => expect(title).toMatch(new RegExp(`^Test Case ${index + 1}:`)));
  });
});
