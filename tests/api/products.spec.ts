import { test, expect, createApi, INVALID_TOKEN } from '@src/fixtures/api.fixtures';
import { Messages } from '@src/constants/messages';
import { buildProduct, nonExistentId } from '@src/data/factories';
import { createdSchema, productListSchema, productSchema } from '@src/schemas/serverest';
import { expectMessage, expectSchema, expectStatus } from '@src/support/assertions';

test.describe('Products', () => {
  test.describe('GET /produtos', () => {
    test('lists products matching the contract', async ({ api, createProduct }) => {
      await createProduct();

      const list = expectSchema(await expectStatus(await api.products.list(), 200), productListSchema);

      expect(list.quantidade).toBe(list.produtos.length);
      expect(list.quantidade).toBeGreaterThan(0);
    });

    test('filters products by name', async ({ api, createProduct }) => {
      const product = await createProduct();

      const list = expectSchema(
        await expectStatus(await api.products.list({ nome: product.nome }), 200),
        productListSchema,
      );

      expect(list.produtos).toEqual([product]);
    });
  });

  test.describe('POST /produtos', () => {
    test('admin creates a product', async ({ admin, cleanup }) => {
      const product = buildProduct();

      const body = await expectMessage(await admin.api.products.create(product), 201, Messages.created);
      const { _id } = expectSchema(body, createdSchema);
      cleanup.add('products', () => admin.api.products.delete(_id));

      const stored = await expectStatus(await admin.api.products.getById(_id), 200);
      expect(stored).toEqual({ ...product, _id });
    });

    test('rejects a name already in use', async ({ admin, createProduct }) => {
      const existing = await createProduct();

      await expectMessage(
        await admin.api.products.create(buildProduct({ nome: existing.nome })),
        400,
        Messages.productNameInUse,
      );
    });

    test('requires authentication', async ({ api }) => {
      await expectMessage(await api.products.create(buildProduct()), 401, Messages.invalidToken);
    });

    test('rejects an invalid token', async ({ request }) => {
      const api = createApi(request, INVALID_TOKEN);

      await expectMessage(await api.products.create(buildProduct()), 401, Messages.invalidToken);
    });

    test('is restricted to administrators', async ({ customer }) => {
      await expectMessage(
        await customer.api.products.create(buildProduct()),
        403,
        Messages.adminOnly,
      );
    });
  });

  test.describe('GET /produtos/{id}', () => {
    test('returns the product', async ({ api, createProduct }) => {
      const product = await createProduct();

      const body = await expectStatus(await api.products.getById(product._id), 200);

      expect(expectSchema(body, productSchema)).toEqual(product);
    });

    test('returns 400 for an unknown id', async ({ api }) => {
      await expectMessage(
        await api.products.getById(nonExistentId()),
        400,
        Messages.productNotFound,
      );
    });
  });

  test.describe('PUT /produtos/{id}', () => {
    test('updates an existing product', async ({ admin, createProduct }) => {
      const product = await createProduct();
      const changes = buildProduct();

      await expectMessage(await admin.api.products.update(product._id, changes), 200, Messages.updated);

      const stored = await expectStatus(await admin.api.products.getById(product._id), 200);
      expect(stored).toEqual({ ...changes, _id: product._id });
    });

    test('creates the product when the id does not exist', async ({ admin, cleanup }) => {
      const body = await expectMessage(
        await admin.api.products.update(nonExistentId(), buildProduct()),
        201,
        Messages.created,
      );
      const { _id } = expectSchema(body, createdSchema);
      cleanup.add('products', () => admin.api.products.delete(_id));
    });

    test('rejects a name that belongs to another product', async ({ admin, createProduct }) => {
      const [product, other] = await Promise.all([createProduct(), createProduct()]);

      await expectMessage(
        await admin.api.products.update(product._id, buildProduct({ nome: other.nome })),
        400,
        Messages.productNameInUse,
      );
    });

    test('requires authentication', async ({ api, createProduct }) => {
      const product = await createProduct();

      await expectMessage(
        await api.products.update(product._id, buildProduct()),
        401,
        Messages.invalidToken,
      );
    });

    test('is restricted to administrators', async ({ customer, createProduct }) => {
      const product = await createProduct();

      await expectMessage(
        await customer.api.products.update(product._id, buildProduct()),
        403,
        Messages.adminOnly,
      );
    });
  });

  test.describe('DELETE /produtos/{id}', () => {
    test('deletes the product', async ({ admin }) => {
      const { _id } = expectSchema(
        await expectStatus(await admin.api.products.create(buildProduct()), 201),
        createdSchema,
      );

      await expectMessage(await admin.api.products.delete(_id), 200, Messages.deleted);
      await expectMessage(await admin.api.products.getById(_id), 400, Messages.productNotFound);
    });

    test('reports nothing deleted for an unknown id', async ({ admin }) => {
      await expectMessage(
        await admin.api.products.delete(nonExistentId()),
        200,
        Messages.nothingDeleted,
      );
    });

    test('requires authentication', async ({ api, createProduct }) => {
      const product = await createProduct();

      await expectMessage(await api.products.delete(product._id), 401, Messages.invalidToken);
    });

    test('is restricted to administrators', async ({ customer, createProduct }) => {
      const product = await createProduct();

      await expectMessage(await customer.api.products.delete(product._id), 403, Messages.adminOnly);
    });

    test('does not delete a product that is in a cart', async ({ admin, customer, createProduct }) => {
      const product = await createProduct();
      const cart = expectSchema(
        await expectStatus(
          await customer.api.carts.create({ produtos: [{ idProduto: product._id, quantidade: 1 }] }),
          201,
        ),
        createdSchema,
      );

      const body = await expectMessage(
        await admin.api.products.delete(product._id),
        400,
        Messages.productInCart,
      );
      expect(body.idCarrinhos).toEqual([cart._id]);
    });
  });
});
