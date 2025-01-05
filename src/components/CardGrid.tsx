import { AddCardButton } from "@/components/AddCardButton"
import { Card } from "@/components/Card"
import { useCards } from "@/hooks/useCards"

export function CardGrid() {
  const { cards } = useCards()

  return (
    <div className="grid grid-cols-2 gap-4">
      {cards.map((card) => (
        <Card key={card.id} card={card} />
      ))}
      <AddCardButton />
    </div>
  )
}
