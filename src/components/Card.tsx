import { Card as CardType } from "@/types/card"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { useState, useEffect } from "react"
import { CardView } from "@/components/CardView"
import { CardEdit } from "@/components/CardEdit"
import { useCardContext } from "@/context/CardContext"

interface CardProps {
  card: CardType
}

function getContrastColor(backgroundColor: string) {
  // Convert hex to RGB
  const hex = backgroundColor.replace("#", "")
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 2), 16)
  const b = parseInt(hex.substring(4, 2), 16)

  // Calculate relative luminance using the formula from WCAG 2.0
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

  // Return white for dark backgrounds, black for light backgrounds
  return luminance > 0.5 ? "#000000" : "#ffffff"
}

export function Card({ card }: CardProps) {
  const [open, setOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const { deleteCard } = useCardContext()

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (deleteConfirm) {
      timer = setTimeout(() => {
        setDeleteConfirm(false)
      }, 5000)
    }
    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [deleteConfirm])

  function handleDelete() {
    if (!deleteConfirm) {
      setDeleteConfirm(true)
    } else {
      deleteCard(card.id)
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="h-40 rounded-lg flex items-center justify-center shadow-md"
          style={{
            backgroundColor: card.backgroundColor,
            color: getContrastColor(card.backgroundColor),
          }}
        >
          <span className="text-lg font-medium">{card.name}</span>
        </button>
      </DialogTrigger>
      <DialogContent>
        {isEditing ? (
          <CardEdit card={card} onDone={() => setOpen(false)} />
        ) : (
          <CardView
            card={card}
            onEdit={() => setIsEditing(true)}
            onDelete={handleDelete}
            deleteConfirm={deleteConfirm}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
