import Barcode from "react-barcode"
import QRCode from "react-qr-code"
import type { Card } from "../../domain/cards"
import { getBarcodeError } from "../../domain/cards"
export default function CardCode({ card }: { card: Card }) {
  if (card.barcodeType === "qr") return <QRCode value={card.barcode} size={200} />
  if (getBarcodeError(card.barcode, card.barcodeType))
    return <p className="code-error">This number cannot be rendered in this format. Edit the card to correct it.</p>
  return (
    <Barcode
      value={card.barcode}
      format={card.barcodeType === "ean13" ? "EAN13" : "CODE128"}
      width={2}
      height={100}
      margin={16}
      displayValue={false}
    />
  )
}
