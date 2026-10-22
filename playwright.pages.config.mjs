import shared from './playwright.config.mjs';

export default {
  ...shared,
  testMatch: 'pages.spec.ts',
  testIgnore: [],
  use: { ...shared.use, baseURL: 'http://127.0.0.1:4322' },
  webServer: {
    command: 'npm run preview -- --host 127.0.0.1 --port 4322 --ignore-lock',
    url: 'http://127.0.0.1:4322/consensus-field-guide/',
    reuseExistingServer: false,
    env: { ASTRO_TELEMETRY_DISABLED: '1', BASE_PATH: '/consensus-field-guide/' },
  },
};
