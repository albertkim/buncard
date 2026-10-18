import { useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { ChevronRight, Plus, ScanLine, Search, Sparkles, X } from "lucide-react"
import type { Card } from "../../domain/cards"

interface WalletProps {
  cards: Card[]
  storageError: string | null
  celebrating: string | null
  onAdd: () => void
  onOpen: (id: string) => void
  onSettings: () => void
  onExport: () => void
}

export function Wallet({ cards, storageError, celebrating, onAdd, onOpen, onSettings, onExport }: WalletProps) {
  const [query, setQuery] = useState("")
  const reduced = useReducedMotion()
  const visible = cards
    .filter((card) => card.name.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => b.createdAt - a.createdAt)
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
                    onOpen(card.id)
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
