import { useEffect, useRef } from 'react'

interface MatrixCanvasProps {
  active: boolean
}

export default function MatrixCanvas({ active }: MatrixCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext('2d')
    if (!context) return

    const characters = '0101010123456789ABCDEF$#*+-<>/'
    const isMobile = window.innerWidth < 768
    const fontSize = isMobile ? 15 : 14
    let width = 0
    let height = 0
    let drops: number[] = []
    let animationFrame = 0
    let animationTimer: number | null = null

    function resize() {
      if (!canvas || !context) return
      const newWidth = window.innerWidth
      const newHeight = window.innerHeight
      if (newWidth === width && Math.abs(newHeight - height) < 120) return
      const pixelRatio = newWidth < 768 ? 1.0 : Math.min(window.devicePixelRatio || 1, 1.25)
      width = newWidth
      height = newHeight
      canvas.width = Math.round(width * pixelRatio)
      canvas.height = Math.round(height * pixelRatio)
      canvas.style.width = '100%'
      canvas.style.height = '100%'
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
      drops = new Array(Math.floor(width / fontSize)).fill(1)
    }

    resize()
    window.addEventListener('resize', resize)

    function draw() {
      animationFrame = 0
      if (!context || document.hidden || !active) return

      context.fillStyle = 'rgba(11, 15, 18, 0.16)'
      context.fillRect(0, 0, width, height)
      context.font = `${fontSize}px 'JetBrains Mono', monospace`

      drops.forEach((drop, index) => {
        const char = characters.charAt(Math.floor(Math.random() * characters.length))
        const x = index * fontSize
        const y = drop * fontSize

        // Lead character glows in luminous mint-white
        context.fillStyle = '#E8FAF4'
        context.fillText(char, x, y)

        // Previous character in refined emerald matrix green
        if (drop > 1) {
          const prevChar = characters.charAt(Math.floor(Math.random() * characters.length))
          context.fillStyle = '#00C982'
          context.fillText(prevChar, x, (drop - 1) * fontSize)
        }

        if (y > height && Math.random() > 0.985) drops[index] = 0
        drops[index] += 1
      })

      animationTimer = window.setTimeout(() => {
        animationTimer = null
        animationFrame = window.requestAnimationFrame(draw)
      }, 80)
    }

    if (active) {
      animationFrame = window.requestAnimationFrame(draw)
    } else {
      context.clearRect(0, 0, width, height)
    }

    return () => {
      if (animationTimer) window.clearTimeout(animationTimer)
      if (animationFrame) window.cancelAnimationFrame(animationFrame)
      window.removeEventListener('resize', resize)
    }
  }, [active])

  return <canvas id="matrix-background" ref={canvasRef} aria-hidden="true" />
}
