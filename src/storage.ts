import type { Card } from "./types/card"
export const STORAGE_KEY = "buncard-cards"
export function validCard(value: unknown): value is Card {
  if (!value || typeof value !== "object") return false
  const c = value as Card
  return (
    typeof c.name === "string" &&
    !!c.name.trim() &&
    typeof c.barcode === "string" &&
    !!c.barcode.trim() &&
    ["qr", "code128", "ean13"].includes(c.barcodeType) &&
    typeof c.backgroundColor === "string" &&
    /^#[0-9a-f]{6}$/i.test(c.backgroundColor)
  )
}
export function normalizeCard(c: Card): Card {
  return {
    ...c,
    id: typeof c.id === "string" ? c.id : crypto.randomUUID(),
    createdAt: c.createdAt || Date.now(),
    updatedAt: c.updatedAt || Date.now(),
  }
}
export function loadCards(): { cards: Card[]; error: string | null } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { cards: [], error: null }
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed) || !parsed.every(validCard)) throw new Error("Invalid saved cards")
    return { cards: parsed.map(normalizeCard), error: null }
  } catch {
    return {
      cards: [],
      error: "Your saved cards could not be read. Your original data has been kept. Export it before making changes.",
    }
  }
}
export function downloadBackup(cards: Card[]) {
  download(localStorage.getItem(STORAGE_KEY) ?? JSON.stringify(cards), "buncard-backup.json")
}
export function download(data: string, name: string) {
  const url = URL.createObjectURL(new Blob([data], { type: "application/json" }))
  const link = document.createElement("a")
  link.href = url
  link.download = name
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
