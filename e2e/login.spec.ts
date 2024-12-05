import { test, expect } from '@playwright/test';

test('Login page should allow valid login', async ({ page }) => {
  await page.goto(''); // login page

  await page.fill('input[name="username"]', 'ece30861defaultadminuser');
  await page.fill('input[name="password"]', 'correcthorsebatterystaple123(!__+@**(A;DROP TABLE packages;');
  await page.click('button:has-text("Login")');

  await expect(page.getByText('Welcome, ece30861defaultadminuser!')).toBeVisible();
});
