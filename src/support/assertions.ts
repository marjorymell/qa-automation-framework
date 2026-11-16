import { expect, type APIResponse } from '@playwright/test';
import type { z } from 'zod';

/** Asserts the status code and returns the parsed JSON body. */
export async function expectStatus<T = Record<string, unknown>>(
  response: APIResponse,
  status: number,
): Promise<T> {
  const body = await response.json().catch(() => undefined);
  expect(
    response.status(),
    `${response.url()} returned ${response.status()}: ${JSON.stringify(body)}`,
  ).toBe(status);
  return body as T;
}

/** Asserts status code and the `message` field in one step. */
export async function expectMessage(
  response: APIResponse,
  status: number,
  message: string,
): Promise<Record<string, unknown>> {
  const body = await expectStatus(response, status);
  expect(body.message).toBe(message);
  return body;
}

/** Validates a body against a zod schema with a readable failure message. */
export function expectSchema<S extends z.ZodType>(body: unknown, schema: S): z.infer<S> {
  const result = schema.safeParse(body);
  expect(result.success, result.success ? '' : JSON.stringify(result.error.issues, null, 2)).toBe(
    true,
  );
  return result.data as z.infer<S>;
}
