import { test, expect } from '@playwright/test';
import * as path from 'path';

test.describe('Package Upload and Download E2E Tests', () => {
  const testPackageName = 'test-package';
  const testPackageVersion = '1.0.0';
  const testFileName = 'test-package.zip';
  const testFilePath = `e2e/assets/${testFileName}`;
  const downloadDir = `e2e/downloads`;

//   test('upload a package', async ({ page }) => {
//     await page.goto('http://localhost:4000');

//     // Login
//     await page.fill('input[name="username"]', 'ece30861defaultadminuser');
//     await page.fill(
//       'input[name="password"]',
//       "correcthorsebatterystaple123(!__+@**(A'\"`;DROP TABLE packages;"
//     );
//     await page.click('button:has-text("Login")');
//     await expect(page.getByText('Welcome, ece30861defaultadminuser!')).toBeVisible();

//     // Navigate to the Upload Page
//     await page.getByRole('link', { name: 'Upload' }).click();

//     page.on('dialog', async (dialog) => {
//         expect(dialog.message()).toBe('Package uploaded successfully!'); // Assert the alert message
//         await dialog.accept(); // Accept the alert to close it
//     });
//     // Fill out the upload form
//     await page.getByLabel('Package Name:').fill(testPackageName);
//     await page.getByLabel('Upload ZIP File:').setInputFiles(testFilePath);
//     await page.getByRole('button', { name: 'Upload Package' }).click();
//   });

  test('download a package', async ({ page, context }) => {
    await page.goto('http://localhost:4000'); // Replace with your app URL

    // Login
    await page.fill('input[name="username"]', 'ece30861defaultadminuser');
    await page.fill(
      'input[name="password"]',
      "correcthorsebatterystaple123(!__+@**(A'\"`;DROP TABLE packages;"
    );
    await page.click('button:has-text("Login")');
    await expect(page.getByText('Welcome, ece30861defaultadminuser!')).toBeVisible();

    // Navigate to the Download Page
    await page.getByRole('link', { name: 'Download' }).click();
    // Search for the package
    await page.getByLabel('Search by Name or Regex:').fill(testPackageName);
    await page.getByRole('button', { name: 'Search' }).click();
    await expect(page.getByText(`${testPackageName} (v${testPackageVersion})`)).toBeVisible();

    // Start downloading the package
    const [download] = await Promise.all([
      context.waitForEvent('download'),
      page.click('button:has-text("Download")'),
    ]);

    // Save the downloaded file
    const downloadPath = path.join(downloadDir, testFileName);
    await download.saveAs(downloadPath);

    // Verify the file exists
    const fs = require('fs');
    expect(fs.existsSync(downloadPath)).toBeTruthy();
  });
});
