import type { Locator, Page } from '@playwright/test';
import type { Account } from '../types';
import { BasePage } from './base.page';

/** Second signup step: account and address details. */
export class SignupPage extends BasePage {
  protected readonly path = '/signup';

  readonly heading: Locator;
  readonly name: Locator;
  readonly email: Locator;
  readonly createAccountButton: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Enter Account Information' });
    this.name = this.qa('name');
    this.email = this.qa('email');
    this.createAccountButton = this.qa('create-account');
  }

  private qa(id: string): Locator {
    return this.page.locator(`[data-qa="${id}"]`);
  }

  async fillAccountInformation(account: Account): Promise<void> {
    await this.page.locator(account.title === 'Mr' ? '#id_gender1' : '#id_gender2').check();
    await this.qa('password').fill(account.password);
    await this.qa('days').selectOption(String(account.birthDate.day));
    await this.qa('months').selectOption(String(account.birthDate.month));
    await this.qa('years').selectOption(String(account.birthDate.year));
    await this.page.locator('#newsletter').setChecked(account.newsletter);
    await this.page.locator('#optin').setChecked(account.specialOffers);
  }

  async fillAddress(address: Account['address']): Promise<void> {
    await this.qa('first_name').fill(address.firstName);
    await this.qa('last_name').fill(address.lastName);
    await this.qa('company').fill(address.company);
    await this.qa('address').fill(address.address1);
    await this.qa('address2').fill(address.address2);
    await this.qa('country').selectOption(address.country);
    await this.qa('state').fill(address.state);
    await this.qa('city').fill(address.city);
    await this.qa('zipcode').fill(address.zipcode);
    await this.qa('mobile_number').fill(address.mobileNumber);
  }

  async createAccount(account: Account): Promise<void> {
    await this.fillAccountInformation(account);
    await this.fillAddress(account.address);
    await this.createAccountButton.click();
  }
}
