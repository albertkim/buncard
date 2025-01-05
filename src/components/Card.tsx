import { Card as CardType } from "@/types/card"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { useState } from "react"
import { CardView } from "@/components/CardView"
import { CardEdit } from "@/components/CardEdit"

interface CardProps {
  card: CardType
}

export function Card({ card }: CardProps) {
  const [open, setOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="h-40 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: card.backgroundColor }}
        >
          <span className="text-lg font-medium">{card.name}</span>
        </button>
      </DialogTrigger>
      <DialogContent>
        {isEditing ? (
          <CardEdit card={card} onDone={() => setIsEditing(false)} />
        ) : (
          <CardView card={card} onEdit={() => setIsEditing(true)} />
        )}
      </DialogContent>
    </Dialog>
  )
}
