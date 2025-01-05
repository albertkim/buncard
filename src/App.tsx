import { Navbar } from "@/components/Navbar"
import { CardGrid } from "@/components/CardGrid"

export function App() {
  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Navbar />
      <main className="flex-1 container mx-auto p-4 overflow-auto">
        <CardGrid />
      </main>
    </div>
  )
}
