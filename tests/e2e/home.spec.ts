import { expect, test } from "@playwright/test";

test("loads the workspace dashboard", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "제품 워크스페이스" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "새 작업" })).toBeVisible();
});
