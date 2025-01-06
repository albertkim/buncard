import { AddCardButton } from "@/components/AddCardButton"
import { Card } from "@/components/Card"
import { useCardContext } from "@/context/CardContext"
import { SwipeablePages } from "@/components/ui/swipablePages"

export function CardGrid() {
  const { cards } = useCardContext()
  const ITEMS_PER_PAGE = 6

  const getPages = () => {
    // Always have minimum 2 pages, and add extra page if last page is full
    const pagesNeeded = Math.ceil(cards.length / ITEMS_PER_PAGE)
    const totalPages = Math.max(
      2,
      cards.length % ITEMS_PER_PAGE === 0 ? pagesNeeded + 1 : pagesNeeded
    )

    return Array.from({ length: totalPages }, (_, pageIndex) => {
      const startIndex = pageIndex * ITEMS_PER_PAGE
      const pageCards = cards.slice(startIndex, startIndex + ITEMS_PER_PAGE)
      const hasSpace = pageCards.length < ITEMS_PER_PAGE

      return (
        <div key={`page-${pageIndex}`} className="grid grid-cols-2 gap-4">
          {pageCards.map((card) => (
            <Card key={card.id} card={card} />
          ))}
          {hasSpace && <AddCardButton key="add-button" />}
        </div>
      )
    })
  }

  return <SwipeablePages pages={getPages()} />
}
