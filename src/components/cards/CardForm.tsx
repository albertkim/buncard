import { lazy, Suspense, useState } from "react"
import type { FormEvent } from "react"
import { AnimatePresence, motion } from "motion/react"
import { Check, ChevronRight, ScanLine } from "lucide-react"
import { toast } from "sonner"
import { CARD_COLORS, getBarcodeError } from "../../domain/cards"
import type { Card } from "../../domain/cards"
import { Sheet } from "../ui/Sheet"

const Scanner = lazy(() => import("react-qr-barcode-scanner"))

export function CardForm({
  card,
  cards,
  onSave,
  onClose,
}: {
  card?: Card
  cards: Card[]
  onSave: (card: Card) => boolean
  onClose: () => void
}) {
  const [name, setName] = useState(card?.name ?? "")
  const [barcode, setBarcode] = useState(card?.barcode ?? "")
  const [type, setType] = useState<Card["barcodeType"]>(card?.barcodeType ?? "code128")
  const [color, setColor] = useState(card?.backgroundColor ?? CARD_COLORS[0])
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState("")
  function submit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim() || !barcode.trim()) return setError("Add a name and card number.")
    if (cards.some((c) => c.id !== card?.id && c.barcode === barcode.trim()))
      return setError("That card number is already in your wallet.")
    const barcodeError = getBarcodeError(barcode.trim(), type)
    if (barcodeError) return setError(barcodeError)
    if (
      onSave({
        ...card,
        id: card?.id ?? crypto.randomUUID(),
        name: name.trim(),
        barcode: barcode.trim(),
        barcodeType: type,
        backgroundColor: color,
        createdAt: card?.createdAt ?? Date.now(),
        updatedAt: Date.now(),
      })
    )
      onClose()
  }
  return (
    <Sheet title={card ? "Edit card" : "Add card"} onClose={onClose}>
      <form onSubmit={submit} className="card-form">
        <motion.div className="mini-preview" animate={{ backgroundColor: color }} transition={{ duration: 0.3 }}>
          <span>{name || "New card"}</span>
          <motion.img
            className="preview-bun"
            src="/bun.svg"
            alt=""
            key={color}
            initial={{ rotate: -14, scale: 0.85 }}
            animate={{ rotate: 9, scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 14 }}
          />
        </motion.div>
        <button type="button" className="scan-button" onClick={() => setScanning(!scanning)}>
          <ScanLine size={20} />
          {scanning ? "Stop camera" : "Scan a card"}
          <ChevronRight size={18} />
        </button>
        <AnimatePresence initial={false}>
          {scanning && (
            <motion.div
              className="camera"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22 }}
            >
              <div className="camera-frame" aria-hidden="true">
                <span />
              </div>
              <Suspense fallback={<p>Starting camera…</p>}>
                <Scanner
                  onError={() => {
                    setError("Camera unavailable. Check camera permissions or enter your number below.")
                    setScanning(false)
                  }}
                  onUpdate={(_error, result) => {
                    if (result) {
                      setBarcode(result.getText())
                      const format = result.getBarcodeFormat()
                      setType(format === 11 ? "qr" : format === 7 ? "ean13" : "code128")
                      setScanning(false)
                      setError("")
                      toast.success("Scanned")
                    }
                  }}
                />
              </Suspense>
            </motion.div>
          )}
        </AnimatePresence>
        <label>
          Card name
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={70} required />
        </label>
        <label>
          Card number
          <input value={barcode} onChange={(e) => setBarcode(e.target.value)} maxLength={2048} required />
        </label>
        <label>
          Code format
          <select value={type} onChange={(e) => setType(e.target.value as Card["barcodeType"])}>
            <option value="code128">Barcode · Code 128</option>
            <option value="ean13">Barcode · EAN-13</option>
            <option value="qr">QR code</option>
          </select>
        </label>
        <fieldset>
          <legend>Color</legend>
          <div className="swatches">
            {CARD_COLORS.map((c, i) => (
              <motion.button
                type="button"
                whileHover={{ scale: 1.12, y: -2 }}
                whileTap={{ scale: 0.88 }}
                animate={{ scale: color === c ? 1.08 : 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 23 }}
                aria-label={`Color ${i + 1}`}
                aria-pressed={color === c}
                className="swatch"
                key={c}
                style={{ background: c }}
                onClick={() => setColor(c)}
              >
                <AnimatePresence>
                  {color === c && (
                    <motion.span
                      key="check"
                      className="swatch-check"
                      initial={{ scale: 0, rotate: -45 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <Check size={18} />
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            ))}
          </div>
        </fieldset>
        <AnimatePresence initial={false}>
          {error && (
            <motion.p
              className="error"
              role="alert"
              key={error}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.16 }}
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
        <button className="primary" type="submit">
          <Check size={18} />
          {card ? "Save changes" : "Add to my wallet"}
        </button>
      </form>
    </Sheet>
  )
}
