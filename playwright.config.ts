import { defineConfig, devices } from '@playwright/test';

/**
 * By default the suite starts its own ServeRest instance (from the `serverest`
 * npm package), so every run begins with clean, known data.
 * Set API_BASE_URL to run against another instance, e.g. https://serverest.dev.
 */
// 3000 is often taken by local dev servers, so ServeRest defaults to another port.
const port = Number(process.env.SERVEREST_PORT ?? 3210);
// `||` rather than `??`: CI passes an empty string when no URL is given.
const externalBaseURL = process.env.API_BASE_URL?.trim() || undefined;
const apiBaseURL = externalBaseURL ?? `http://localhost:${port}`;
const isCI = !!process.env.CI;

// Only the API project needs ServeRest; skip it when running the UI project alone.
const args = process.argv.slice(2);
const selectedProjects = args.flatMap((arg, i) =>
  arg.startsWith('--project=') ? [arg.slice(10)] : arg === '--project' ? [args[i + 1] ?? ''] : [],
);
const needsServeRest = selectedProjects.length === 0 || selectedProjects.includes('api');

const uiBaseURL =process.env.UI_BASE_URL?.trim() || 'https://automationexercise.com';

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
    {
      name: 'ui',
      testDir: './tests/ui',
      // A public site: retry once locally too, and keep parallelism modest.
      retries: isCI ? 2 : 1,
      use: {
        ...devices['Desktop Chrome'],
        baseURL: uiBaseURL,
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        actionTimeout: 15_000,
        navigationTimeout: 30_000,
      },
    },
  ],

  webServer:
    externalBaseURL || !needsServeRest
      ? undefined
      : {
          command: `npx serverest --porta ${port} --nodoc`,
          url: `${apiBaseURL}/usuarios`,
          reuseExistingServer: !isCI,
          timeout: 60_000,
        },
});
