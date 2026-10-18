import { useEffect, useRef, useState } from "react"
import { animate, useMotionValue } from "motion/react"

/** Touch arbitration stays outside React's render loop; only transform changes per frame. */
export function useSheetDrag(present: boolean, reduced: boolean | null, onClose: () => void) {
  const [sheet, setSheet] = useState<HTMLDivElement | null>(null)
  const y = useMotionValue(reduced ? 0 : 56)
  const dismissed = useRef(false)
  const suppressClickUntil = useRef(0)

  useEffect(() => {
    const animation = animate(y, present ? 0 : dismissed.current ? window.innerHeight : reduced ? 0 : 28, {
      type: "spring",
      stiffness: 420,
      damping: 36,
      ...(reduced ? { type: "tween", duration: 0.12 } : {}),
    })
    return () => animation.stop()
  }, [present, reduced, y])

  useEffect(() => {
    if (!sheet || !present) return
    let gesture: {
      x: number
      y: number
      lastY: number
      time: number
      velocity: number
      dragging: boolean
      horizontal: boolean
    } | null = null
    const springBack = () =>
      animate(y, 0, reduced ? { duration: 0.12 } : { type: "spring", stiffness: 460, damping: 34 })
    const start = (x: number, clientY: number, target: EventTarget | null) => {
      suppressClickUntil.current = 0
      // Preserve text editing, native selection menus, and select pickers.
      if (target instanceof Element && target.closest('input, textarea, select, [contenteditable="true"]')) return
      gesture = {
        x,
        y: clientY,
        lastY: clientY,
        time: performance.now(),
        velocity: 0,
        dragging: false,
        horizontal: false,
      }
    }
    const move = (x: number, clientY: number, event: Event) => {
      if (!gesture || gesture.horizontal) return
      const dx = x - gesture.x
      const dy = clientY - gesture.y
      if (!gesture.dragging) {
        if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) {
          gesture.horizontal = true
          return
        }
        // Let the browser scroll normally until the content reaches the top.
        if (sheet.scrollTop > 0 || dy <= 0) {
          gesture.y = clientY
          gesture.lastY = clientY
          gesture.time = performance.now()
          return
        }
        if (dy < 8) return
        if (!event.cancelable) {
          gesture = null
          return
        }
        gesture.dragging = true
        y.stop()
        sheet.dataset.dragging = "true"
      }
      event.preventDefault()
      const now = performance.now()
      const elapsed = now - gesture.time
      if (elapsed > 0) gesture.velocity = ((clientY - gesture.lastY) / elapsed) * 1000
      gesture.lastY = clientY
      gesture.time = now
      y.set(Math.max(0, clientY - gesture.y))
    }
    const end = (cancelled = false) => {
      if (!gesture) return
      const { dragging, velocity, time } = gesture
      gesture = null
      delete sheet.dataset.dragging
      if (!dragging) return
      suppressClickUntil.current = performance.now() + 350
      const distance = y.get()
      const threshold = Math.min(140, Math.max(80, sheet.clientHeight * 0.22))
      if (!cancelled && (distance > threshold || (distance > 24 && performance.now() - time < 100 && velocity > 700))) {
        dismissed.current = true
        onClose()
      } else springBack()
    }
    const touchStart = (event: TouchEvent) => {
      if (event.touches.length !== 1) {
        end(true)
        return
      }
      start(event.touches[0].clientX, event.touches[0].clientY, event.target)
    }
    const touchMove = (event: TouchEvent) => {
      if (event.touches.length !== 1) {
        end(true)
        return
      }
      move(event.touches[0].clientX, event.touches[0].clientY, event)
    }
    const touchEnd = () => end()
    const cancel = () => end(true)
    const pointerDown = (event: PointerEvent) => {
      if (event.pointerType === "mouse" && event.button === 0) start(event.clientX, event.clientY, event.target)
    }
    const pointerMove = (event: PointerEvent) => {
      if (event.pointerType === "mouse") move(event.clientX, event.clientY, event)
    }
    const pointerUp = (event: PointerEvent) => {
      if (event.pointerType === "mouse") end()
    }
    sheet.addEventListener("touchstart", touchStart, { passive: true })
    sheet.addEventListener("touchmove", touchMove, { passive: false })
    sheet.addEventListener("touchend", touchEnd)
    sheet.addEventListener("touchcancel", cancel)
    sheet.addEventListener("pointerdown", pointerDown)
    document.addEventListener("pointermove", pointerMove, { passive: false })
    document.addEventListener("pointerup", pointerUp)
    document.addEventListener("pointercancel", cancel)
    return () => {
      sheet.removeEventListener("touchstart", touchStart)
      sheet.removeEventListener("touchmove", touchMove)
      sheet.removeEventListener("touchend", touchEnd)
      sheet.removeEventListener("touchcancel", cancel)
      sheet.removeEventListener("pointerdown", pointerDown)
      document.removeEventListener("pointermove", pointerMove)
      document.removeEventListener("pointerup", pointerUp)
      document.removeEventListener("pointercancel", cancel)
      delete sheet.dataset.dragging
    }
  }, [onClose, present, reduced, sheet, y])

  // Keep the click guard through the exit transition, after gesture listeners detach.
  useEffect(() => {
    if (!sheet) return
    const click = (event: MouseEvent) => {
      if (performance.now() < suppressClickUntil.current) {
        event.preventDefault()
        event.stopPropagation()
      }
    }
    sheet.addEventListener("click", click, true)
    return () => sheet.removeEventListener("click", click, true)
  }, [sheet])

  return { ref: setSheet, y }
}
