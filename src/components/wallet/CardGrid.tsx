import { useRef, useState } from "react"
import { createPortal } from "react-dom"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  defaultDropAnimationSideEffects,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import { arrayMove, rectSortingStrategy, SortableContext, sortableKeyboardCoordinates } from "@dnd-kit/sortable"
import type { Card } from "../../domain/cards"
import { CardFace, WalletCard } from "./WalletCard"

interface CardGridProps {
  cards: Card[]
  celebrating: string | null
  disabled: boolean
  onOpen: (id: string) => void
  onReorder: (ids: string[]) => boolean
}

export function CardGrid({ cards, celebrating, disabled, onOpen, onReorder }: CardGridProps) {
  const reduced = useReducedMotion()
  const [activeId, setActiveId] = useState<string | null>(null)
  const suppressClickUntil = useRef(0)
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { delay: 250, tolerance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 300, tolerance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
      keyboardCodes: { start: ["Space"], cancel: ["Escape"], end: ["Space", "Tab"] },
    })
  )
  const ids = cards.map((card) => card.id)
  const activeCard = cards.find((card) => card.id === activeId)
  const prepareInteraction = () => {
    if (!activeId) suppressClickUntil.current = 0
  }
  const finish = () => {
    suppressClickUntil.current = performance.now() + 350
    setActiveId(null)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      accessibility={{
        screenReaderInstructions: {
          draggable:
            "Press Space to pick up a card, use the arrow keys to move it, then Space to drop. Escape cancels. Enter opens the card.",
        },
      }}
      onDragStart={({ active }) => {
        suppressClickUntil.current = Infinity
        setActiveId(String(active.id))
      }}
      onDragCancel={finish}
      onDragEnd={({ active, over }) => {
        if (over && active.id !== over.id) {
          onReorder(arrayMove(ids, ids.indexOf(String(active.id)), ids.indexOf(String(over.id))))
        }
        finish()
      }}
    >
      <SortableContext items={ids} strategy={rectSortingStrategy}>
        <motion.div
          className="card-grid"
          layout
          onPointerDownCapture={prepareInteraction}
          onKeyDownCapture={prepareInteraction}
        >
          <AnimatePresence mode="popLayout">
            {cards.map((card, index) => (
              <WalletCard
                key={card.id}
                card={card}
                index={index}
                celebrating={celebrating === card.id}
                sorting={!!activeId}
                disabled={disabled || cards.length < 2}
                onOpen={() => {
                  if (performance.now() >= suppressClickUntil.current) onOpen(card.id)
                }}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      </SortableContext>
      {createPortal(
        <DragOverlay
          zIndex={30}
          dropAnimation={
            reduced
              ? null
              : {
                  duration: 220,
                  easing: "cubic-bezier(0.2, 0.8, 0.2, 1)",
                  sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: "0" } } }),
                }
          }
        >
          {activeCard && (
            <div className="card-drag-overlay" aria-hidden="true">
              <CardFace card={activeCard} lifted sorting tabIndex={-1} />
            </div>
          )}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  )
}
