import { Navbar } from "@/components/Navbar"
import { CardGrid } from "@/components/CardGrid"
import { CardProvider } from "@/context/CardContext"

export function App() {
  return (
    <CardProvider>
      <div className="h-[100dvh] flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto p-4 overflow-y-auto overscroll-contain">
          <CardGrid />
        </main>
      </div>
    </CardProvider>
  )
}

export default App
