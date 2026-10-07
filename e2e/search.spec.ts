import { test, expect } from "@playwright/test";
test("global search keyboard, result tabs, empty state and hero", async ({ page }) => {
  await page.goto("/");
  await page.waitForFunction(() => !!window.HAYClicky);
  await page.keyboard.press("/");
  const input = page.getByRole("combobox", { name: "Find a ticket", exact: true });
  await expect(input).toBeFocused();
  await input.fill("afterlight");
  await expect(page.getByRole("option").first()).toBeVisible();
  await input.press("ArrowDown");
  await input.press("Enter");
  await expect(page.getByRole("heading", { name: "Afterlight 77", exact: true })).toBeVisible();
  await input.fill("Hyderabad");
  await input.press("Escape");
  await expect(input).toHaveAttribute("aria-expanded", "false");
  await input.press("Enter");
  await expect(page).toHaveURL(/search\?q=Hyderabad/);
  await page
    .getByRole("navigation", { name: "Search categories" })
    .getByRole("link", { name: "Trains" })
    .click();
  await expect(page.locator(".listing-card").first()).toContainText("train");
  await page.reload();
  await expect(page.locator(".listing-card").first()).toContainText("train");
  await page.waitForFunction(() => !!window.HAYClicky);
  await input.fill("NoSuchMoonCounter");
  await input.press("Enter");
  await expect(page.getByRole("heading", { name: /NO STUBS/ })).toBeVisible();
  await page.goto("/");
  await page.waitForFunction(() => !!window.HAYClicky);
  await page.getByRole("combobox", { name: "Search tickets", exact: true }).fill("Chennai");
  await page.getByRole("button", { name: "GO", exact: true }).click();
  await expect(page).toHaveURL(/search\?q=Chennai/);
});
