import { useState } from "react"
import { motion, useReducedMotion } from "motion/react"
import { ChevronRight, Plus, Search, Smartphone, Sparkles, X } from "lucide-react"
import type { Card } from "../../domain/cards"
import { CardGrid } from "./CardGrid"

interface WalletProps {
  cards: Card[]
  storageError: string | null
  celebrating: string | null
  onAdd: () => void
  onOpen: (id: string) => void
  onSettings: () => void
  onExport: () => void
  showInstall: boolean
  onInstall: () => void
  onReorder: (ids: string[]) => boolean
}

export function Wallet({
  cards,
  storageError,
  celebrating,
  onAdd,
  onOpen,
  onSettings,
  onExport,
  showInstall,
  onInstall,
  onReorder,
}: WalletProps) {
  const [query, setQuery] = useState("")
  const reduced = useReducedMotion()
  const visible = cards.filter((card) => card.name.toLowerCase().includes(query.toLowerCase()))
  return (
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
          <button className="primary" onClick={() => onAdd()}>
            <Plus size={18} />
            Add a card
          </button>
        )}
      </div>
      <h1 className="sr-only">Your wallet</h1>
      {showInstall && (
        <button className="home-screen-button" onClick={onInstall}>
          <Smartphone size={20} aria-hidden="true" />
          <span>Add to home screen</span>
          <ChevronRight size={18} aria-hidden="true" />
        </button>
      )}
      {storageError && (
        <div className="error storage-error" role="alert">
          {storageError}
          <button onClick={() => onExport()}>Export original data</button>
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
        <CardGrid
          cards={visible}
          celebrating={celebrating}
          disabled={!!storageError}
          onOpen={onOpen}
          onReorder={onReorder}
        />
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
                <button className="primary" onClick={() => onAdd()}>
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
        <button aria-label="Wallet settings" onClick={() => onSettings()}>
          Backup & settings
        </button>
      </div>
    </main>
  )
}
