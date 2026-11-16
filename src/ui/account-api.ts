import { expect, type APIRequestContext } from '@playwright/test';
import type { Account } from './types';

/**
 * Automation Exercise's own API, used to create and remove test accounts
 * without going through the UI. It always answers HTTP 200 and puts the
 * real status in the body's `responseCode`.
 */
export class AccountApi {
  constructor(
    private readonly request: APIRequestContext,
    private readonly baseURL: string,
  ) {}

  async create(account: Account): Promise<void> {
    const response = await this.request.post(`${this.baseURL}/api/createAccount`, {
      form: {
        name: account.name,
        email: account.email,
        password: account.password,
        title: account.title,
        birth_date: String(account.birthDate.day),
        birth_month: String(account.birthDate.month),
        birth_year: String(account.birthDate.year),
        firstname: account.address.firstName,
        lastname: account.address.lastName,
        company: account.address.company,
        address1: account.address.address1,
        address2: account.address.address2,
        country: account.address.country,
        zipcode: account.address.zipcode,
        state: account.address.state,
        city: account.address.city,
        mobile_number: account.address.mobileNumber,
      },
    });
    const body = await response.json();
    expect(body, `createAccount failed for ${account.email}`).toMatchObject({
      responseCode: 201,
      message: 'User created!',
    });
  }

  /** Deletes the account if it exists. Safe to call during cleanup. */
  async delete(email: string, password: string): Promise<boolean> {
    const response = await this.request.delete(`${this.baseURL}/api/deleteAccount`, {
      form: { email, password },
    });
    const body = await response.json().catch(() => ({}));
    return body.responseCode === 200;
  }
}
