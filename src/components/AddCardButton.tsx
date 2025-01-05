import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useState } from "react"
import { AddCardForm } from "@/components/AddCardForm"

export function AddCardButton() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="h-40 border-dashed flex flex-col gap-2 hover:border-solid"
        >
          <span className="text-2xl">+</span>
          <span>Add a card</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Card</DialogTitle>
        </DialogHeader>
        <AddCardForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}
