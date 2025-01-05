import { Navbar } from "@/components/Navbar"
import { CardGrid } from "@/components/CardGrid"
import { CardProvider } from "@/context/CardContext"

export function App() {
  return (
    <CardProvider>
      <div className="flex h-screen flex-col">
        <Navbar />
        <main className="grow min-h-0 container mx-auto p-4 overflow-auto">
          <CardGrid />
        </main>
      </div>
    </CardProvider>
  )
}

export default App
