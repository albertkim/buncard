import { useEffect, useState } from "react"
import { toast } from "sonner"

interface InstallEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: string }>
}

export function useInstall() {
  const [install, setInstall] = useState<InstallEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(
    () =>
      window.matchMedia("(display-mode: standalone)").matches ||
      !!(navigator as Navigator & { standalone?: boolean }).standalone
  )
  useEffect(() => {
    const capture = (event: Event) => {
      event.preventDefault()
      setInstall(event as InstallEvent)
    }
    const displayMode = window.matchMedia("(display-mode: standalone)")
    const installed = () => {
      setIsInstalled(true)
      setInstall(null)
    }
    const changed = () =>
      setIsInstalled(displayMode.matches || !!(navigator as Navigator & { standalone?: boolean }).standalone)
    window.addEventListener("beforeinstallprompt", capture)
    window.addEventListener("appinstalled", installed)
    displayMode.addEventListener("change", changed)
    return () => {
      window.removeEventListener("beforeinstallprompt", capture)
      window.removeEventListener("appinstalled", installed)
      displayMode.removeEventListener("change", changed)
    }
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

  return { canPrompt: !!install, isInstalled, promptInstall }
}
