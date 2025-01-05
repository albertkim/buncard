import { Plus } from "lucide-react"
import { Button } from "./ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog"
import { CardForm } from "./CardForm"
import { useState } from "react"

export function AddCardButton() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="h-40 border-dashed flex flex-col gap-2 hover:border-solid"
        >
          <Plus className="text-2xl" />
          <span>Add a card</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Card</DialogTitle>
        </DialogHeader>
        <CardForm onDone={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}
