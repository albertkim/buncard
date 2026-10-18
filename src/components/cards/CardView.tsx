import { useState } from "react"
import { ChevronRight, Copy, Trash2 } from "lucide-react"
import { toast } from "sonner"
import type { Card } from "../../domain/cards"
import { Sheet } from "../ui/Sheet"

import CardCode from "./CardCode"

export function CardView({
  card,
  onClose,
  onEdit,
  onDelete,
}: {
  card: Card
  onClose: () => void
  onEdit: () => void
  onDelete: (card: Card) => boolean
}) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  return (
    <Sheet title={card.name} onClose={onClose} wide>
      <div className="scan-card" style={{ background: card.backgroundColor }}>
        <div className="barcode-paper">
          <div className="barcode-graphic" data-format={card.barcodeType}>
            <CardCode card={card} />
          </div>
          <p className="card-number">{card.barcode}</p>
        </div>
      </div>
      <div className="scan-actions">
        <button
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(card.barcode)
              toast.success("Card number copied")
            } catch {
              toast.error("Could not copy. You can select the number above.")
            }
          }}
        >
          <Copy size={17} />
          Copy number
        </button>
        <button onClick={onEdit}>
          Edit card
          <ChevronRight size={17} />
        </button>
      </div>
      <button
        className="delete-button"
        onClick={() => {
          if (!confirmDelete) return setConfirmDelete(true)
          if (onDelete(card)) onClose()
        }}
      >
        <Trash2 size={15} />
        {confirmDelete ? "Tap again to remove this card" : "Remove card"}
      </button>
    </Sheet>
  )
}
