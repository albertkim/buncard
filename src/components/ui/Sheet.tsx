import { useState } from "react"
import type { ReactNode } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { motion, useIsPresent, useReducedMotion } from "motion/react"
import { X } from "lucide-react"
import { useSheetDrag } from "../../hooks/useSheetDrag"

export function Sheet({
  title,
  children,
  onClose,
  wide = false,
}: {
  title: string
  children: ReactNode
  onClose: () => void
  wide?: boolean
}) {
  const [returnFocus] = useState(() => (document.activeElement instanceof HTMLElement ? document.activeElement : null))
  const present = useIsPresent()
  const reduced = useReducedMotion()
  const { ref: sheetRef, y: sheetY } = useSheetDrag(present, reduced, onClose)
  return (
    <Dialog.Root
      open={present}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <Dialog.Portal forceMount>
        <Dialog.Overlay forceMount asChild>
          <motion.div
            className="scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          />
        </Dialog.Overlay>
        <div className="sheet-position">
          <Dialog.Content
            forceMount
            asChild
            aria-describedby={undefined}
            onCloseAutoFocus={(event) => {
              event.preventDefault()
              if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true })
            }}
          >
            <motion.div
              className={`sheet ${wide ? "scan-sheet" : ""}`}
              ref={sheetRef}
              initial={{ opacity: 0, scale: reduced ? 1 : 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: reduced ? 1 : 0.98 }}
              transition={{ type: "spring", stiffness: 420, damping: 34, opacity: { duration: 0.16 } }}
              style={{ y: sheetY, pointerEvents: present ? "auto" : "none" }}
            >
              <div className="sheet-handle" />
              <div className="sheet-heading">
                <div>
                  <Dialog.Title>{title}</Dialog.Title>
                </div>
                <Dialog.Close className="icon-button" aria-label="Close">
                  <X size={20} />
                </Dialog.Close>
              </div>
              {children}
            </motion.div>
          </Dialog.Content>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
