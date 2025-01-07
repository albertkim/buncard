import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"

export function About() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">About</Button>
      </DialogTrigger>
      <DialogContent>
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">About Buncard</h2>
          <p className="text-gray-500">
            Buncard is a simple app that helps store your loyalty cards, membership cards, and other barcodes all in one
            place.
          </p>
          <p className="text-gray-500">
            I was an avid user of Stocard, but it was acquired by Klarna, which required maintaining a Klarna account
            and getting bombarded with ads when I'm just trying to open up my card.
          </p>
          <p className="text-gray-500">
            This application does not store any data on any servers. All data is stored locally on your device, and is
            easily exportable and importable.
          </p>
          <p className="text-gray-500">
            If you have any suggestions or feedback, please visit the{" "}
            <a
              href="https://github.com/albertkim/buncard"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              GitHub repository
            </a>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
