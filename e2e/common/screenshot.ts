import {expect, Page} from "@playwright/test";

export async function takeScreenshot(page: Page, selector: string, name: string) {
  await page.goto("/");
  const component = page.locator(selector);
  await expect(component).toBeVisible({timeout: 60000});
  await expect(component).toHaveScreenshot(`${name}.png`);
}
