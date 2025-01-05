import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCardContext } from "@/context/CardContext"
import { useState } from "react"
import { Card } from "@/types/card"
import BarcodeScannerComponent from "react-qr-barcode-scanner"
import { QrCode } from "lucide-react"

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

interface CardFormProps {
  card?: Card
  onDone: () => void
}

export function CardForm({ card, onDone }: CardFormProps) {
  const { addCard, updateCard } = useCardContext()
  const [name, setName] = useState(card?.name ?? "")
  const [barcode, setBarcode] = useState(card?.barcode ?? "")
  const [selectedColor, setSelectedColor] = useState(
    card?.backgroundColor ?? CARD_COLORS[0]
  )
  const [showScanner, setShowScanner] = useState(false)

  const isEditing = !!card

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const cardData = {
      name,
      barcode,
      backgroundColor: selectedColor,
      barcodeType: "code128" as const,
    }

    if (isEditing && card) {
      updateCard(card.id, cardData)
    } else {
      addCard(cardData)
    }

    onDone()
  }

  const handleScan = (result: string | null | undefined) => {
    if (result) {
      setBarcode(result)
      setShowScanner(false)
    }
  }

  if (showScanner) {
    return (
      <div className="space-y-4">
        <div className="relative">
          <div className="h-[400px]">
            <BarcodeScannerComponent
              width="100%"
              height={400}
              onUpdate={(_error, result) => handleScan(result?.toString())}
            />
          </div>
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowScanner(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="card-name" className="text-sm font-medium">
          Card Name
        </label>
        <Input
          id="card-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="card-barcode" className="text-sm font-medium">
          Barcode
        </label>
        <div className="flex gap-2">
          <Input
            id="card-barcode"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            required
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowScanner(!showScanner)}
          >
            <QrCode className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!isEditing && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Color</label>
          <div className="grid grid-cols-5 gap-2">
            {CARD_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${
                  color === selectedColor
                    ? "ring-2 ring-offset-2 ring-primary"
                    : ""
                }`}
                style={{
                  backgroundColor: color,
                }}
                onClick={() => setSelectedColor(color)}
              />
            ))}
          </div>
        </div>
      )}

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
          {isEditing ? "Save" : "Add Card"}
        </Button>
      </div>
    </form>
  )
}
