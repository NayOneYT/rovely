import { onMounted, onUnmounted, type Ref } from "vue"

export const useParticlesCanvas = (canvasRef: Ref<HTMLCanvasElement | undefined>) => {
  let animationId: number = 0
  let resizeHandler: EventListenerOrEventListenerObject

  const getBrandRgb = (): string => {
    const rootStyle = getComputedStyle(document.documentElement)
    const hex = rootStyle.getPropertyValue('--color-brand')
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `${r}, ${g}, ${b}`
  }

  onMounted(() => {
    const canvas = canvasRef.value
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const brandRgb = getBrandRgb()

    const isPowerfulDevice = window.navigator.hardwareConcurrency > 4
    const LINK_DIST = isPowerfulDevice ? 130 : 100

    const getTargetN = () => {
      const area = currentWidth * currentHeight
      const count = Math.floor(area / 36000)
      return isPowerfulDevice ? count * 2 : count
    }

    const createParticle = () => ({
      x: Math.random() * currentWidth,
      y: Math.random() * currentHeight,
      speedX: Math.random() - 0.5,
      speedY: Math.random() - 0.5,
      r: Math.random() * 2 + 1,
      phase: Math.random() * Math.PI * 2
    })

    let currentWidth = canvas.offsetWidth
    let currentHeight = canvas.offsetHeight
    let currentN = getTargetN()
    let particles = Array.from({ length: currentN }, () => createParticle())

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      const oldWidth = currentWidth
      const oldHeight = currentHeight

      currentWidth = canvas.offsetWidth
      currentHeight = canvas.offsetHeight

      canvas.width = canvas.offsetWidth * dpr
      canvas.height = canvas.offsetHeight * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      particles.forEach(particle => {
        particle.x = particle.x * currentWidth / oldWidth
        particle.y = particle.y * currentHeight / oldHeight
      })

      currentN = getTargetN()

      if (particles.length < currentN) {
        const diff = currentN - particles.length
        for (let i = 0; i < diff; i++) particles.push(createParticle())
      } else {
        particles.splice(currentN)
      }
    }

    resize()
    resizeHandler = resize
    window.addEventListener('resize', resizeHandler)

    const edgeFactor = (particle: { x: number, y: number, r: number }) => {
      const margin = 5 + particle.r
      const left = particle.x / margin
      const right = (currentWidth - particle.x) / margin
      const top = particle.y / margin
      const bottom = (currentHeight - particle.y) / margin
      return Math.max(0, Math.min(1, left, right, top, bottom))
    }

    let lastTime = performance.now()
    const fpsInterval = 1000 / 60

    const draw = () => {
      animationId = requestAnimationFrame(draw)
      const now = performance.now()
      const elapsed = now - lastTime
      if (elapsed < fpsInterval) return
      lastTime = now - (elapsed % fpsInterval)
      ctx.clearRect(0, 0, currentWidth, currentHeight)

      particles.forEach(particle => {
        particle.x += particle.speedX
        particle.y += particle.speedY
        particle.phase += 0.02
        if (particle.x < -particle.r * 5) particle.x = currentWidth + particle.r * 5
        if (particle.x > currentWidth + particle.r * 5) particle.x = -particle.r * 5
        if (particle.y < -particle.r * 5) particle.y = currentHeight + particle.r * 5
        if (particle.y > currentHeight + particle.r * 5) particle.y = -particle.r * 5
      })

      for (let i = 0; i < currentN; i++) {
        for (let j = i + 1; j < currentN; j++) {
          const distanceX = particles[j]!.x - particles[i]!.x
          const distanceY = particles[j]!.y - particles[i]!.y
          const dist = Math.hypot(distanceX, distanceY)
          if (dist < LINK_DIST) {
            const distAlpha = 1 - dist / LINK_DIST
            const edgeA = edgeFactor(particles[i]!)
            const edgeB = edgeFactor(particles[j]!)
            const transperent = distAlpha * edgeA * edgeB
            if (transperent < 0.1) continue
            ctx.beginPath()
            ctx.strokeStyle = `rgba(${brandRgb},${transperent})`
            ctx.lineWidth = transperent * 2.2 + 0.3
            ctx.moveTo(particles[i]!.x, particles[i]!.y)
            ctx.lineTo(particles[j]!.x, particles[j]!.y)
            ctx.stroke()
          }
        }
      }

      particles.forEach(particle => {
        const pulse = (Math.sin(particle.phase) + 1) / 2
        const radius = particle.r + pulse
        const glow = ctx.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, radius * 5)
        glow.addColorStop(0, `rgba(${brandRgb},${0.18 + pulse * 0.2})`)
        glow.addColorStop(1, `rgba(${brandRgb},0)`)
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, radius * 5, 0, Math.PI * 2)
        ctx.fillStyle = glow
        ctx.fill()
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${brandRgb},${0.65 + pulse * 0.35})`
        ctx.fill()
      })
    }
    draw()
  })

  onUnmounted(() => {
    cancelAnimationFrame(animationId)
    window.removeEventListener('resize', resizeHandler)
  })
}