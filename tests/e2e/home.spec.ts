import { test, expect } from '@playwright/test';

test('home page renders hero', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    '내 PPT가 전문가의 영상으로 흐르다'
  );
  await expect(page.getByRole('button', { name: '지금 시작하기' })).toBeVisible();
});
