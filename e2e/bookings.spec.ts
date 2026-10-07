import { test, expect } from "@playwright/test";
for (const [category, section] of [
  ["movie", "movies"],
  ["event", "events"],
  ["sport", "sports"],
  ["bus", "bus"],
  ["train", "trains"],
  ["flight", "flights"],
]) {
  test(category + " search to persisted ticket", async ({ page }) => {
    await page.goto("/" + section);
    await page.waitForFunction(() => !!window.HAYClicky);
    await expect(page.locator(".listing-card").first()).toBeVisible();
    await page.getByRole("button", { name: /SEARCH/ }).click();
    await page.locator(".listing-card").first().getByRole("link", { name: "VIEW DETAILS" }).click();
    if (category === "movie") await page.getByRole("link", { name: /10:15/ }).first().click();
    else await page.getByRole("link", { name: /CHOOSE SEATS/ }).click();
    await page.waitForFunction(() => !!window.HAYClicky);
    if (category === "train") await page.getByRole("button", { name: /3A.*AVL/ }).click();
    await page
      .getByRole("gridcell", { name: /available/ })
      .first()
      .click();
    await page.getByRole("button", { name: /HOLD 1 SEAT/ }).click();
    await page.getByLabel("FULL NAME", { exact: true }).fill("Asha Rao");
    await page.getByLabel("EMAIL", { exact: true }).fill("asha@example.com");
    if (category === "train") {
      await page.getByLabel("Passenger 1 name", { exact: true }).fill("Asha Rao");
      await page.getByLabel("Passenger 1 age", { exact: true }).fill("29");
      await page.getByRole("button", { name: /Passenger 1 gender/ }).click();
      await page.getByRole("option", { name: "Female", exact: true }).click();
    }
    await page.getByRole("button", { name: "REVIEW IT" }).click();
    await expect(page.getByRole("button", { name: "LOOKS RIGHT" })).toBeVisible();
    await page.getByRole("button", { name: "LOOKS RIGHT" }).click();
    await page.getByRole("button", { name: /^PAY ₹/ }).click();
    await page.getByRole("link", { name: "OPEN WALLET" }).click();
    await page.reload();
    const issued = await page.evaluate(
      () => JSON.parse(localStorage.getItem("hay-pocket")!).state.purchasedTickets[0],
    );
    expect(issued.serial).toMatch(/^HAY-/);
    expect(issued.category).toBe(category);
    const card = page.locator(".ticket").filter({ hasText: issued.serial });
    await expect(card).toBeVisible();
    if (["bus", "train", "flight"].includes(category!)) {
      await expect(card).toContainText(issued.from.code);
      await expect(card).toContainText(issued.to.code);
      await expect(card).toContainText(issued.travelClass);
    }
    if (category === "train") {
      await expect(card).toContainText("PNR " + issued.pnr);
      expect(issued.travelClass).toBe("3A");
    }
    if (category === "movie") {
      expect(issued.time).toBe("10:15");
      await expect(card).toContainText("10:15");
    }
    await card.getByRole("link", { name: "OPEN", exact: true }).click();
    await page.reload();
    await expect(page.locator(".ticket")).toContainText(issued.serial);
  });
}
