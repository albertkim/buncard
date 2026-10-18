import { useEffect, useState } from "react"
import { toast } from "sonner"

interface InstallEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: string }>
}

export function useInstall() {
  const [install, setInstall] = useState<InstallEvent | null>(null)
  useEffect(() => {
    const capture = (event: Event) => {
      event.preventDefault()
      setInstall(event as InstallEvent)
    }
    window.addEventListener("beforeinstallprompt", capture)
    return () => window.removeEventListener("beforeinstallprompt", capture)
  }, [])

  async function promptInstall() {
    if (!install) return false
    await install.prompt()
    const choice = await install.userChoice
    setInstall(null)
    if (choice.outcome !== "accepted") return false
    toast.success("Installed")
    return true
  }

  return { canPrompt: !!install, promptInstall }
}
