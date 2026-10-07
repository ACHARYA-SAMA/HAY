import { test, expect } from "@playwright/test";
test.use({ colorScheme: "dark" });
test("Night Press keeps the board dark and uses layered surfaces", async ({ page }) => {
  await page.goto("/");
  await page.waitForFunction(() => !!window.HAYClicky);
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  const tokens = await page.evaluate(() => {
    const s = getComputedStyle(document.documentElement);
    return ["--paper", "--paper-2", "--card", "--raised", "--ink"].map((v) =>
      s.getPropertyValue(v).trim().toUpperCase(),
    );
  });
  expect(tokens).toEqual(["#0C0C0B", "#151513", "#1B1B18", "#242420", "#F4EFE0"]);
  await expect(page.locator(".split-board")).toHaveCSS("background-color", "rgb(21, 21, 19)");
  await expect(page.locator(".split-board")).toHaveCSS("border-top-width", "3px");
  expect(
    await page.locator(".split-board").evaluate((e) => getComputedStyle(e).boxShadow),
  ).not.toContain("rgb(244, 239, 224)");
});
