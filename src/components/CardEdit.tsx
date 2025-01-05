import { CardForm } from "@/components/CardForm"
import { Card } from "@/types/card"

interface CardEditProps {
  card: Card
  onDone: () => void
}

export function CardEdit({ card, onDone }: CardEditProps) {
  return <CardForm card={card} onDone={onDone} />
}
