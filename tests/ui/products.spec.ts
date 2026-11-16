import { test, expect } from '@src/fixtures/ui.fixtures';

test.describe('Products', () => {
  test('lists every product in the catalog', async ({ homePage, productsPage, catalogApi }) => {
    const catalog = await catalogApi.listProducts();

    await homePage.goto();
    await homePage.header.goTo('Products');

    await expect(productsPage.heading).toHaveText('All Products');
    expect(await productsPage.productNames()).toEqual(catalog.map((product) => product.name));
  });

  test('shows the details of a product', async ({ page, productsPage, productDetailsPage, catalogApi }) => {
    const [product] = await catalogApi.listProducts();
    expect(product, 'catalog should not be empty').toBeDefined();

    await productsPage.goto();
    await productsPage.openDetails(product!.id);

    await expect(page).toHaveURL(`/product_details/${product!.id}`);
    await expect(productDetailsPage.name).toHaveText(product!.name);
    await expect(productDetailsPage.category).toHaveText(
      `Category: ${product!.category.usertype.usertype} > ${product!.category.category}`,
    );
    await expect(productDetailsPage.price).toHaveText(product!.price);
    await expect(productDetailsPage.brand).toHaveText(`Brand: ${product!.brand}`);
    await expect(productDetailsPage.availability).toBeVisible();
    await expect(productDetailsPage.condition).toBeVisible();
  });

  for (const term of ['top', 'jeans', 'dress']) {
    test(`search for "${term}" returns the same products as the search API`, async ({
      productsPage,
      catalogApi,
    }) => {
      const expected = await catalogApi.searchProducts(term);
      expect(expected.length, `the catalog should have results for "${term}"`).toBeGreaterThan(0);

      await productsPage.goto();
      await productsPage.search(term);

      await expect(productsPage.heading).toHaveText('Searched Products');
      expect(await productsPage.productNames()).toEqual(expected.map((product) => product.name));
    });
  }

  test('search with no matches shows no products', async ({ productsPage, catalogApi }) => {
    const term = 'no-product-matches-this';
    expect(await catalogApi.searchProducts(term)).toHaveLength(0);

    await productsPage.goto();
    await productsPage.search(term);

    await expect(productsPage.heading).toHaveText('Searched Products');
    await expect(productsPage.cards).toHaveCount(0);
  });
});
