import { Button } from "./ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog"
import { useCardContext } from "@/context/CardContext"
import { Upload } from "lucide-react"
import { Card } from "@/types/card"
import { useRef, useState } from "react"

export function Import() {
  const { addCard } = useCardContext()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)

  const validateCard = (
    card: Partial<Card>
  ): card is Omit<Card, "id" | "createdAt" | "updatedAt"> => {
    return (
      typeof card.name === "string" &&
      typeof card.barcode === "string" &&
      ["qr", "code128", "ean13"].includes(card.barcodeType as string) &&
      typeof card.backgroundColor === "string"
    )
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string)
        const cards = Array.isArray(json) ? json : [json]

        let validCards = 0
        cards.forEach((card) => {
          if (validateCard(card)) {
            addCard(card)
            validCards++
          }
        })

        if (validCards > 0) {
          if (fileInputRef.current) {
            fileInputRef.current.value = ""
          }
          setOpen(false)
        } else {
          alert("No valid cards found in the file. Please check the format.")
        }
      } catch {
        alert("Invalid JSON file format. Please check your file and try again.")
      }
    }
    reader.readAsText(file)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Import</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Import Cards</DialogTitle>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          <div className="text-sm text-muted-foreground">
            Upload a JSON file containing card data. The file should contain an
            array of cards with name, barcode, barcodeType, and backgroundColor
            fields.
          </div>

          <div className="flex justify-start">
            <label className="cursor-pointer">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button onClick={() => fileInputRef.current?.click()}>
                <Upload className="mr-2 h-4 w-4" />
                Choose File
              </Button>
            </label>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
