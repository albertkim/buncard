import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/types/card"
import { useCardContext } from "@/context/CardContext"
import { useState } from "react"

interface CardEditProps {
  card: Card
  onDone: () => void
}

export function CardEdit({ card, onDone }: CardEditProps) {
  const { updateCard } = useCardContext()
  const [name, setName] = useState(card.name)
  const [barcode, setBarcode] = useState(card.barcode)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateCard(card.id, {
      name,
      barcode,
    })
    onDone()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="edit-name" className="text-sm font-medium">
          Card Name
        </label>
        <Input
          id="edit-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="edit-barcode" className="text-sm font-medium">
          Barcode
        </label>
        <Input
          id="edit-barcode"
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          required
        />
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onDone}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button type="submit" className="flex-1">
          Save
        </Button>
      </div>
    </form>
  )
}
