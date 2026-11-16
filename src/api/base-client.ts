import type { APIRequestContext, APIResponse } from '@playwright/test';

type RequestOptions = Parameters<APIRequestContext['fetch']>[1];

/**
 * Thin wrapper around Playwright's APIRequestContext.
 * Clients return the raw APIResponse so tests decide what to assert,
 * including error responses.
 */
export abstract class BaseClient {
  constructor(
    protected readonly request: APIRequestContext,
    private readonly token?: string,
  ) {}

  protected send(method: string, url: string, options: RequestOptions = {}): Promise<APIResponse> {
    const headers: Record<string, string> = { ...(options?.headers ?? {}) };
    if (this.token) headers.Authorization = this.token;
    return this.request.fetch(url, { ...options, method, headers });
  }
}
