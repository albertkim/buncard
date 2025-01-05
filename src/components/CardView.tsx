import { Card as CardType } from "@/types/card"
import { Button } from "./ui/button"
import Barcode from "react-barcode"

interface CardViewProps {
  card: CardType
  onEdit: () => void
  onDelete: () => void
  deleteConfirm: boolean
}

export function CardView({
  card,
  onEdit,
  onDelete,
  deleteConfirm,
}: CardViewProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">{card.name}</h2>
        <div className="h-32 mt-2 rounded flex items-center justify-center">
          <Barcode value={card.barcode} />
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={onEdit} variant="outline">
          Edit
        </Button>
        <Button
          onClick={onDelete}
          variant={deleteConfirm ? "destructive" : "outline"}
        >
          {deleteConfirm ? "Are you sure?" : "Delete"}
        </Button>
      </div>
    </div>
  )
}
