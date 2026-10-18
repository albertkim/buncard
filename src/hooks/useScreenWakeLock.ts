import { useEffect } from "react"

export function useScreenWakeLock(active: boolean) {
  useEffect(() => {
    if (!active) return
    let lock: WakeLockSentinel | undefined
    let cancelled = false
    const acquire = async () => {
      try {
        const next = await navigator.wakeLock?.request("screen")
        if (cancelled) await next?.release()
        else lock = next
      } catch {
        // Unsupported or power-saving mode: the card still works.
      }
    }
    const visible = () => {
      if (document.visibilityState === "visible") void acquire()
    }
    void acquire()
    document.addEventListener("visibilitychange", visible)
    return () => {
      cancelled = true
      void lock?.release()
      document.removeEventListener("visibilitychange", visible)
    }
  }, [active])
}
