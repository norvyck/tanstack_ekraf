import { test, expect } from '@playwright/test';

test.use({ channel: 'msedge' });

test('dashboard-to-products', async ({ page }) => {
  await page.route("**/*", async route => {
    const requestUrl = new URL(route.request().url());
    if (requestUrl.origin === "http://localhost:3000") {
      await route.continue();
    } else {
      await route.abort("blockedbyclient");
    }
  });
  await page.goto('http://localhost:3000');
  await page.getByRole('link', { name: 'Set up your store' }).click();
  await page.getByRole('button', { name: 'Seed Admin Account' }).click();
  await page.getByRole('main').getByRole('link', { name: 'Sign in' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('admin@example.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('admin12345');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.getByRole('link', { name: 'Products' }).click();
  await expect(page.getByRole('main')).toHaveText("Your catalogProductsA little care goes a long way. Keep your catalog fresh.Add productCatalog overview3 items in your collectionLive catalogNameDescriptionPriceStockActionsStarter KitEverything you need to begin.$49.0012Pro PlanFor growing teams.$149.005EnterpriseSelf-hosted, full support.$499.001Starter Kit$49.00 · Stock 12Pro Plan$149.00 · Stock 5Enterprise$499.00 · Stock 1");
});
