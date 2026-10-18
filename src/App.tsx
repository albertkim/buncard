import { lazy, Suspense, useEffect, useRef, useState } from "react"
import type { FormEvent, ReactNode } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { AnimatePresence, motion, MotionConfig, useIsPresent, useReducedMotion } from "motion/react"
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Check,
  ChevronRight,
  Copy,
  Plus,
  ScanLine,
  Search,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Trash2,
  X,
} from "lucide-react"
import { Toaster, toast } from "sonner"
import type { Card } from "./types/card"
import { downloadBackup, loadCards, normalizeCard, STORAGE_KEY, validCard } from "./storage"
const Code = lazy(() => import("./Code"))
const Scanner = lazy(() => import("react-qr-barcode-scanner"))
const COLORS = ["#ff9566", "#dfff7f", "#a9baff", "#ffd764", "#d6b4fb", "#96dfcf", "#ffb7d1", "#e8e2d5"]
interface InstallEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: string }>
}
function Sheet({
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
              initial={{ opacity: 0, y: reduced ? 0 : 56, scale: reduced ? 1 : 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: reduced ? 0 : 28, scale: reduced ? 1 : 0.98 }}
              transition={{ type: "spring", stiffness: 420, damping: 34, opacity: { duration: 0.16 } }}
              style={{ pointerEvents: present ? "auto" : "none" }}
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
function CardForm({
  card,
  cards,
  onSave,
  onClose,
}: {
  card?: Card
  cards: Card[]
  onSave: (card: Card) => boolean
  onClose: () => void
}) {
  const [name, setName] = useState(card?.name ?? "")
  const [barcode, setBarcode] = useState(card?.barcode ?? "")
  const [type, setType] = useState<Card["barcodeType"]>(card?.barcodeType ?? "code128")
  const [color, setColor] = useState(card?.backgroundColor ?? COLORS[0])
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState("")
  function submit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim() || !barcode.trim()) return setError("Add a name and card number.")
    if (cards.some((c) => c.id !== card?.id && c.barcode === barcode.trim()))
      return setError("That card number is already in your wallet.")
    if (type === "code128" && !/^[\x20-\x7e]+$/.test(barcode.trim()))
      return setError("Code 128 supports standard letters, numbers, and symbols. Choose QR for other characters.")
    if (type === "ean13") {
      const b = barcode.trim()
      const check = (10 - ([...b.slice(0, 12)].reduce((s, n, i) => s + Number(n) * (i % 2 ? 3 : 1), 0) % 10)) % 10
      if (!/^\d{13}$/.test(b) || check !== Number(b[12]))
        return setError("Enter a valid 13-digit EAN number, including its check digit.")
    }
    if (
      onSave({
        ...card,
        id: card?.id ?? crypto.randomUUID(),
        name: name.trim(),
        barcode: barcode.trim(),
        barcodeType: type,
        backgroundColor: color,
        createdAt: card?.createdAt ?? Date.now(),
        updatedAt: Date.now(),
      })
    )
      onClose()
  }
  return (
    <Sheet title={card ? "Edit card" : "Add card"} onClose={onClose}>
      <form onSubmit={submit} className="card-form">
        <motion.div className="mini-preview" animate={{ backgroundColor: color }} transition={{ duration: 0.3 }}>
          <span>{name || "New card"}</span>
          <motion.img
            className="preview-bun"
            src="/bun.svg"
            alt=""
            key={color}
            initial={{ rotate: -14, scale: 0.85 }}
            animate={{ rotate: 9, scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 14 }}
          />
        </motion.div>
        <button type="button" className="scan-button" onClick={() => setScanning(!scanning)}>
          <ScanLine size={20} />
          {scanning ? "Stop camera" : "Scan a card"}
          <ChevronRight size={18} />
        </button>
        <AnimatePresence initial={false}>
          {scanning && (
            <motion.div
              className="camera"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22 }}
            >
              <div className="camera-frame" aria-hidden="true">
                <span />
              </div>
              <Suspense fallback={<p>Starting camera…</p>}>
                <Scanner
                  onError={() => {
                    setError("Camera unavailable. Check camera permissions or enter your number below.")
                    setScanning(false)
                  }}
                  onUpdate={(_error, result) => {
                    if (result) {
                      setBarcode(result.getText())
                      const format = result.getBarcodeFormat()
                      setType(format === 11 ? "qr" : format === 7 ? "ean13" : "code128")
                      setScanning(false)
                      setError("")
                      toast.success("Scanned")
                    }
                  }}
                />
              </Suspense>
            </motion.div>
          )}
        </AnimatePresence>
        <label>
          Card name
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={70} required />
        </label>
        <label>
          Card number
          <input value={barcode} onChange={(e) => setBarcode(e.target.value)} maxLength={2048} required />
        </label>
        <label>
          Code format
          <select value={type} onChange={(e) => setType(e.target.value as Card["barcodeType"])}>
            <option value="code128">Barcode · Code 128</option>
            <option value="ean13">Barcode · EAN-13</option>
            <option value="qr">QR code</option>
          </select>
        </label>
        <fieldset>
          <legend>Color</legend>
          <div className="swatches">
            {COLORS.map((c, i) => (
              <motion.button
                type="button"
                whileHover={{ scale: 1.12, y: -2 }}
                whileTap={{ scale: 0.88 }}
                animate={{ scale: color === c ? 1.08 : 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 23 }}
                aria-label={`Color ${i + 1}`}
                aria-pressed={color === c}
                className="swatch"
                key={c}
                style={{ background: c }}
                onClick={() => setColor(c)}
              >
                <AnimatePresence>
                  {color === c && (
                    <motion.span
                      key="check"
                      className="swatch-check"
                      initial={{ scale: 0, rotate: -45 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <Check size={18} />
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            ))}
          </div>
        </fieldset>
        <AnimatePresence initial={false}>
          {error && (
            <motion.p
              className="error"
              role="alert"
              key={error}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.16 }}
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
        <button className="primary" type="submit">
          <Check size={18} />
          {card ? "Save changes" : "Add to my wallet"}
        </button>
      </form>
    </Sheet>
  )
}
function App() {
  const [initial] = useState(loadCards)
  const [cards, setCards] = useState(initial.cards)
  const [storageError, setStorageError] = useState(initial.error)
  const [query, setQuery] = useState("")
  const [celebrating, setCelebrating] = useState<string | null>(null)
  const reduced = useReducedMotion()
  const [panel, setPanel] = useState<"add" | "settings" | "install" | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [editing, setEditing] = useState<Card | undefined>()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [install, setInstall] = useState<InstallEvent | null>(null)
  const file = useRef<HTMLInputElement>(null)
  const selectedCard = cards.find((c) => c.id === selected)
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setInstall(e as InstallEvent)
    }
    window.addEventListener("beforeinstallprompt", handler)
    const sync = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        const next = loadCards()
        setCards(next.cards)
        setStorageError(next.error)
      }
    }
    window.addEventListener("storage", sync)
    return () => {
      window.removeEventListener("beforeinstallprompt", handler)
      window.removeEventListener("storage", sync)
    }
  }, [])
  useEffect(() => {
    if (!selected) return
    let lock: WakeLockSentinel | undefined
    let cancelled = false
    const acquire = async () => {
      try {
        const next = await navigator.wakeLock?.request("screen")
        if (cancelled) await next?.release()
        else lock = next
      } catch {
        /* Unsupported or power saving mode. */
      }
    }
    const visible = () => {
      if (document.visibilityState === "visible") void acquire()
    }
    void acquire()
    document.addEventListener("visibilitychange", visible)
    return () => {
      cancelled = true
      void lock?.release()
      document.removeEventListener("visibilitychange", visible)
    }
  }, [selected])
  function persist(next: Card[]) {
    if (storageError) {
      toast.error("Export your original data first. Reload after fixing the saved data.")
      return false
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      setCards(next)
      return true
    } catch {
      toast.error("Could not save. Your device storage may be full. Export a backup to keep your cards safe.")
      return false
    }
  }
  function save(card: Card) {
    const success = persist(
      cards.some((c) => c.id === card.id) ? cards.map((c) => (c.id === card.id ? card : c)) : [...cards, card]
    )
    if (success) {
      toast.success(editing ? "Card updated" : "Card added")
      setCelebrating(card.id)
      window.setTimeout(() => setCelebrating((current) => (current === card.id ? null : current)), 1000)
    }
    return success
  }
  async function importCards(input: HTMLInputElement) {
    const uploaded = input.files?.[0]
    if (!uploaded) return
    try {
      if (uploaded.size > 5_000_000) throw new Error("Choose a backup smaller than 5 MB.")
      const data: unknown = JSON.parse(await uploaded.text())
      const incoming: unknown[] = Array.isArray(data) ? data : [data]
      if (!incoming.length || !incoming.every(validCard))
        throw new Error("This file does not look like a Buncard backup. No cards were changed.")
      const next = [...cards]
      let added = 0
      incoming.forEach((c) => {
        if (!next.some((existing) => existing.barcode === c.barcode)) {
          next.push(normalizeCard({ ...c, id: crypto.randomUUID() }))
          added++
        }
      })
      if (persist(next))
        toast.success(`${added} card${added === 1 ? "" : "s"} imported. ${incoming.length - added} duplicates skipped.`)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not read this backup.")
    }
    input.value = ""
  }
  const visible = cards
    .filter((c) => c.name.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => b.createdAt - a.createdAt)
  const close = () => {
    setPanel(null)
    setEditing(undefined)
  }
  return (
    <MotionConfig reducedMotion="user">
      <div className="app-shell" data-reduced-motion={reduced || undefined}>
        <main>
          <div className="wallet-heading">
            <div className="brand" aria-label="Buncard">
              <span className="brand-icon">
                <img src="/bun.svg" alt="" />
              </span>
              buncard
              <span className="brand-dot" aria-hidden="true">
                ✳
              </span>
            </div>
            {cards.length > 0 && (
              <button className="primary" onClick={() => setPanel("add")}>
                <Plus size={18} />
                Add a card
              </button>
            )}
          </div>
          <h1 className="sr-only">Your wallet</h1>
          {storageError && (
            <div className="error storage-error" role="alert">
              {storageError}
              <button onClick={() => downloadBackup(cards)}>Export original data</button>
            </div>
          )}
          <section className="wallet-section" aria-label="Your wallet">
            {cards.length > 0 && (
              <div className="search-box">
                <Search size={19} />
                <input
                  aria-label="Find a card"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Find your card…"
                />
                {query && (
                  <button aria-label="Clear search" onClick={() => setQuery("")}>
                    <X size={17} />
                  </button>
                )}
              </div>
            )}
            <motion.div className="card-grid" layout>
              <AnimatePresence mode="popLayout">
                {visible.map((card, index) => (
                  <motion.div
                    layout
                    key={card.id}
                    initial={{ opacity: 0, y: reduced ? 0 : 24, scale: reduced ? 1 : 0.93 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: reduced ? 0 : 8, scale: reduced ? 1 : 0.86 }}
                    transition={{ type: "spring", stiffness: 330, damping: 28, delay: Math.min(index * 0.035, 0.2) }}
                    className="wallet-card-wrap"
                  >
                    {celebrating === card.id && !reduced && (
                      <motion.span
                        className="card-celebration"
                        aria-hidden="true"
                        initial={{ opacity: 0, scale: 0.3, y: 10, rotate: -25 }}
                        animate={{
                          opacity: [0, 1, 1, 0],
                          scale: [0.3, 1.25, 1, 0.7],
                          y: [10, -12, -23, -35],
                          rotate: [-25, 10, 20, 30],
                        }}
                        transition={{ duration: 0.9 }}
                      >
                        <Sparkles size={30} />
                      </motion.span>
                    )}
                    <motion.button
                      className="wallet-card"
                      data-pattern={Array.from(card.name).reduce((n, c) => n + c.charCodeAt(0), 0) % 4}
                      style={{ background: card.backgroundColor }}
                      whileHover={reduced ? undefined : { y: -6, rotate: -1.2 }}
                      whileTap={reduced ? undefined : { scale: 0.95, rotate: 0.6 }}
                      transition={{ type: "spring", stiffness: 420, damping: 23 }}
                      onClick={() => {
                        setSelected(card.id)
                        setConfirmDelete(false)
                      }}
                      aria-label={`Open ${card.name}`}
                    >
                      <div className="card-top">
                        <span className="card-monogram">{card.name.slice(0, 1).toUpperCase()}</span>
                        <ScanLine size={20} />
                      </div>
                      <div className="card-bottom">
                        <h2>{card.name}</h2>
                        <span>
                          <ChevronRight size={16} />
                        </span>
                      </div>
                      <div className="card-decoration" />
                    </motion.button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
            {visible.length === 0 && (
              <motion.div
                className="empty-state"
                key={cards.length === 0 ? "empty-wallet" : "empty-search"}
                initial={{ opacity: 0, y: reduced ? 0 : 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22 }}
              >
                {cards.length === 0 ? (
                  <>
                    <div className="empty-illustration">
                      <span className="empty-card back" />
                      <span className="empty-card front">
                        <img className="empty-bun" src="/bun.svg" alt="" />
                        <span className="fake-barcode" />
                      </span>
                      <Sparkles className="empty-spark" size={30} />
                    </div>
                    <button className="primary" onClick={() => setPanel("add")}>
                      <Plus size={18} />
                      Add your first card
                    </button>
                  </>
                ) : (
                  <>
                    <Search size={32} />
                    <h2>No cards found</h2>
                    {query && (
                      <button className="text-button" onClick={() => setQuery("")}>
                        Clear search
                      </button>
                    )}
                  </>
                )}
              </motion.div>
            )}
          </section>
          <div className="wallet-utilities">
            <button aria-label="Wallet settings" onClick={() => setPanel("settings")}>
              Backup & settings
            </button>
          </div>
        </main>
        <input
          ref={file}
          type="file"
          accept=".json,application/json"
          hidden
          onChange={(e) => void importCards(e.target)}
        />
        <AnimatePresence mode="wait">
          {(panel === "add" || editing) && (
            <CardForm
              key={editing ? `edit-${editing.id}` : "add"}
              card={editing}
              cards={cards}
              onSave={save}
              onClose={close}
            />
          )}
          {selectedCard && !editing && (
            <Sheet key={`card-${selectedCard.id}`} title={selectedCard.name} onClose={() => setSelected(null)} wide>
              <motion.div
                className="scan-card"
                style={{ background: selectedCard.backgroundColor }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.2 }}
              >
                <div className="barcode-paper">
                  <Suspense fallback={<p>Getting your card ready…</p>}>
                    <Code card={selectedCard} />
                  </Suspense>
                  <p className="card-number">{selectedCard.barcode}</p>
                </div>
              </motion.div>
              <div className="scan-actions">
                <button
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(selectedCard.barcode)
                      toast.success("Card number copied")
                    } catch {
                      toast.error("Could not copy. You can select the number above.")
                    }
                  }}
                >
                  <Copy size={17} />
                  Copy number
                </button>
                <button onClick={() => setEditing(selectedCard)}>
                  Edit card
                  <ChevronRight size={17} />
                </button>
              </div>
              <button
                className="delete-button"
                onClick={() => {
                  if (!confirmDelete) return setConfirmDelete(true)
                  if (persist(cards.filter((c) => c.id !== selectedCard.id))) {
                    const removed = selectedCard
                    setSelected(null)
                    toast("Card removed", {
                      action: {
                        label: "Undo",
                        onClick: () => {
                          const latest = loadCards()
                          if (!latest.error) {
                            try {
                              const next = [...latest.cards, removed]
                              localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
                              setCards(next)
                            } catch {
                              toast.error("Could not restore card")
                            }
                          }
                        },
                      },
                    })
                  }
                }}
              >
                <Trash2 size={15} />
                {confirmDelete ? "Tap again to remove this card" : "Remove card"}
              </button>
            </Sheet>
          )}
          {panel === "settings" && (
            <Sheet key="settings" title="Your wallet" onClose={close}>
              <div className="settings-list">
                <button
                  onClick={() => {
                    file.current?.click()
                  }}
                >
                  <ArrowUpFromLine />
                  <span>
                    <strong>Import cards</strong>
                  </span>
                  <ChevronRight />
                </button>
                <button
                  onClick={() => {
                    downloadBackup(cards)
                    toast.success("Backup exported")
                  }}
                  disabled={!cards.length && !storageError}
                >
                  <ArrowDownToLine />
                  <span>
                    <strong>Export a backup</strong>
                  </span>
                  <ChevronRight />
                </button>
                <button onClick={() => setPanel("install")}>
                  <Smartphone />
                  <span>
                    <strong>Add to home screen</strong>
                  </span>
                  <ChevronRight />
                </button>
              </div>
              <div className="privacy-note">
                <ShieldCheck />
                <p>
                  Cards are saved in this browser. Export a backup before clearing browser data or switching devices.
                </p>
              </div>
              <a className="source-link" href="https://github.com/albertkim/buncard" target="_blank" rel="noreferrer">
                Source code ↗
              </a>
            </Sheet>
          )}
          {panel === "install" && (
            <Sheet key="install" title="Add to home screen" onClose={close}>
              <div className="install-art">
                <span className="brand-icon">
                  <img src="/bun.svg" alt="" />
                </span>
                <Sparkles size={25} />
              </div>
              {install ? (
                <button
                  className="primary"
                  onClick={async () => {
                    await install.prompt()
                    const choice = await install.userChoice
                    setInstall(null)
                    if (choice.outcome === "accepted") {
                      toast.success("Installed")
                      close()
                    }
                  }}
                >
                  Add to home screen
                  <Plus size={18} />
                </button>
              ) : (
                <ol className="install-steps">
                  <li>
                    <strong>On iPhone or iPad</strong>
                    <p>Open in Safari, tap Share, then “Add to Home Screen”.</p>
                  </li>
                  <li>
                    <strong>On Android or desktop</strong>
                    <p>
                      Open your browser menu and choose “Install app” or “Add to Home screen”. If already installed,
                      open Buncard from your apps.
                    </p>
                  </li>
                </ol>
              )}
              <p className="backup-reminder">
                Keep a backup handy: cards are stored locally, and some browsers keep installed apps in separate
                storage.
              </p>
            </Sheet>
          )}
        </AnimatePresence>
        <Toaster position="top-center" richColors closeButton />
      </div>
    </MotionConfig>
  )
}
export default App
