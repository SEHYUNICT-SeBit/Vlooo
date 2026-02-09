import { test, expect } from '@playwright/test';

test('pricing page shows plans and ready message', async ({ page }) => {
  await page.goto('/pricing');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('요금제');
  await expect(page.getByText('결제 준비중')).toBeVisible();
  await expect(page.getByRole('button', { name: '결제 준비중' }).first()).toBeDisabled();
});
