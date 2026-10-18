export interface Card {
  id: string
  name: string
  barcode: string
  barcodeType: "qr" | "code128" | "ean13"
  backgroundColor: string
  createdAt: number
  updatedAt: number
}

export type CardData = Pick<Card, "name" | "barcode" | "barcodeType" | "backgroundColor">

export const CARD_COLORS = ["#ff9566", "#dfff7f", "#a9baff", "#ffd764", "#d6b4fb", "#96dfcf", "#ffb7d1", "#e8e2d5"]

function isEan13(value: string) {
  if (!/^\d{13}$/.test(value)) return false
  const sum = [...value.slice(0, 12)].reduce((total, digit, index) => total + Number(digit) * (index % 2 ? 3 : 1), 0)
  return (10 - (sum % 10)) % 10 === Number(value[12])
}

export function getBarcodeError(value: string, type: Card["barcodeType"]): string | null {
  if (type === "code128" && !/^[\x20-\x7e]+$/.test(value)) {
    return "Code 128 supports standard letters, numbers, and symbols. Choose QR for other characters."
  }
  if (type === "ean13" && !isEan13(value)) {
    return "Enter a valid 13-digit EAN number, including its check digit."
  }
  return null
}

export function isCardData(value: unknown): value is CardData & Partial<Card> {
  if (!value || typeof value !== "object") return false
  const card = value as Partial<CardData>
  return (
    typeof card.name === "string" &&
    !!card.name.trim() &&
    typeof card.barcode === "string" &&
    !!card.barcode.trim() &&
    ["qr", "code128", "ean13"].includes(card.barcodeType ?? "") &&
    typeof card.backgroundColor === "string" &&
    /^#[0-9a-f]{6}$/i.test(card.backgroundColor)
  )
}

export function normalizeCard(card: CardData & Partial<Card>): Card {
  return {
    ...card,
    id: typeof card.id === "string" ? card.id : crypto.randomUUID(),
    createdAt: typeof card.createdAt === "number" && card.createdAt ? card.createdAt : Date.now(),
    updatedAt: typeof card.updatedAt === "number" && card.updatedAt ? card.updatedAt : Date.now(),
  }
}
