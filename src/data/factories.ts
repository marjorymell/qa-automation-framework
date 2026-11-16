import { faker } from '@faker-js/faker';
import type { ProductPayload, UserPayload } from '@src/api/types';
import { COUNTRIES, type Account } from '@src/ui/types';

/** Builds a unique user. Pass overrides to control specific fields. */
export function buildUser(overrides: Partial<UserPayload> = {}): UserPayload {
  return {
    nome: faker.person.fullName(),
    email: `qa.${faker.string.alphanumeric(10).toLowerCase()}@example.com`,
    password: faker.internet.password({ length: 12 }),
    administrador: 'false',
    ...overrides,
  };
}

/** Builds a unique product with stock available. */
export function buildProduct(overrides: Partial<ProductPayload> = {}): ProductPayload {
  return {
    nome: `${faker.commerce.productName()} ${faker.string.alphanumeric(8)}`,
    preco: faker.number.int({ min: 10, max: 500 }),
    descricao: faker.commerce.productDescription(),
    quantidade: faker.number.int({ min: 10, max: 100 }),
    ...overrides,
  };
}

/** Builds a unique Automation Exercise account. */
export function buildAccount(overrides: Partial<Account> = {}): Account {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  return {
    title: faker.helpers.arrayElement(['Mr', 'Mrs'] as const),
    name: `${firstName} ${lastName}`,
    email: `qa.${faker.string.alphanumeric(12).toLowerCase()}@example.com`,
    password: faker.internet.password({ length: 12 }),
    birthDate: {
      day: faker.number.int({ min: 1, max: 28 }),
      month: faker.number.int({ min: 1, max: 12 }),
      year: faker.number.int({ min: 1960, max: 2005 }),
    },
    newsletter: true,
    specialOffers: false,
    address: {
      firstName,
      lastName,
      company: faker.company.name(),
      address1: faker.location.streetAddress(),
      address2: faker.location.secondaryAddress(),
      country: faker.helpers.arrayElement(COUNTRIES),
      state: faker.location.state(),
      city: faker.location.city(),
      zipcode: faker.location.zipCode('#####'),
      mobileNumber: faker.string.numeric(11),
    },
    ...overrides,
  };
}

/** An ID in ServeRest's format (16 alphanumeric chars) that does not exist. */
export function nonExistentId(): string {
  return faker.string.alphanumeric(16);
}
