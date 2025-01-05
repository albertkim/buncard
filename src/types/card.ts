export interface Card {
  id: string
  name: string
  barcode: string
  barcodeType: "qr" | "code128" | "ean13"
  backgroundColor: string
  createdAt: number
  updatedAt: number
}
