import { forwardRef, useCallback } from "react"
import { motion, useReducedMotion } from "motion/react"
import type { HTMLMotionProps } from "motion/react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { ChevronRight, ScanLine, Sparkles } from "lucide-react"
import type { Card } from "../../domain/cards"

interface CardFaceProps extends HTMLMotionProps<"button"> {
  card: Card
  lifted?: boolean
  sorting?: boolean
}

export const CardFace = forwardRef<HTMLButtonElement, CardFaceProps>(function CardFace(
  { card, lifted = false, sorting = false, ...props },
  ref
) {
  const reduced = useReducedMotion()
  return (
    <motion.button
      ref={ref}
      className={`wallet-card${lifted ? " card-lifted" : ""}`}
      data-pattern={Array.from(card.name).reduce((sum, char) => sum + char.charCodeAt(0), 0) % 4}
      style={{ background: card.backgroundColor }}
      whileHover={reduced || sorting ? undefined : { y: -6, rotate: -1.2 }}
      whileTap={reduced || sorting ? undefined : { scale: 0.95, rotate: 0.6 }}
      transition={{ type: "spring", stiffness: 420, damping: 23 }}
      aria-label={`Open ${card.name}`}
      onContextMenu={(event) => event.preventDefault()}
      {...props}
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
  )
})

interface WalletCardProps {
  card: Card
  index: number
  celebrating: boolean
  sorting: boolean
  disabled: boolean
  onOpen: () => void
}

export const WalletCard = forwardRef<HTMLDivElement, WalletCardProps>(function WalletCard(
  { card, index, celebrating, sorting, disabled, onOpen },
  forwardedRef
) {
  const reduced = useReducedMotion()
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
    disabled,
    transition: reduced ? null : { duration: 220, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" },
  })
  const ref = useCallback(
    (node: HTMLDivElement | null) => {
      setNodeRef(node)
      if (typeof forwardedRef === "function") forwardedRef(node)
      else if (forwardedRef) forwardedRef.current = node
    },
    [forwardedRef, setNodeRef]
  )

  return (
    <div
      ref={ref}
      className="wallet-card-wrap"
      data-card-id={card.id}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.2 : 1 }}
    >
      <motion.div
        initial={{ opacity: 0, y: reduced ? 0 : 24, scale: reduced ? 1 : 0.93 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: reduced ? 0 : 8, scale: reduced ? 1 : 0.86 }}
        transition={{ type: "spring", stiffness: 330, damping: 28, delay: Math.min(index * 0.035, 0.2) }}
      >
        {celebrating && !reduced && (
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
        <CardFace
          ref={setActivatorNodeRef}
          card={card}
          sorting={sorting}
          {...attributes}
          {...listeners}
          aria-disabled={undefined}
          aria-roledescription={disabled ? undefined : attributes["aria-roledescription"]}
          aria-describedby={disabled ? undefined : attributes["aria-describedby"]}
          onClick={onOpen}
        />
      </motion.div>
    </div>
  )
})
