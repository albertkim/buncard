import { useState, useEffect } from "react"
import { Card } from "@/types/card"

export function useCards() {
  const [cards, setCards] = useState<Card[]>(() => {
    const saved = localStorage.getItem("buncard-cards")
    return saved ? JSON.parse(saved) : []
  })

  useEffect(() => {
    localStorage.setItem("buncard-cards", JSON.stringify(cards))
  }, [cards])

  const addCard = (card: Omit<Card, "id" | "createdAt" | "updatedAt">) => {
    const newCard: Card = {
      ...card,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    setCards((prev) => [...prev, newCard])
  }

  const updateCard = (id: string, updates: Partial<Card>) => {
    setCards((prev) =>
      prev.map((card) =>
        card.id === id ? { ...card, ...updates, updatedAt: Date.now() } : card
      )
    )
  }

  const deleteCard = (id: string) => {
    setCards((prev) => prev.filter((card) => card.id !== id))
  }

  return { cards, addCard, updateCard, deleteCard }
}
