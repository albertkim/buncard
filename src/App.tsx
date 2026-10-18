import { lazy, Suspense, useEffect, useRef, useState } from "react"
import type { FormEvent, ReactNode } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { AnimatePresence, motion, MotionConfig } from "motion/react"
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Check,
  ChevronRight,
  Copy,
  Ellipsis,
  Plus,
  ScanLine,
  Search,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Star,
  Trash2,
  Wallet,
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
  description,
  children,
  onClose,
  wide = false,
}: {
  title: string
  description?: string
  children: ReactNode
  onClose: () => void
  wide?: boolean
}) {
  return (
    <Dialog.Root
      open
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="scrim" />
        <Dialog.Content
          className={`sheet ${wide ? "scan-sheet" : ""}`}
          {...(!description ? { "aria-describedby": undefined } : {})}
        >
          <div className="sheet-handle" />
          <div className="sheet-heading">
            <div>
              <Dialog.Title>{title}</Dialog.Title>
              {description && <Dialog.Description>{description}</Dialog.Description>}
            </div>
            <Dialog.Close className="icon-button" aria-label="Close">
              <X size={20} />
            </Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
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
    <Sheet
      title={card ? "A little refresh" : "Meet your next card"}
      description={card ? undefined : "Scan a barcode, or enter the number below."}
      onClose={onClose}
    >
      <form onSubmit={submit} className="card-form">
        <div className="mini-preview" style={{ background: color }}>
          <span>{name || "Your lovely new card"}</span>
          <img className="preview-bun" src="/bun.svg" alt="" />
        </div>
        <button type="button" className="scan-button" onClick={() => setScanning(!scanning)}>
          <ScanLine size={20} />
          {scanning ? "Stop camera" : "Scan a card"}
          <ChevronRight size={18} />
        </button>
        {scanning && (
          <div className="camera">
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
                    toast.success("Got it! Your card is scanned.")
                  }
                }}
              />
            </Suspense>
            <p>Hold the barcode steady inside the camera.</p>
          </div>
        )}
        <label>
          Card name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Your favourite coffee spot"
            maxLength={70}
            required
          />
        </label>
        <label>
          Card number
          <input
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            placeholder="The number below your barcode"
            maxLength={2048}
            required
          />
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
          <legend>Pick a little personality</legend>
          <div className="swatches">
            {COLORS.map((c, i) => (
              <button
                type="button"
                aria-label={`Color ${i + 1}`}
                aria-pressed={color === c}
                className="swatch"
                key={c}
                style={{ background: c }}
                onClick={() => setColor(c)}
              >
                {color === c && <Check size={18} />}
              </button>
            ))}
          </div>
        </fieldset>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
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
  const [tab, setTab] = useState<"all" | "favorites">("all")
  const [panel, setPanel] = useState<"add" | "settings" | "install" | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [editing, setEditing] = useState<Card | undefined>()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [install, setInstall] = useState<InstallEvent | null>(null)
  const [online, setOnline] = useState(navigator.onLine)
  const file = useRef<HTMLInputElement>(null)
  const selectedCard = cards.find((c) => c.id === selected)
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setInstall(e as InstallEvent)
    }
    const connected = () => setOnline(navigator.onLine)
    window.addEventListener("beforeinstallprompt", handler)
    window.addEventListener("online", connected)
    window.addEventListener("offline", connected)
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
      window.removeEventListener("online", connected)
      window.removeEventListener("offline", connected)
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
    if (success) toast.success(editing ? "Looking good. Card updated." : "A new card, a lighter wallet.")
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
    .filter((c) => (tab === "all" || c.favorite) && c.name.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => Number(!!b.favorite) - Number(!!a.favorite) || b.createdAt - a.createdAt)
  const close = () => {
    setPanel(null)
    setEditing(undefined)
  }
  return (
    <MotionConfig reducedMotion="user">
      <div className="app-shell">
        <header className="topbar">
          <a className="brand" href="./" aria-label="Buncard home">
            <span className="brand-icon">
              <img src="/bun.svg" alt="" />
            </span>
            buncard
            <span className="brand-dot" aria-hidden="true">
              ✳
            </span>
          </a>
          <div className="header-actions">
            <span className="local-badge">
              <span />
              {online ? "PRIVATE BY NATURE" : "Offline. Still ready."}
            </span>
            <button
              className="icon-button settings-button"
              aria-label="Wallet settings"
              onClick={() => setPanel("settings")}
            >
              <Ellipsis />
            </button>
          </div>
        </header>
        <main>
          <section className={`intro ${cards.length ? "has-cards" : ""}`}>
            <h1>
              <span className="heading-lead">Less wallet.</span>
              <br />
              <span>More life.</span>
              <Sparkles className="heading-spark" strokeWidth={1.3} />
            </h1>
          </section>
          {storageError && (
            <div className="error storage-error" role="alert">
              {storageError}
              <button onClick={() => downloadBackup(cards)}>Export original data</button>
            </div>
          )}
          <section className="wallet-section" aria-label="Your wallet">
            <div className="wallet-toolbar">
              <div className="segmented" aria-label="Filter cards">
                <button
                  aria-pressed={tab === "all"}
                  className={tab === "all" ? "active" : ""}
                  onClick={() => setTab("all")}
                >
                  My wallet <span>{cards.length}</span>
                </button>
                <button
                  aria-pressed={tab === "favorites"}
                  className={tab === "favorites" ? "active" : ""}
                  onClick={() => setTab("favorites")}
                >
                  <Star size={15} /> Favourites
                </button>
              </div>
              <button className="primary desktop-add" onClick={() => setPanel("add")}>
                <Plus size={18} />
                Add a card
              </button>
            </div>
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
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.94 }}
                    transition={{ type: "spring", stiffness: 330, damping: 28, delay: Math.min(index * 0.035, 0.2) }}
                    className="wallet-card-wrap"
                  >
                    <motion.button
                      className="wallet-card"
                      data-pattern={Array.from(card.name).reduce((n, c) => n + c.charCodeAt(0), 0) % 4}
                      style={{ background: card.backgroundColor }}
                      whileHover={{ y: -5, rotate: -0.6 }}
                      whileTap={{ scale: 0.97 }}
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
                    <button
                      className={`favorite-button ${card.favorite ? "is-favorite" : ""}`}
                      aria-label={`${card.favorite ? "Unfavourite" : "Favourite"} ${card.name}`}
                      aria-pressed={!!card.favorite}
                      onClick={() =>
                        persist(cards.map((c) => (c.id === card.id ? { ...c, favorite: !c.favorite } : c)))
                      }
                    >
                      <Star size={16} fill={card.favorite ? "currentColor" : "none"} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
              {cards.length > 0 && !query && tab === "all" && (
                <button className="add-tile" onClick={() => setPanel("add")}>
                  <span>
                    <Plus size={23} />
                  </span>
                  <strong>Your next good thing</strong>
                </button>
              )}
            </motion.div>
            {visible.length === 0 && (
              <div className="empty-state">
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
                    <h2>Goodbye, bulky wallet.</h2>
                    <button className="primary" onClick={() => setPanel("add")}>
                      <Plus size={18} />
                      Add your first card
                    </button>
                  </>
                ) : (
                  <>
                    <Search size={32} />
                    <h2>{query ? "No cards found" : "Keep your go-tos close"}</h2>
                    <p>{query ? "Try another name." : "Tap the star on a card to add it to your favourites."}</p>
                    {query && (
                      <button className="text-button" onClick={() => setQuery("")}>
                        Clear search
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </section>
          <section className="install-banner">
            <span className="install-icon">
              <Smartphone size={25} strokeWidth={1.5} />
            </span>
            <div>
              <h2>Pocket-sized. Home-screen ready.</h2>
            </div>
            <button onClick={() => setPanel("install")} aria-label="Install Buncard">
              Make it an app <ChevronRight size={17} />
            </button>
          </section>
        </main>
        <nav className="mobile-nav" aria-label="Wallet navigation">
          <button
            className={tab === "all" ? "current" : ""}
            onClick={() => {
              setTab("all")
              setQuery("")
            }}
          >
            <Wallet size={21} />
            Wallet
          </button>
          <button className="mobile-add" onClick={() => setPanel("add")} aria-label="Add a card">
            <Plus size={25} />
          </button>
          <button className={tab === "favorites" ? "current" : ""} onClick={() => setTab("favorites")}>
            <Star size={21} />
            Favourites
          </button>
        </nav>
        <input
          ref={file}
          type="file"
          accept=".json,application/json"
          hidden
          onChange={(e) => void importCards(e.target)}
        />
        {(panel === "add" || editing) && <CardForm card={editing} cards={cards} onSave={save} onClose={close} />}
        {selectedCard && !editing && (
          <Sheet title={selectedCard.name} onClose={() => setSelected(null)} wide>
            <div className="scan-card" style={{ background: selectedCard.backgroundColor }}>
              <h2>{selectedCard.name}</h2>
              <div className="barcode-paper">
                <Suspense fallback={<p>Getting your card ready…</p>}>
                  <Code card={selectedCard} />
                </Suspense>
                <p className="card-number">{selectedCard.barcode}</p>
              </div>
              <p className="scan-hint">
                <ScanLine size={16} />
                Show this at the checkout
              </p>
            </div>
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
          <Sheet title="Your wallet" onClose={close}>
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
                  toast.success("Your backup is ready")
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
              <h3>Just you and your cards.</h3>
              <p>
                Your cards stay in this browser on this device. No account, no tracking, no ads. Export a backup before
                clearing browser data or moving to a new phone.
              </p>
            </div>
            <a className="source-link" href="https://github.com/albertkim/buncard" target="_blank" rel="noreferrer">
              Made with care. Open source. ↗
            </a>
          </Sheet>
        )}
        {panel === "install" && (
          <Sheet title="Add to home screen" onClose={close}>
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
                    toast.success("Welcome home, Buncard.")
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
                    Open your browser menu and choose “Install app” or “Add to Home screen”. If already installed, open
                    Buncard from your apps.
                  </p>
                </li>
              </ol>
            )}
            <p className="backup-reminder">
              Keep a backup handy: cards are stored locally, and some browsers keep installed apps in separate storage.
            </p>
          </Sheet>
        )}
        <Toaster position="top-center" richColors closeButton />
      </div>
    </MotionConfig>
  )
}
export default App
