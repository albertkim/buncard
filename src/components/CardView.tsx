import { Button } from "@/components/ui/button"
import { Card } from "@/types/card"
import { useCardContext } from "@/context/CardContext"

interface CardViewProps {
  card: Card
  onEdit: () => void
}

export function CardView({ card, onEdit }: CardViewProps) {
  const { deleteCard } = useCardContext()

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this card?")) {
      deleteCard(card.id)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">{card.name}</h2>
        {/* TODO: Add barcode display component */}
        <div className="h-32 bg-gray-100 rounded flex items-center justify-center">
          {card.barcode}
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={onEdit} variant="outline" className="flex-1">
          Edit
        </Button>
        <Button onClick={handleDelete} variant="destructive" className="flex-1">
          Delete
        </Button>
      </div>
    </div>
  )
}
