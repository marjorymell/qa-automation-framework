import { test as base } from '@playwright/test';
import { createApi, type Api } from '@src/api/clients';
import type { ProductPayload, UserPayload } from '@src/api/types';
import { buildProduct, buildUser } from '@src/data/factories';
import { createdSchema, loginSchema } from '@src/schemas/serverest';
import { expectSchema, expectStatus } from '@src/support/assertions';

export type CreatedUser = UserPayload & { _id: string };
export type CreatedProduct = ProductPayload & { _id: string };

export interface Session {
  user: CreatedUser;
  token: string;
  /** Clients authenticated as this user. */
  api: Api;
}

/**
 * Test data is removed after each test. ServeRest blocks deleting products
 * and users that belong to a cart, so cleanup runs in phases:
 * carts first, then products, then users.
 */
type CleanupPhase = 'carts' | 'products' | 'users';
const PHASE_ORDER: CleanupPhase[] = ['carts', 'products', 'users'];

class Cleanup {
  private tasks: Record<CleanupPhase, Array<() => Promise<unknown>>> = {
    carts: [],
    products: [],
    users: [],
  };

  add(phase: CleanupPhase, task: () => Promise<unknown>) {
    this.tasks[phase].push(task);
  }

  async run() {
    for (const phase of PHASE_ORDER) {
      for (const task of this.tasks[phase].reverse()) {
        await task().catch((error) => console.warn(`[cleanup:${phase}]`, error));
      }
    }
  }
}

interface ApiFixtures {
  /** Unauthenticated clients. */
  api: Api;
  cleanup: Cleanup;
  /** Registers a user through the API; it is deleted after the test. */
  createUser: (overrides?: Partial<UserPayload>) => Promise<CreatedUser>;
  /** Registers a user and logs in. Any cart left behind is cancelled after the test. */
  createSession: (options?: { admin?: boolean }) => Promise<Session>;
  /** Logged-in administrator. */
  admin: Session;
  /** Logged-in regular (non-admin) user. */
  customer: Session;
  /** Creates a product as `admin`; it is deleted after the test. */
  createProduct: (overrides?: Partial<ProductPayload>) => Promise<CreatedProduct>;
}

export const test = base.extend<ApiFixtures>({
  api: async ({ request }, use) => {
    await use(createApi(request));
  },

  // eslint-disable-next-line no-empty-pattern
  cleanup: async ({}, use) => {
    const cleanup = new Cleanup();
    await use(cleanup);
    await cleanup.run();
  },

  createUser: async ({ api, cleanup }, use) => {
    await use(async (overrides = {}) => {
      const user = buildUser(overrides);
      const body = expectSchema(await expectStatus(await api.users.create(user), 201), createdSchema);
      cleanup.add('users', () => api.users.delete(body._id));
      return { ...user, _id: body._id };
    });
  },

  createSession: async ({ request, api, createUser, cleanup }, use) => {
    await use(async ({ admin = false } = {}) => {
      const user = await createUser({ administrador: admin ? 'true' : 'false' });
      const login = await api.login.login(user.email, user.password);
      const { authorization } = expectSchema(await expectStatus(login, 200), loginSchema);
      const session: Session = { user, token: authorization, api: createApi(request, authorization) };
      cleanup.add('carts', () => session.api.carts.cancelPurchase());
      return session;
    });
  },

  admin: async ({ createSession }, use) => {
    await use(await createSession({ admin: true }));
  },

  customer: async ({ createSession }, use) => {
    await use(await createSession({ admin: false }));
  },

  createProduct: async ({ admin, cleanup }, use) => {
    await use(async (overrides = {}) => {
      const product = buildProduct(overrides);
      const response = await admin.api.products.create(product);
      const body = expectSchema(await expectStatus(response, 201), createdSchema);
      cleanup.add('products', () => admin.api.products.delete(body._id));
      return { ...product, _id: body._id };
    });
  },
});

export { expect } from '@playwright/test';
export { createApi };

/** A well-formed token that ServeRest will not accept. */
export const INVALID_TOKEN = 'Bearer invalid.token.value';
