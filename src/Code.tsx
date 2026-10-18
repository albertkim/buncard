import Barcode from "react-barcode"
import QRCode from "react-qr-code"
import type { Card } from "./types/card"
export default function Code({ card }: { card: Card }) {
  if (card.barcodeType === "qr") return <QRCode value={card.barcode} size={200} />
  // EAN-13 requires a valid check digit. Validate before handing values to JsBarcode.
  const eanValid =
    /^\d{13}$/.test(card.barcode) &&
    (10 - ([...card.barcode.slice(0, 12)].reduce((sum, n, i) => sum + Number(n) * (i % 2 ? 3 : 1), 0) % 10)) % 10 ===
      Number(card.barcode[12])
  if (
    (card.barcodeType === "ean13" && !eanValid) ||
    (card.barcodeType === "code128" && !/^[\x20-\x7e]+$/.test(card.barcode))
  )
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
