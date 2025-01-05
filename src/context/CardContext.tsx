import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react"
import { Card } from "@/types/card"

interface CardContextType {
  cards: Card[]
  addCard: (card: Omit<Card, "id" | "createdAt" | "updatedAt">) => void
  updateCard: (id: string, updates: Partial<Card>) => void
  deleteCard: (id: string) => void
}

const CardContext = createContext<CardContextType | undefined>(undefined)

export function CardProvider({ children }: { children: ReactNode }) {
  const [cards, setCards] = useState<Card[]>(() => {
    const saved = localStorage.getItem("buncard-cards")
    return saved ? JSON.parse(saved) : []
  })

  useEffect(() => {
    localStorage.setItem("buncard-cards", JSON.stringify(cards))
  }, [cards])

  const addCard = (card: Omit<Card, "id" | "createdAt" | "updatedAt">) => {
    // Check if card with same barcode already exists
    const isDuplicate = cards.some(
      (existingCard) => existingCard.barcode === card.barcode
    )
    if (isDuplicate) {
      return // Don't add duplicate cards
    }

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

  return (
    <CardContext.Provider value={{ cards, addCard, updateCard, deleteCard }}>
      {children}
    </CardContext.Provider>
  )
}

export function useCardContext() {
  const context = useContext(CardContext)
  if (context === undefined) {
    throw new Error("useCardContext must be used within a CardProvider")
  }
  return context
}
