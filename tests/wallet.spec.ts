import { test, expect } from "@playwright/test"
const legacy = {
  id: "legacy",
  name: "Grocery club",
  barcode: "123456789",
  barcodeType: "code128",
  backgroundColor: "#c7d4b5",
  createdAt: 1,
  updatedAt: 1,
}
test("add, persist, search, edit, remove, undo", async ({ page }) => {
  await page.goto("/")
  await expect(page.getByRole("button", { name: "Add your first card" })).toBeVisible()
  await page.getByRole("button", { name: "Add your first card" }).click()
  await page.getByLabel("Card name", { exact: true }).fill("Coffee club")
  await page.getByLabel("Card number", { exact: true }).fill("123456789")
  await page.getByRole("button", { name: "Add to my wallet" }).click()
  await expect(page.getByRole("button", { name: "Open Coffee club" })).toBeVisible()
  await page.reload()
  await expect(page.getByRole("navigation")).toHaveCount(0)
  await expect(page.getByRole("button", { name: /favourite/i })).toHaveCount(0)
  await expect(page.getByRole("button", { name: "Add a card", exact: true })).toHaveCount(1)
  await page.getByLabel("Find a card").fill("missing")
  await expect(page.getByText("No cards found")).toBeVisible()
  await page.getByRole("button", { name: "Clear search" }).first().click()
  await page.getByRole("button", { name: "Open Coffee club" }).click()
  await expect(page.locator(".barcode-paper svg")).toBeVisible()
  await page.getByRole("button", { name: "Edit card" }).click()
  await page.getByLabel("Card name", { exact: true }).fill("Coffee perks")
  await page.getByRole("button", { name: "Save changes" }).click()
  await expect(page.getByRole("dialog")).toContainText("Coffee perks")
  await page.getByRole("button", { name: "Remove card", exact: true }).click()
  await page.getByRole("button", { name: "Tap again to remove this card" }).click()
  await expect(page.getByRole("button", { name: "Add your first card" })).toBeVisible()
  await page.getByRole("button", { name: "Undo", exact: true }).click()
  await expect(page.getByRole("button", { name: "Open Coffee perks" })).toBeVisible()
})
test("legacy data, QR, EAN and duplicate-safe imports", async ({ page }) => {
  await page.addInitScript((card) => localStorage.setItem("buncard-cards", JSON.stringify([card])), legacy)
  await page.goto("/")
  await page.getByRole("button", { name: "Wallet settings" }).click()
  const incoming = [
    legacy,
    { ...legacy, barcode: "4006381333931", name: "EAN shop", barcodeType: "ean13" },
    { ...legacy, barcode: "https://example.com/member", name: "QR membership", barcodeType: "qr" },
  ]
  await page
    .locator("input[type=file]")
    .setInputFiles({ name: "backup.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(incoming)) })
  await expect(page.getByText("2 cards imported. 1 duplicates skipped.")).toBeVisible()
  await page.getByRole("button", { name: "Close", exact: true }).click()
  await expect(page.locator(".wallet-card")).toHaveCount(3)
  await page.getByRole("button", { name: "Open EAN shop" }).click()
  await expect(page.locator(".barcode-paper svg")).toBeVisible()
  await page.getByRole("button", { name: "Close", exact: true }).click()
  await page.getByRole("button", { name: "Open QR membership" }).click()
  await expect(page.locator(".barcode-paper svg")).toBeVisible()
})
test("bad saved data is preserved, and invalid imports do not modify cards", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("buncard-cards", "broken original"))
  await page.goto("/")
  await expect(page.getByRole("alert")).toContainText("Your original data has been kept")
  expect(await page.evaluate(() => localStorage.getItem("buncard-cards"))).toBe("broken original")
})
test("offline launch keeps cards and layout fits the viewport", async ({ page, context }) => {
  await page.goto("/")
  await page.evaluate((card) => localStorage.setItem("buncard-cards", JSON.stringify([card])), legacy)
  await page.reload()
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready
  })
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true)
  await context.setOffline(true)
  await page.reload()
  await expect(page.getByRole("button", { name: "Open Grocery club" })).toBeVisible()
  await page.getByRole("button", { name: "Open Grocery club" }).click()
  await expect(page.locator(".barcode-paper svg")).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
})

test("invalid imports are atomic, export includes cards, and Escape closes settings", async ({ page }) => {
  await page.goto("/")
  await page.evaluate((card) => localStorage.setItem("buncard-cards", JSON.stringify([card])), legacy)
  await page.reload()
  await page.getByRole("button", { name: "Wallet settings" }).click()
  await page.locator("input[type=file]").setInputFiles({
    name: "invalid.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify([legacy, { name: "Invalid" }])),
  })
  await expect(page.getByText("This file does not look like a Buncard backup. No cards were changed.")).toBeVisible()
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("buncard-cards")!).length)).toBe(1)
  const download = page.waitForEvent("download")
  await page.getByRole("button", { name: "Export a backup" }).click()
  const saved = await download
  const stream = await saved.createReadStream()
  const chunks = []
  for await (const chunk of stream!) chunks.push(chunk)
  expect(JSON.parse(Buffer.concat(chunks).toString())[0].barcode).toBe(legacy.barcode)
  await page.keyboard.press("Escape")
  await expect(page.getByRole("dialog")).toHaveCount(0)
})

test("animated dialogs restore focus and remain usable with reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/")
  const settings = page.getByRole("button", { name: "Wallet settings" })
  await settings.click()
  await expect(page.getByRole("dialog")).toBeVisible()
  await page.keyboard.press("Escape")
  await expect(page.getByRole("dialog")).toHaveCount(0)
  await expect(settings).toBeFocused()
  await page.getByRole("button", { name: "Add your first card" }).click()
  await page.getByRole("button", { name: "Color 3", exact: true }).click()
  await expect(page.getByRole("button", { name: "Color 3", exact: true })).toHaveAttribute("aria-pressed", "true")
  await expect(page.locator(".mini-preview")).toHaveCSS("background-color", "rgb(169, 186, 255)")
  const bounds = await page.getByRole("dialog").boundingBox()
  expect(bounds!.y).toBeGreaterThanOrEqual(0)
  expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(page.viewportSize()!.height + 1)
  await page.getByRole("button", { name: "Close", exact: true }).click()
  await expect(page.getByRole("dialog")).toHaveCount(0)
})
