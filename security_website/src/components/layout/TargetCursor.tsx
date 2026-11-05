import { useEffect, useRef } from 'react'

export default function TargetCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)')
    if (!finePointer.matches) return

    document.body.classList.add('has-target-cursor')
    const cursor = cursorRef.current
    if (!cursor) return

    const corners = Array.from(cursor.querySelectorAll<HTMLElement>('.target-cursor-corner'))
    const idlePositions = [
      [-18, -18],
      [6, -18],
      [6, 6],
      [-18, 6],
    ]
    const cornerSize = 12
    let pointerX = window.innerWidth / 2
    let pointerY = window.innerHeight / 2
    let activeTarget: Element | null = null
    let frame = 0

    // Assign idle positions
    corners.forEach((corner, index) => {
      corner.style.transform = `translate3d(${idlePositions[index][0]}px, ${idlePositions[index][1]}px, 0)`
    })

    const targetSelector =
      'a, button, input, textarea, select, [role="button"], .cursor-target, .gallery-item, .card, [data-event-id], .info-panel, .opportunities, .option, .hud-toggle-btn, .year-btn, .level-btn, .gallery-folder-button, .gallery-image-button'

    const moveCursor = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' && event.pointerType !== 'pen') return
      pointerX = event.clientX
      pointerY = event.clientY
      cursor.style.transform = `translate3d(${pointerX}px, ${pointerY}px, 0)`
      if (activeTarget) positionCorners(activeTarget)
    }

    const positionCorners = (target: Element) => {
      const rect = target.getBoundingClientRect()
      const positions = [
        [rect.left - 3, rect.top - 3],
        [rect.right + 3 - cornerSize, rect.top - 3],
        [rect.right + 3 - cornerSize, rect.bottom + 3 - cornerSize],
        [rect.left - 3, rect.bottom + 3 - cornerSize],
      ]
      corners.forEach((corner, index) => {
        corner.style.transform = `translate3d(${positions[index][0] - pointerX}px, ${positions[index][1] - pointerY}px, 0)`
      })
    }

    const returnToIdle = () => {
      if (!activeTarget) return
      activeTarget = null
      cursor.classList.remove('is-targeting')
      corners.forEach((corner, index) => {
        corner.style.transform = `translate3d(${idlePositions[index][0]}px, ${idlePositions[index][1]}px, 0)`
      })
    }

    const findTarget = (node: EventTarget | null): Element | null => {
      if (!(node instanceof Element)) return null
      const galleryItem = node.closest('.gallery-item')
      if (galleryItem) return galleryItem
      return node.closest(targetSelector)
    }

    const onPointerOver = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' && event.pointerType !== 'pen') return
      const target = findTarget(event.target)
      if (!target || target === activeTarget) return
      activeTarget = target
      cursor.classList.add('is-targeting')
      positionCorners(target)
    }

    const onPointerOut = (event: PointerEvent) => {
      if ((event.pointerType !== 'mouse' && event.pointerType !== 'pen') || !activeTarget) return
      const nextTarget = findTarget(event.relatedTarget)
      if (nextTarget === activeTarget) return
      if (nextTarget) {
        activeTarget = nextTarget
        positionCorners(nextTarget)
      } else {
        returnToIdle()
      }
    }

    const syncTarget = () => {
      if (!activeTarget) return
      if (!activeTarget.isConnected) returnToIdle()
      else positionCorners(activeTarget)
    }

    const scheduleSync = () => {
      if (frame) return
      frame = window.requestAnimationFrame(() => {
        frame = 0
        syncTarget()
      })
    }

    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType !== 'touch') cursor.classList.add('is-clicking')
    }
    const onPointerUp = (event: PointerEvent) => {
      if (event.pointerType !== 'touch') cursor.classList.remove('is-clicking')
    }

    window.addEventListener('pointermove', moveCursor, { passive: true })
    document.addEventListener('pointerover', onPointerOver as EventListener)
    document.addEventListener('pointerout', onPointerOut as EventListener)
    window.addEventListener('scroll', scheduleSync, { passive: true })
    window.addEventListener('resize', scheduleSync, { passive: true })
    window.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointerup', onPointerUp)
    window.addEventListener('pointercancel', onPointerUp)

    const handlePointerChange = (e: MediaQueryListEvent) => {
      if (!e.matches) {
        document.body.classList.remove('has-target-cursor')
      } else {
        document.body.classList.add('has-target-cursor')
      }
    }
    finePointer.addEventListener('change', handlePointerChange)

    return () => {
      document.body.classList.remove('has-target-cursor')
      window.removeEventListener('pointermove', moveCursor)
      document.removeEventListener('pointerover', onPointerOver as EventListener)
      document.removeEventListener('pointerout', onPointerOut as EventListener)
      window.removeEventListener('scroll', scheduleSync)
      window.removeEventListener('resize', scheduleSync)
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointerup', onPointerUp)
      window.removeEventListener('pointercancel', onPointerUp)
      finePointer.removeEventListener('change', handlePointerChange)
    }
  }, [])

  return (
    <div ref={cursorRef} className="target-cursor-root" aria-hidden="true">
      <span className="target-cursor-dot" />
      <span className="target-cursor-frame">
        <span className="target-cursor-corner corner-tl" />
        <span className="target-cursor-corner corner-tr" />
        <span className="target-cursor-corner corner-br" />
        <span className="target-cursor-corner corner-bl" />
      </span>
    </div>
  )
}
