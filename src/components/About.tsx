import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { useState } from "react"

const EMAIL = "albert275@gmail.com"

export function About() {
  const [showCopied, setShowCopied] = useState(false)

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(EMAIL)
    setShowCopied(true)
    setTimeout(() => setShowCopied(false), 2000)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">About</Button>
      </DialogTrigger>
      <DialogContent>
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">About Buncard</h2>
          <p className="text-gray-500">
            Buncard is a simple app that helps store your loyalty cards,
            membership cards, and other barcodes all in one place.
          </p>
          <p className="text-gray-500">
            I was an avid user of Stocard, but it was acquired by Klarna, which
            required maintaining a Klarna account and getting bombarded with ads
            when I'm just trying to open up my card.
          </p>
          <p className="text-gray-500">
            This application does not store any data on any servers. All data is
            stored locally on your device, and is easily exportable and
            importable.
          </p>
          <p className="text-gray-500">
            If you have any suggestions or feedback, please let me know at{" "}
            <span
              onClick={handleCopyEmail}
              className="text-primary underline cursor-pointer"
            >
              {EMAIL}
            </span>
            {showCopied && (
              <span className="ml-2 text-sm text-muted-foreground">
                Copied!
              </span>
            )}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
