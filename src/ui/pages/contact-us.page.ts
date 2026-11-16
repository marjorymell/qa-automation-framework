import type { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

export interface ContactMessage {
  name: string;
  email: string;
  subject: string;
  message: string;
  attachment?: { name: string; mimeType: string; buffer: Buffer };
}

export class ContactUsPage extends BasePage {
  protected readonly path = '/contact_us';

  readonly heading: Locator;
  readonly name: Locator;
  readonly email: Locator;
  readonly subject: Locator;
  readonly message: Locator;
  readonly attachment: Locator;
  readonly submitButton: Locator;
  readonly successMessage: Locator;
  readonly homeButton: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Get In Touch' });
    this.name = page.locator('#contact-us-form [data-qa="name"]');
    this.email = page.locator('#contact-us-form [data-qa="email"]');
    this.subject = page.locator('#contact-us-form [data-qa="subject"]');
    this.message = page.locator('#contact-us-form [data-qa="message"]');
    this.attachment = page.locator('#contact-us-form input[name="upload_file"]');
    this.submitButton = page.locator('#contact-us-form [data-qa="submit-button"]');
    this.successMessage = page.locator('.contact-form .status.alert-success');
    this.homeButton = page.locator('#form-section').getByRole('link', { name: 'Home' });
  }

  async fillForm(contact: ContactMessage): Promise<void> {
    await this.name.fill(contact.name);
    await this.email.fill(contact.email);
    await this.subject.fill(contact.subject);
    await this.message.fill(contact.message);
    if (contact.attachment) await this.attachment.setInputFiles(contact.attachment);
  }

  /** Submits the form and accepts the site's "Press OK to proceed!" confirmation. */
  async submit(): Promise<void> {
    this.page.once('dialog', (dialog) => dialog.accept());
    await this.submitButton.click();
  }
}
