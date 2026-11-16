import { test, expect } from '@src/fixtures/api.fixtures';
import { Messages } from '@src/constants/messages';
import { loginSchema } from '@src/schemas/serverest';
import { expectMessage, expectSchema, expectStatus } from '@src/support/assertions';

test.describe('POST /login', () => {
  test('returns a bearer token for valid credentials', async ({ api, createUser }) => {
    const user = await createUser();

    const body = await expectStatus(await api.login.login(user.email, user.password), 200);

    const login = expectSchema(body, loginSchema);
    expect(login.message).toBe(Messages.loginSuccess);
  });

  test('rejects a wrong password', async ({ api, createUser }) => {
    const user = await createUser();

    await expectMessage(
      await api.login.login(user.email, `${user.password}-wrong`),
      401,
      Messages.invalidCredentials,
    );
  });

  test('rejects an email that is not registered', async ({ api }) => {
    await expectMessage(
      await api.login.login('not.registered@example.com', 'any-password'),
      401,
      Messages.invalidCredentials,
    );
  });

  test('requires email and password', async ({ api }) => {
    const body = await expectStatus(await api.login.loginWithBody({}), 400);

    expect(body).toEqual({
      email: 'email é obrigatório',
      password: 'password é obrigatório',
    });
  });

  test('issued token authorizes protected routes', async ({ createSession }) => {
    const admin = await createSession({ admin: true });

    const response = await admin.api.products.list();

    expect(response.ok()).toBeTruthy();
  });
});
