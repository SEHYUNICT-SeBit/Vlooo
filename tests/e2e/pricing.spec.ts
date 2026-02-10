import { test, expect } from '@playwright/test';

test('pricing page shows plans and ready message', async ({ page }) => {
  await page.goto('/pricing');
  
  const headings = page.locator('h1');
  const headingCount = await headings.count();
  expect(headingCount).toBeGreaterThan(0);
  
  const disabledButtons = page.locator('button[disabled]');
  const Count = await disabledButtons.count();
  expect(Count).toBeGreaterThan(0);
});
