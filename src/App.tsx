import { Navbar } from "@/components/Navbar"
import { CardGrid } from "@/components/CardGrid"
import { CardProvider } from "@/context/CardContext"

export function App() {
  return (
    <CardProvider>
      <div className="flex h-[100dvh] flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 container mx-auto p-4 overflow-y-auto">
          <CardGrid />
        </main>
      </div>
    </CardProvider>
  )
}

export default App
