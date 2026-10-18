export interface Card {
  id: string
  name: string
  barcode: string
  barcodeType: "qr" | "code128" | "ean13"
  backgroundColor: string
  favorite?: boolean
  createdAt: number
  updatedAt: number
}
