import { test, expect } from '@src/fixtures/ui.fixtures';
import { parsePrice, type CatalogProduct } from '@src/ui/catalog-api';

/** Formats a number the way the site shows prices: "Rs. 500". */
const rs = (value: number) => `Rs. ${value}`;

test.describe('Cart', () => {
  let products: CatalogProduct[];

  test.beforeEach(async ({ catalogApi }) => {
    products = (await catalogApi.listProducts()).slice(0, 2);
    expect(products).toHaveLength(2);
  });

  test('adds products from the product list', async ({ productsPage, cartPage }) => {
    const [first, second] = products as [CatalogProduct, CatalogProduct];

    await productsPage.goto();
    await productsPage.addToCart(first.id);
    await expect(productsPage.addedToCart.message).toBeVisible();
    await productsPage.addedToCart.continueShopping();
    await productsPage.addToCart(second.id);
    await productsPage.addedToCart.viewCart();

    await expect(cartPage.rows).toHaveCount(2);
    for (const product of [first, second]) {
      const row = cartPage.row(product.id);
      await expect(row.name).toHaveText(product.name);
      await expect(row.price).toHaveText(product.price);
      await expect(row.quantity).toHaveText('1');
      await expect(row.total).toHaveText(product.price);
    }
  });

  test('keeps the quantity chosen on the product page', async ({ productDetailsPage, cartPage }) => {
    const [product] = products as [CatalogProduct];
    const quantity = 4;

    await productDetailsPage.gotoProduct(product.id);
    await productDetailsPage.addToCart(quantity);
    await productDetailsPage.addedToCart.viewCart();

    const row = cartPage.row(product.id);
    await expect(row.quantity).toHaveText(String(quantity));
    await expect(row.total).toHaveText(rs(parsePrice(product.price) * quantity));
  });

  test('adding the same product twice increases its quantity', async ({ productsPage, cartPage }) => {
    const [product] = products as [CatalogProduct];

    await productsPage.goto();
    await productsPage.addToCart(product.id);
    await productsPage.addedToCart.continueShopping();
    await productsPage.addToCart(product.id);
    await productsPage.addedToCart.viewCart();

    await expect(cartPage.rows).toHaveCount(1);
    const row = cartPage.row(product.id);
    await expect(row.quantity).toHaveText('2');
    await expect(row.total).toHaveText(rs(parsePrice(product.price) * 2));
  });

  test('removes products until the cart is empty', async ({ productsPage, cartPage }) => {
    const [first, second] = products as [CatalogProduct, CatalogProduct];

    await productsPage.goto();
    await productsPage.addToCart(first.id);
    await productsPage.addedToCart.continueShopping();
    await productsPage.addToCart(second.id);
    await productsPage.addedToCart.viewCart();
    await expect(cartPage.rows).toHaveCount(2);

    await cartPage.removeProduct(first.id);
    await expect(cartPage.rows).toHaveCount(1);
    await expect(cartPage.row(second.id).name).toHaveText(second.name);

    await cartPage.removeProduct(second.id);
    await expect(cartPage.rows).toHaveCount(0);
    await expect(cartPage.emptyMessage).toBeVisible();
  });

  test('starts empty for a new visitor', async ({ cartPage }) => {
    await cartPage.goto();

    await expect(cartPage.rows).toHaveCount(0);
    await expect(cartPage.emptyMessage).toBeVisible();
  });
});
