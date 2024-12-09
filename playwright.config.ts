import { defineConfig } from '@playwright/test';
/* Intall dependencies: 
 * > npm install -D @playwright/test 
 * > npx playwright install
* To run all tests in 'e2e' (make sure server is running)
 * > npm playwright test
* To run a single test
 * > npm playwright test e2e/someTestFile.spec.ts*/
export default defineConfig({
  testDir: 'e2e',
  timeout: 10 * 1000,
  retries: 0,
  use: {
    baseURL: 'http://localhost:4000', // our projecy url
    headless: true, // don't show browser
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
});
