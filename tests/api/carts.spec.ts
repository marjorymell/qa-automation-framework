import { test, expect, createApi, INVALID_TOKEN, type CreatedProduct } from '@src/fixtures/api.fixtures';
import type { Api } from '@src/api/clients';
import { Messages } from '@src/constants/messages';
import { nonExistentId } from '@src/data/factories';
import { cartListSchema, cartSchema, createdSchema, productSchema } from '@src/schemas/serverest';
import { expectMessage, expectSchema, expectStatus } from '@src/support/assertions';

async function stockOf(api: Api, product: CreatedProduct): Promise<number> {
  const body = await expectStatus(await api.products.getById(product._id), 200);
  return expectSchema(body, productSchema).quantidade;
}

test.describe('Carts', () => {
  test.describe('POST /carrinhos', () => {
    test('creates a cart with the right totals', async ({ api, customer, createProduct }) => {
      const [mouse, keyboard] = await Promise.all([
        createProduct({ preco: 120 }),
        createProduct({ preco: 350 }),
      ]);

      const body = await expectMessage(
        await customer.api.carts.create({
          produtos: [
            { idProduto: mouse._id, quantidade: 2 },
            { idProduto: keyboard._id, quantidade: 1 },
          ],
        }),
        201,
        Messages.created,
      );
      const { _id } = expectSchema(body, createdSchema);

      const cart = expectSchema(await expectStatus(await api.carts.getById(_id), 200), cartSchema);
      expect(cart.idUsuario).toBe(customer.user._id);
      expect(cart.precoTotal).toBe(2 * 120 + 350);
      expect(cart.quantidadeTotal).toBe(3);
      expect(cart.produtos).toEqual([
        { idProduto: mouse._id, quantidade: 2, precoUnitario: 120 },
        { idProduto: keyboard._id, quantidade: 1, precoUnitario: 350 },
      ]);
    });

    test('takes the items out of stock', async ({ api, customer, createProduct }) => {
      const product = await createProduct({ quantidade: 10 });

      await expectStatus(
        await customer.api.carts.create({ produtos: [{ idProduto: product._id, quantidade: 3 }] }),
        201,
      );

      expect(await stockOf(api, product)).toBe(7);
    });

    test('rejects the same product twice', async ({ customer, createProduct }) => {
      const product = await createProduct();

      const body = await expectMessage(
        await customer.api.carts.create({
          produtos: [
            { idProduto: product._id, quantidade: 1 },
            { idProduto: product._id, quantidade: 1 },
          ],
        }),
        400,
        Messages.cartDuplicatedProduct,
      );
      expect(body.idProdutosDuplicados).toEqual([product._id]);
    });

    test('allows only one cart per user', async ({ customer, createProduct }) => {
      const product = await createProduct();
      const cart = { produtos: [{ idProduto: product._id, quantidade: 1 }] };
      await expectStatus(await customer.api.carts.create(cart), 201);

      await expectMessage(await customer.api.carts.create(cart), 400, Messages.cartAlreadyExists);
    });

    test('rejects a product that does not exist', async ({ customer }) => {
      const missingId = nonExistentId();

      const body = await expectMessage(
        await customer.api.carts.create({ produtos: [{ idProduto: missingId, quantidade: 1 }] }),
        400,
        Messages.productNotFound,
      );
      expect(body.item).toEqual({ idProduto: missingId, quantidade: 1, index: 0 });
    });

    test('rejects a quantity above the stock', async ({ customer, createProduct }) => {
      const product = await createProduct({ quantidade: 5 });

      const body = await expectMessage(
        await customer.api.carts.create({ produtos: [{ idProduto: product._id, quantidade: 6 }] }),
        400,
        Messages.cartInsufficientStock,
      );
      expect(body.item).toEqual({
        idProduto: product._id,
        quantidade: 6,
        quantidadeEstoque: 5,
        index: 0,
      });
    });

    test('requires authentication', async ({ api, createProduct }) => {
      const product = await createProduct();

      await expectMessage(
        await api.carts.create({ produtos: [{ idProduto: product._id, quantidade: 1 }] }),
        401,
        Messages.invalidToken,
      );
    });

    test('rejects an invalid token', async ({ request, createProduct }) => {
      const product = await createProduct();
      const api = createApi(request, INVALID_TOKEN);

      await expectMessage(
        await api.carts.create({ produtos: [{ idProduto: product._id, quantidade: 1 }] }),
        401,
        Messages.invalidToken,
      );
    });
  });

  test.describe('GET /carrinhos', () => {
    test('lists carts matching the contract', async ({ api, customer, createProduct }) => {
      const product = await createProduct();
      await expectStatus(
        await customer.api.carts.create({ produtos: [{ idProduto: product._id, quantidade: 1 }] }),
        201,
      );

      const list = expectSchema(await expectStatus(await api.carts.list(), 200), cartListSchema);

      expect(list.quantidade).toBe(list.carrinhos.length);
      expect(list.carrinhos.map((cart) => cart.idUsuario)).toContain(customer.user._id);
    });

    test('returns 400 for an unknown cart id', async ({ api }) => {
      await expectMessage(await api.carts.getById(nonExistentId()), 400, Messages.cartNotFound);
    });
  });

  test.describe('DELETE /carrinhos/cancelar-compra', () => {
    test('deletes the cart and puts the items back in stock', async ({ api, customer, createProduct }) => {
      const product = await createProduct({ quantidade: 10 });
      const { _id } = expectSchema(
        await expectStatus(
          await customer.api.carts.create({ produtos: [{ idProduto: product._id, quantidade: 4 }] }),
          201,
        ),
        createdSchema,
      );

      await expectMessage(await customer.api.carts.cancelPurchase(), 200, Messages.cartCancelled);

      expect(await stockOf(api, product)).toBe(10);
      await expectMessage(await api.carts.getById(_id), 400, Messages.cartNotFound);
    });

    test('reports when the user has no cart', async ({ customer }) => {
      await expectMessage(await customer.api.carts.cancelPurchase(), 200, Messages.noCartForUser);
    });

    test('requires authentication', async ({ api }) => {
      await expectMessage(await api.carts.cancelPurchase(), 401, Messages.invalidToken);
    });
  });

  test.describe('DELETE /carrinhos/concluir-compra', () => {
    test('deletes the cart and keeps the stock reduced', async ({ api, customer, createProduct }) => {
      const product = await createProduct({ quantidade: 10 });
      const { _id } = expectSchema(
        await expectStatus(
          await customer.api.carts.create({ produtos: [{ idProduto: product._id, quantidade: 4 }] }),
          201,
        ),
        createdSchema,
      );

      await expectMessage(await customer.api.carts.completePurchase(), 200, Messages.deleted);

      expect(await stockOf(api, product)).toBe(6);
      await expectMessage(await api.carts.getById(_id), 400, Messages.cartNotFound);
    });

    test('reports when the user has no cart', async ({ customer }) => {
      await expectMessage(await customer.api.carts.completePurchase(), 200, Messages.noCartForUser);
    });

    test('requires authentication', async ({ api }) => {
      await expectMessage(await api.carts.completePurchase(), 401, Messages.invalidToken);
    });
  });
});
