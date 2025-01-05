import { Button } from "./ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog"
import { Card } from "@/types/card"
import { Download } from "lucide-react"

interface ExportProps {
  cards: Card[]
}

export function Export({ cards }: ExportProps) {
  const exportData = cards.map(
    ({ name, barcode, barcodeType, backgroundColor }) => ({
      name,
      barcode,
      barcodeType,
      backgroundColor,
    })
  )

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "buncard-export.json"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Export</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Export Cards</DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          <div className="rounded-md bg-muted p-4">
            <pre className="text-sm overflow-auto max-h-[400px]">
              {cards.length === 0
                ? "Nothing to export"
                : JSON.stringify(exportData, null, 2)}
            </pre>
          </div>

          <Button
            onClick={handleDownload}
            className="mt-4"
            disabled={cards.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
