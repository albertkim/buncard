import { About } from "./About"
import { Export } from "./Export"
import { Import } from "./Import"
import { useCardContext } from "@/context/CardContext"
export function Navbar() {
  const { cards } = useCardContext()

  return (
    <nav className="sticky top-0 border-b bg-background">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <h1 className="text-xl font-bold">Buncard</h1>
        <div className="flex gap-2">
          <About />
          <Import />
          <Export cards={cards} />
        </div>
      </div>
    </nav>
  )
}
