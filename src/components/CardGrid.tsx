import { AddCardButton } from "@/components/AddCardButton"
import { Card } from "@/components/Card"
import { useCardContext } from "@/context/CardContext"
import { SwipeablePages } from "@/components/ui/swipablePages"

export function CardGrid() {
  const { cards } = useCardContext()
  const ITEMS_PER_PAGE = 6

  const getPages = () => {
    type GridItem = { type: "card"; card: (typeof cards)[0] } | { type: "add" }

    const itemsToRender: GridItem[] = [
      ...cards.map((card) => ({ type: "card" as const, card })),
      { type: "add" as const },
    ]

    const pagesNeeded = Math.ceil(itemsToRender.length / ITEMS_PER_PAGE)
    const totalPages = Math.max(2, pagesNeeded)

    return Array.from({ length: totalPages }, (_, pageIndex) => {
      const startIndex = pageIndex * ITEMS_PER_PAGE
      const pageItems = itemsToRender.slice(
        startIndex,
        startIndex + ITEMS_PER_PAGE
      )

      return (
        <div key={`page-${pageIndex}`} className="grid grid-cols-2 gap-4">
          {pageItems.map((item) =>
            item.type === "card" ? (
              <Card key={item.card.id} card={item.card} />
            ) : (
              <AddCardButton key="add-button" />
            )
          )}
        </div>
      )
    })
  }

  return <SwipeablePages pages={getPages()} />
}
