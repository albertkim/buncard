import React, { useState, useRef, useEffect } from "react"

interface SwipeablePagesProps {
  pages: React.ReactNode[]
}

export const SwipeablePages: React.FC<SwipeablePagesProps> = ({ pages }) => {
  const [currentPage, setCurrentPage] = useState(0)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
  const [velocity, setVelocity] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const animationFrameRef = useRef<number | null>(null)
  const lastMouseX = useRef<number | null>(null)
  const lastMouseTime = useRef<number | null>(null)

  const minSwipeDistance = 50
  const minSwipeVelocity = 0.5

  const calculateVelocity = (currentX: number, currentTime: number): number => {
    if (lastMouseX.current === null || lastMouseTime.current === null) {
      lastMouseX.current = currentX
      lastMouseTime.current = currentTime
      return 0
    }

    const deltaX = currentX - lastMouseX.current
    const deltaTime = (currentTime - lastMouseTime.current) / 1000
    const newVelocity = deltaTime > 0 ? deltaX / deltaTime : 0

    if (isDragging) {
      lastMouseX.current = currentX
      lastMouseTime.current = currentTime
    }

    return newVelocity
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX)
    setTouchEnd(e.touches[0].clientX)
    setIsDragging(true)
    setVelocity(0)
    lastMouseX.current = e.touches[0].clientX
    lastMouseTime.current = Date.now()
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !touchStart) return
    const currentX = e.touches[0].clientX
    const currentTime = Date.now()

    const offset = currentX - touchStart
    const maxOffset = window.innerWidth * 0.5
    const boundedOffset = Math.max(-maxOffset, Math.min(maxOffset, offset))

    setTouchEnd(currentX)
    setDragOffset(boundedOffset)
    setVelocity(calculateVelocity(currentX, currentTime))
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return

    const distance = touchEnd - touchStart
    const currentVelocity = velocity
    const shouldSwipeLeft =
      (distance < -minSwipeDistance || currentVelocity < -minSwipeVelocity) &&
      currentPage < pages.length - 1
    const shouldSwipeRight =
      (distance > minSwipeDistance || currentVelocity > minSwipeVelocity) &&
      currentPage > 0

    if (shouldSwipeLeft) {
      setCurrentPage(currentPage + 1)
    } else if (shouldSwipeRight) {
      setCurrentPage(currentPage - 1)
    }

    setTouchStart(null)
    setTouchEnd(null)
    setIsDragging(false)
    setDragOffset(0)
    setVelocity(0)
    lastMouseX.current = null
    lastMouseTime.current = null
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setTouchStart(e.clientX)
    setTouchEnd(e.clientX)
    setIsDragging(true)
    setVelocity(0)
    lastMouseX.current = e.clientX
    lastMouseTime.current = Date.now()
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !touchStart) return
    const currentX = e.clientX
    const currentTime = Date.now()

    const offset = currentX - touchStart
    const maxOffset = window.innerWidth * 0.5
    const boundedOffset = Math.max(-maxOffset, Math.min(maxOffset, offset))

    setTouchEnd(currentX)
    setDragOffset(boundedOffset)
    setVelocity(calculateVelocity(currentX, currentTime))
  }

  const handleMouseUp = handleTouchEnd
  const handleMouseLeave = handleTouchEnd

  useEffect(() => {
    const currentAnimationFrame = animationFrameRef.current
    return () => {
      if (currentAnimationFrame) {
        cancelAnimationFrame(currentAnimationFrame)
      }
    }
  }, [])

  const getTransform = () => {
    const baseTransform = -currentPage * 100
    return `translateX(calc(${baseTransform}% + ${dragOffset}px))`
  }

  return (
    <div className="w-full h-full overflow-hidden select-none relative">
      <div
        ref={containerRef}
        className={`w-full h-full flex gap-4 transform ${
          isDragging
            ? "transition-none"
            : "transition-transform duration-300 ease-out"
        }`}
        style={{
          transform: getTransform(),
          touchAction: "pan-y pinch-zoom",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        {pages.map((content, index) => (
          <div key={index} className="w-full h-full flex-shrink-0">
            {content}
          </div>
        ))}
      </div>
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
        {pages.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-colors ${
              currentPage === index ? "bg-black/50" : "bg-black/20"
            }`}
          />
        ))}
      </div>
    </div>
  )
}
