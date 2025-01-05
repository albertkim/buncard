import { Button } from "@/components/ui/button"

export function Navbar() {
  return (
    <nav className="sticky top-0 border-b bg-background">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <h1 className="text-xl font-bold">Buncard</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            Import
          </Button>
          <Button variant="outline" size="sm">
            Export
          </Button>
        </div>
      </div>
    </nav>
  )
}
