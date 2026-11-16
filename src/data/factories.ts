import { faker } from '@faker-js/faker';
import type { ProductPayload, UserPayload } from '@src/api/types';

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

/** An ID in ServeRest's format (16 alphanumeric chars) that does not exist. */
export function nonExistentId(): string {
  return faker.string.alphanumeric(16);
}
