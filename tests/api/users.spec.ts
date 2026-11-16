import { test, expect } from '@src/fixtures/api.fixtures';
import { Messages } from '@src/constants/messages';
import { buildUser, nonExistentId } from '@src/data/factories';
import { createdSchema, userListSchema, userSchema } from '@src/schemas/serverest';
import { expectMessage, expectSchema, expectStatus } from '@src/support/assertions';

test.describe('Users', () => {
  test.describe('GET /usuarios', () => {
    test('lists users matching the contract', async ({ api, createUser }) => {
      await createUser();

      const list = expectSchema(await expectStatus(await api.users.list(), 200), userListSchema);

      expect(list.quantidade).toBe(list.usuarios.length);
      expect(list.quantidade).toBeGreaterThan(0);
    });

    test('filters users by email', async ({ api, createUser }) => {
      const user = await createUser();

      const list = expectSchema(
        await expectStatus(await api.users.list({ email: user.email }), 200),
        userListSchema,
      );

      expect(list.usuarios).toHaveLength(1);
      expect(list.usuarios[0]).toMatchObject({ _id: user._id, email: user.email });
    });
  });

  test.describe('POST /usuarios', () => {
    test('creates a user', async ({ api, cleanup }) => {
      const user = buildUser();

      const body = await expectMessage(await api.users.create(user), 201, Messages.created);
      const { _id } = expectSchema(body, createdSchema);
      cleanup.add('users', () => api.users.delete(_id));

      const stored = expectSchema(await expectStatus(await api.users.getById(_id), 200), userSchema);
      expect(stored).toEqual({ ...user, _id });
    });

    test('rejects an email already in use', async ({ api, createUser }) => {
      const existing = await createUser();

      await expectMessage(
        await api.users.create(buildUser({ email: existing.email })),
        400,
        Messages.emailInUse,
      );
    });

    test('rejects a payload with missing fields', async ({ api }) => {
      const body = await expectStatus(
        await api.users.create({} as never),
        400,
      );

      expect(Object.keys(body).sort()).toEqual(['administrador', 'email', 'nome', 'password']);
    });
  });

  test.describe('GET /usuarios/{id}', () => {
    test('returns the user', async ({ api, createUser }) => {
      const user = await createUser();

      const body = await expectStatus(await api.users.getById(user._id), 200);

      expect(expectSchema(body, userSchema)).toEqual(user);
    });

    test('returns 400 for an unknown id', async ({ api }) => {
      await expectMessage(await api.users.getById(nonExistentId()), 400, Messages.userNotFound);
    });
  });

  test.describe('PUT /usuarios/{id}', () => {
    test('updates an existing user', async ({ api, createUser }) => {
      const user = await createUser();
      const changes = buildUser({ administrador: 'true' });

      await expectMessage(await api.users.update(user._id, changes), 200, Messages.updated);

      const stored = await expectStatus(await api.users.getById(user._id), 200);
      expect(stored).toEqual({ ...changes, _id: user._id });
    });

    test('creates the user when the id does not exist', async ({ api, cleanup }) => {
      const body = await expectMessage(
        await api.users.update(nonExistentId(), buildUser()),
        201,
        Messages.created,
      );
      const { _id } = expectSchema(body, createdSchema);
      cleanup.add('users', () => api.users.delete(_id));
    });

    test('rejects an email that belongs to another user', async ({ api, createUser }) => {
      const [user, other] = await Promise.all([createUser(), createUser()]);

      await expectMessage(
        await api.users.update(user._id, buildUser({ email: other.email })),
        400,
        Messages.emailInUse,
      );
    });
  });

  test.describe('DELETE /usuarios/{id}', () => {
    test('deletes the user', async ({ api }) => {
      const { _id } = expectSchema(
        await expectStatus(await api.users.create(buildUser()), 201),
        createdSchema,
      );

      await expectMessage(await api.users.delete(_id), 200, Messages.deleted);
      await expectMessage(await api.users.getById(_id), 400, Messages.userNotFound);
    });

    test('reports nothing deleted for an unknown id', async ({ api }) => {
      await expectMessage(await api.users.delete(nonExistentId()), 200, Messages.nothingDeleted);
    });

    test('does not delete a user who has a cart', async ({ api, customer, createProduct }) => {
      const product = await createProduct();
      const cart = expectSchema(
        await expectStatus(
          await customer.api.carts.create({ produtos: [{ idProduto: product._id, quantidade: 1 }] }),
          201,
        ),
        createdSchema,
      );

      const body = await expectMessage(
        await api.users.delete(customer.user._id),
        400,
        Messages.userHasCart,
      );
      expect(body.idCarrinho).toBe(cart._id);
    });
  });
});
