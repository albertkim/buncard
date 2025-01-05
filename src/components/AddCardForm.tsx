import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCards } from "@/hooks/useCards"
import { useState } from "react"

const CARD_COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#f59e0b", // amber
  "#84cc16", // lime
  "#22c55e", // green
  "#06b6d4", // cyan
  "#3b82f6", // blue
  "#6366f1", // indigo
  "#a855f7", // purple
  "#ec4899", // pink
]

interface AddCardFormProps {
  onSuccess: () => void
}

export function AddCardForm({ onSuccess }: AddCardFormProps) {
  const { addCard } = useCards()
  const [name, setName] = useState("")
  const [barcode, setBarcode] = useState("")
  const [selectedColor, setSelectedColor] = useState(CARD_COLORS[0])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    addCard({
      name,
      barcode,
      backgroundColor: selectedColor,
      barcodeType: "code128", // Default for now
    })
    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium">
          Card Name
        </label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="barcode" className="text-sm font-medium">
          Barcode
        </label>
        <Input
          id="barcode"
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Color</label>
        <div className="grid grid-cols-5 gap-2">
          {CARD_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              className="w-8 h-8 rounded-full transition-all"
              style={{
                backgroundColor: color,
              }}
              onClick={() => setSelectedColor(color)}
            />
          ))}
        </div>
      </div>

      <Button type="submit" className="w-full">
        Add Card
      </Button>
    </form>
  )
}
