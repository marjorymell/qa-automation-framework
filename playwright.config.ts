import { defineConfig } from '@playwright/test';

/**
 * By default the suite starts its own ServeRest instance (from the `serverest`
 * npm package), so every run begins with clean, known data.
 * Set API_BASE_URL to run against another instance, e.g. https://serverest.dev.
 */
const port = Number(process.env.SERVEREST_PORT ?? 3000);
// `||` rather than `??`: CI passes an empty string when no URL is given.
const externalBaseURL = process.env.API_BASE_URL?.trim() || undefined;
const apiBaseURL = externalBaseURL ?? `http://localhost:${port}`;
const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  workers: isCI ? 4 : undefined,
  reporter: isCI
    ? [['github'], ['list'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'never' }]],

  projects: [
    {
      name: 'api',
      testDir: './tests/api',
      use: {
        baseURL: apiBaseURL,
        extraHTTPHeaders: { Accept: 'application/json' },
      },
    },
  ],

  webServer: externalBaseURL
    ? undefined
    : {
        command: `npx serverest --porta ${port} --nodoc`,
        url: `${apiBaseURL}/usuarios`,
        reuseExistingServer: !isCI,
        timeout: 60_000,
      },
});
