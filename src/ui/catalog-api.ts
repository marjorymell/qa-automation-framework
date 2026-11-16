import { expect, type APIRequestContext } from '@playwright/test';

export interface CatalogProduct {
  id: number;
  name: string;
  /** As shown on the site, e.g. "Rs. 500". */
  price: string;
  brand: string;
  category: { usertype: { usertype: string }; category: string };
}

/** Read-only access to Automation Exercise's product catalog API. */
export class CatalogApi {
  constructor(
    private readonly request: APIRequestContext,
    private readonly baseURL: string,
  ) {}

  async listProducts(): Promise<CatalogProduct[]> {
    const response = await this.request.get(`${this.baseURL}/api/productsList`);
    const body = await response.json();
    expect(body.responseCode).toBe(200);
    return body.products;
  }

  async searchProducts(term: string): Promise<CatalogProduct[]> {
    const response = await this.request.post(`${this.baseURL}/api/searchProduct`, {
      form: { search_product: term },
    });
    const body = await response.json();
    expect(body.responseCode).toBe(200);
    return body.products;
  }

  async getProduct(id: number): Promise<CatalogProduct> {
    const product = (await this.listProducts()).find((p) => p.id === id);
    if (!product) throw new Error(`Product ${id} not found in the catalog`);
    return product;
  }
}

/** "Rs. 1,500" -> 1500 */
export function parsePrice(price: string): number {
  const value = Number(price.replace(/[^\d]/g, ''));
  if (!Number.isFinite(value) || value <= 0) throw new Error(`Unexpected price: "${price}"`);
  return value;
}
