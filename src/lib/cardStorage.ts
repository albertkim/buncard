import { isCardData, normalizeCard } from "../domain/cards"
import type { Card } from "../domain/cards"

export const STORAGE_KEY = "buncard-cards"
const BACKUP_FILE_NAME = "buncard-backup.json"
const MAX_BACKUP_BYTES = 5_000_000

export function loadCards(): { cards: Card[]; error: string | null } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { cards: [], error: null }
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed) || !parsed.every(isCardData)) throw new Error("Invalid saved cards")
    return { cards: parsed.map(normalizeCard), error: null }
  } catch {
    return {
      cards: [],
      error: "Your saved cards could not be read. Your original data has been kept. Export it before making changes.",
    }
  }
}

export function storeCards(cards: Card[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cards))
}

export async function readBackup(file: File) {
  if (file.size > MAX_BACKUP_BYTES) throw new Error("Choose a backup smaller than 5 MB.")
  const data: unknown = JSON.parse(await file.text())
  const incoming: unknown[] = Array.isArray(data) ? data : [data]
  if (!incoming.length || !incoming.every(isCardData)) {
    throw new Error("This file does not look like a Buncard backup. No cards were changed.")
  }
  return incoming
}

export function downloadBackup(cards: Card[]) {
  // Export the original bytes if reading failed; never replace unreadable saved data.
  const data = localStorage.getItem(STORAGE_KEY) ?? JSON.stringify(cards)
  const url = URL.createObjectURL(new Blob([data], { type: "application/json" }))
  const link = document.createElement("a")
  link.href = url
  link.download = BACKUP_FILE_NAME
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
