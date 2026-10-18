import { useEffect, useState } from "react"
import { toast } from "sonner"
import { normalizeCard } from "../domain/cards"
import type { Card } from "../domain/cards"
import { downloadBackup, loadCards, readBackup, STORAGE_KEY, storeCards } from "../lib/cardStorage"

export function useCards() {
  const [wallet, setWallet] = useState(loadCards)
  const { cards, error } = wallet

  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) setWallet(loadCards())
    }
    window.addEventListener("storage", sync)
    return () => window.removeEventListener("storage", sync)
  }, [])

  function persist(next: Card[]) {
    if (error) {
      toast.error("Export your original data first. Reload after fixing the saved data.")
      return false
    }
    try {
      storeCards(next)
      setWallet({ cards: next, error: null })
      return true
    } catch {
      toast.error("Could not save. Your device storage may be full. Export a backup to keep your cards safe.")
      return false
    }
  }

  function saveCard(card: Card) {
    const editing = cards.some((existing) => existing.id === card.id)
    const next = editing ? cards.map((existing) => (existing.id === card.id ? card : existing)) : [...cards, card]
    if (!persist(next)) return false
    toast.success(editing ? "Card updated" : "Card added")
    return true
  }

  function deleteCard(card: Card) {
    if (!persist(cards.filter((existing) => existing.id !== card.id))) return false
    toast("Card removed", {
      action: {
        label: "Undo",
        onClick() {
          // Read current storage so undo cannot restore a stale snapshot over newer edits.
          const latest = loadCards()
          if (latest.error) return
          try {
            const next = [...latest.cards, card]
            storeCards(next)
            setWallet({ cards: next, error: null })
          } catch {
            toast.error("Could not restore card")
          }
        },
      },
    })
    return true
  }

  async function importCards(file: File) {
    try {
      const incoming = await readBackup(file)
      const next = [...cards]
      const barcodes = new Set(cards.map((card) => card.barcode))
      let added = 0
      for (const card of incoming) {
        if (barcodes.has(card.barcode)) continue
        next.push(normalizeCard({ ...card, id: crypto.randomUUID() }))
        barcodes.add(card.barcode)
        added++
      }
      if (persist(next))
        toast.success(`${added} card${added === 1 ? "" : "s"} imported. ${incoming.length - added} duplicates skipped.`)
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Could not read this backup.")
    }
  }

  function exportCards() {
    downloadBackup(cards)
    toast.success("Backup exported")
  }

  return { cards, storageError: error, saveCard, deleteCard, importCards, exportCards }
}
