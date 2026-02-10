import { test, expect } from '@playwright/test';

test('login with demo credentials', async ({ page }) => {
  await page.goto('/login');
  
  const emailInput = page.locator('input[type="email"]');
  const passwordInput = page.locator('input[type="password"]');
  const submitButton = page.locator('button[type="submit"]');
  
  await emailInput.fill('demo@vlooo.ai');
  await passwordInput.fill('demo1234');
  await submitButton.click();
  
  await page.waitForURL(/\/dashboard/, { timeout: 15000 });
  await expect(page).toHaveURL(/\/dashboard/);
});
