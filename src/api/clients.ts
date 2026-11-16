import type { APIRequestContext, APIResponse } from '@playwright/test';
import { BaseClient } from './base-client';
import type { CartPayload, ProductPayload, UserPayload } from './types';

export class LoginClient extends BaseClient {
  login(email: string, password: string): Promise<APIResponse> {
    return this.send('POST', '/login', { data: { email, password } });
  }

  /** Sends an arbitrary body, for validation tests. */
  loginWithBody(body: Record<string, unknown>): Promise<APIResponse> {
    return this.send('POST', '/login', { data: body });
  }
}

export class UsersClient extends BaseClient {
  list(query?: Partial<Record<keyof UserPayload | '_id', string>>): Promise<APIResponse> {
    return this.send('GET', '/usuarios', { params: query });
  }

  getById(id: string): Promise<APIResponse> {
    return this.send('GET', `/usuarios/${id}`);
  }

  create(user: UserPayload): Promise<APIResponse> {
    return this.send('POST', '/usuarios', { data: user });
  }

  update(id: string, user: UserPayload): Promise<APIResponse> {
    return this.send('PUT', `/usuarios/${id}`, { data: user });
  }

  delete(id: string): Promise<APIResponse> {
    return this.send('DELETE', `/usuarios/${id}`);
  }
}

export class ProductsClient extends BaseClient {
  list(query?: Record<string, string | number>): Promise<APIResponse> {
    return this.send('GET', '/produtos', { params: query });
  }

  getById(id: string): Promise<APIResponse> {
    return this.send('GET', `/produtos/${id}`);
  }

  create(product: ProductPayload): Promise<APIResponse> {
    return this.send('POST', '/produtos', { data: product });
  }

  update(id: string, product: ProductPayload): Promise<APIResponse> {
    return this.send('PUT', `/produtos/${id}`, { data: product });
  }

  delete(id: string): Promise<APIResponse> {
    return this.send('DELETE', `/produtos/${id}`);
  }
}

export class CartsClient extends BaseClient {
  list(query?: Record<string, string | number>): Promise<APIResponse> {
    return this.send('GET', '/carrinhos', { params: query });
  }

  getById(id: string): Promise<APIResponse> {
    return this.send('GET', `/carrinhos/${id}`);
  }

  create(cart: CartPayload): Promise<APIResponse> {
    return this.send('POST', '/carrinhos', { data: cart });
  }

  /** Deletes the logged-in user's cart and returns the items to stock. */
  cancelPurchase(): Promise<APIResponse> {
    return this.send('DELETE', '/carrinhos/cancelar-compra');
  }

  /** Deletes the logged-in user's cart without restocking (purchase completed). */
  completePurchase(): Promise<APIResponse> {
    return this.send('DELETE', '/carrinhos/concluir-compra');
  }
}

/** All ServeRest clients, optionally authenticated with a token. */
export function createApi(request: APIRequestContext, token?: string) {
  return {
    login: new LoginClient(request, token),
    users: new UsersClient(request, token),
    products: new ProductsClient(request, token),
    carts: new CartsClient(request, token),
  };
}

export type Api = ReturnType<typeof createApi>;
