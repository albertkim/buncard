import { registerSW } from "virtual:pwa-register"
import { toast } from "sonner"

registerSW({
  immediate: true,
  onNeedReload() {
    toast("A new Buncard is ready", {
      id: "app-update",
      duration: Infinity,
      action: { label: "Refresh", onClick: () => window.location.reload() },
    })
  },
  onRegisteredSW(_url, registration) {
    if (!registration) return
    const check = () => {
      if (navigator.onLine && document.visibilityState === "visible") {
        void registration.update().catch(() => {
          /* Keep the offline wallet available. */
        })
      }
    }
    document.addEventListener("visibilitychange", check)
    window.addEventListener("online", check)
    window.setInterval(check, 60 * 60 * 1000)
  },
})
