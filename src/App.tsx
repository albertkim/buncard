import { useEffect, useRef, useState } from "react"
import { AnimatePresence, MotionConfig, useReducedMotion } from "motion/react"
import { Toaster } from "sonner"
import { CardForm } from "./components/cards/CardForm"
import { CardView } from "./components/cards/CardView"
import { InstallSheet } from "./components/settings/InstallSheet"
import { SettingsSheet } from "./components/settings/SettingsSheet"
import { Wallet } from "./components/wallet/Wallet"
import type { Card } from "./domain/cards"
import { useCards } from "./hooks/useCards"
import { useInstall } from "./hooks/useInstall"
import { useScreenWakeLock } from "./hooks/useScreenWakeLock"

type View = { type: "wallet" | "add" | "settings" | "install" } | { type: "card" | "edit"; id: string }

export default function App() {
  const wallet = useCards()
  const install = useInstall()
  const reduced = useReducedMotion()
  const [view, setView] = useState<View>({ type: "wallet" })
  const [celebrating, setCelebrating] = useState<string | null>(null)
  const celebrationTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const activeCard = "id" in view ? wallet.cards.find((card) => card.id === view.id) : undefined

  useScreenWakeLock(!!activeCard)
  useEffect(() => () => clearTimeout(celebrationTimer.current), [])

  function close() {
    setView(view.type === "edit" ? { type: "card", id: view.id } : { type: "wallet" })
  }

  function save(card: Card) {
    if (!wallet.saveCard(card)) return false
    clearTimeout(celebrationTimer.current)
    setCelebrating(card.id)
    celebrationTimer.current = setTimeout(() => setCelebrating(null), 1000)
    return true
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className="app-shell" data-reduced-motion={reduced || undefined}>
        <Wallet
          cards={wallet.cards}
          storageError={wallet.storageError}
          celebrating={celebrating}
          onAdd={() => setView({ type: "add" })}
          onOpen={(id) => setView({ type: "card", id })}
          onSettings={() => setView({ type: "settings" })}
          onExport={wallet.exportCards}
        />
        <AnimatePresence mode="wait">
          {(view.type === "add" || (view.type === "edit" && activeCard)) && (
            <CardForm
              key={activeCard ? `edit-${activeCard.id}` : "add"}
              card={activeCard}
              cards={wallet.cards}
              onSave={save}
              onClose={close}
            />
          )}
          {view.type === "card" && activeCard && (
            <CardView
              key={`card-${activeCard.id}`}
              card={activeCard}
              onClose={close}
              onEdit={() => setView({ type: "edit", id: activeCard.id })}
              onDelete={wallet.deleteCard}
            />
          )}
          {view.type === "settings" && (
            <SettingsSheet
              key="settings"
              canExport={!!wallet.cards.length || !!wallet.storageError}
              onExport={wallet.exportCards}
              onImport={wallet.importCards}
              onInstall={() => setView({ type: "install" })}
              onClose={close}
            />
          )}
          {view.type === "install" && <InstallSheet key="install" {...install} onClose={close} />}
        </AnimatePresence>
        <Toaster position="top-center" richColors closeButton />
      </div>
    </MotionConfig>
  )
}
