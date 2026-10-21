import { expect, test } from '@playwright/test';

test.describe('public shell', () => {
  test('landing page loads with the product name and primary actions', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('AuraWell AI').first()).toBeVisible();
    await expect(page.getByRole('link', { name: /get started/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /sign in/i }).first()).toBeVisible();
  });

  test('navigating to the login page shows the sign-in form', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
  });

  test('an unknown route renders the not-found page', async ({ page }) => {
    await page.goto('/this-route-does-not-exist');
    await expect(page.getByText('Page not found')).toBeVisible();
  });
});
