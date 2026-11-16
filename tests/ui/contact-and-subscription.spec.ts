import { faker } from '@faker-js/faker';
import { test, expect } from '@src/fixtures/ui.fixtures';
import type { ContactMessage } from '@src/ui/pages/contact-us.page';

const SUBSCRIBED = 'You have been successfully subscribed!';

function buildContact(overrides: Partial<ContactMessage> = {}): ContactMessage {
  return {
    name: faker.person.fullName(),
    email: `qa.${faker.string.alphanumeric(10).toLowerCase()}@example.com`,
    subject: faker.lorem.sentence({ min: 3, max: 6 }),
    message: faker.lorem.paragraph(),
    ...overrides,
  };
}

test.describe('Contact us', () => {
  test('sends a message with an attachment', async ({ page, homePage, contactUsPage }) => {
    await homePage.goto();
    await homePage.header.goTo('Contact us');
    await expect(contactUsPage.heading).toBeVisible();

    await contactUsPage.fillForm(
      buildContact({
        attachment: {
          name: 'notes.txt',
          mimeType: 'text/plain',
          buffer: Buffer.from('Attachment sent by an automated test.'),
        },
      }),
    );
    await contactUsPage.submit();

    await expect(contactUsPage.successMessage).toHaveText(
      'Success! Your details have been submitted successfully.',
    );
    await contactUsPage.homeButton.click();
    await expect(page).toHaveURL('/');
  });

  test('requires an email address', async ({ contactUsPage }) => {
    await contactUsPage.goto();

    await contactUsPage.fillForm(buildContact({ email: '' }));
    await contactUsPage.submitButton.click();

    const missing = await contactUsPage.email.evaluate(
      (input: HTMLInputElement) => input.validity.valueMissing,
    );
    expect(missing).toBe(true);
    await expect(contactUsPage.successMessage).toBeHidden();
  });
});

test.describe('Subscription', () => {
  test('subscribes from the home page', async ({ homePage }) => {
    await homePage.goto();
    await expect(homePage.footer.subscriptionHeading).toBeVisible();

    await homePage.footer.subscribe(buildContact().email);

    await expect(homePage.footer.successMessage).toHaveText(SUBSCRIBED);
  });

  test('subscribes from the cart page', async ({ homePage, cartPage }) => {
    await homePage.goto();
    await homePage.header.goTo('Cart');

    await cartPage.footer.subscribe(buildContact().email);

    await expect(cartPage.footer.successMessage).toHaveText(SUBSCRIBED);
  });
});
