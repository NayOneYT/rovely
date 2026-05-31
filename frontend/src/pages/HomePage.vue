<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import SiteLogo from '@/components/SiteLogo.vue'
import AuthForm from '@/features/auth/components/AuthForm.vue'

const features = [
  {
    title: 'Общение',
    text: 'Переписки, реакции и обсуждения без лишнего шума и алгоритмического мусора.'
  },
  {
    title: 'Свобода',
    text: 'Публикуй мысли, фото, идеи и собирай свою аудиторию.'
  },
  {
    title: 'Потоки',
    text: 'Создавай сообщества вокруг идей, интересов и людей.'
  }
]

const canvasRef = ref(null)
let animationId = null
let resizeHandler = null

onMounted(() => {
  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')

  const resize = () => {
    const dpr = window.devicePixelRatio || 1
    canvas.width = canvas.offsetWidth * dpr
    canvas.height = canvas.offsetHeight * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }
  resize()
  resizeHandler = resize
  window.addEventListener('resize', resizeHandler)

  const edgeFactor = (particle) => {
    const margin = 5 + particle.r
    const left = particle.x / margin
    const right = (canvas.offsetWidth - particle.x) / margin
    const top = particle.y / margin
    const bottom = (canvas.offsetHeight - particle.y) / margin
    return Math.max(0, Math.min(1, left, right, top, bottom))
  }

  const isPowerfulDevice = window.navigator.hardwareConcurrency > 4
  const N = isPowerfulDevice ? 120 : 60
  const LINK_DIST = isPowerfulDevice ? 130 : 100

  const particles = Array.from({ length: N }, () => ({
    x: Math.random() * canvas.offsetWidth,
    y: Math.random() * canvas.offsetHeight,
    speedX: (Math.random() - 0.5) * 0.35,
    speedY: (Math.random() - 0.5) * 0.35,
    r: Math.random() * 2 + 1,
    phase: Math.random() * Math.PI * 2
  }))

  const draw = () => {
    ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)
    
    particles.forEach(particle => {
      particle.x += particle.speedX
      particle.y += particle.speedY
      particle.phase += 0.02
      if (particle.x < -particle.r * 5) particle.x = canvas.offsetWidth + particle.r * 5
      if (particle.x > canvas.offsetWidth + particle.r * 5) particle.x = -particle.r * 5
      if (particle.y < -particle.r * 5) particle.y = canvas.offsetHeight + particle.r * 5
      if (particle.y > canvas.offsetHeight + particle.r * 5) particle.y = -particle.r * 5
    })

    for (let i = 0; i < N; i++) {
      for (let j = i + 1; j < N; j++) {
        const distanceX = particles[j].x - particles[i].x
        const distanceY = particles[j].y - particles[i].y
        const dist = Math.hypot(distanceX, distanceY)
        if (dist < LINK_DIST) {
          const distAlpha = 1 - dist / LINK_DIST
          const edgeA = edgeFactor(particles[i])
          const edgeB = edgeFactor(particles[j])
          const transperent = distAlpha * edgeA * edgeB
          if (transperent < 0.1) continue
          ctx.beginPath()
          ctx.strokeStyle = `rgba(19,211,115,${transperent})`
          ctx.lineWidth = transperent * 2.2 + 0.3
          ctx.moveTo(particles[i].x, particles[i].y)
          ctx.lineTo(particles[j].x, particles[j].y)
          ctx.stroke()
        }
      }
    }

    particles.forEach(particle => {
      const pulse = (Math.sin(particle.phase) + 1) / 2
      const radius = particle.r + pulse
      const glow = ctx.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, radius * 5)
      glow.addColorStop(0, `rgba(19,211,115,${0.18 + pulse * 0.2})`)
      glow.addColorStop(1, 'rgba(19,211,115,0)')
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, radius * 5, 0, Math.PI * 2)
      ctx.fillStyle = glow
      ctx.fill()
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, radius, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(19,211,115,${0.65 + pulse * 0.35})`
      ctx.fill()
    })
    animationId = requestAnimationFrame(draw)
  }
  draw()
})

onUnmounted(() => {
  cancelAnimationFrame(animationId)
  window.removeEventListener('resize', resizeHandler)
})
</script>

<template>
  <main class="relative h-screen overflow-hidden bg-[#060e0b] text-white">
    <canvas ref="canvasRef" class="absolute opacity-50 h-full w-full" />
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_50%,rgb(0,0,0)_100%)]" />
    <section class="relative flex h-full items-center justify-between px-16">
      <div class="flex flex-col items-center w-185 cursor-default">
        <SiteLogo class="text-7xl" />
        <p class="mt-8 text-center text-xl">
          Пространство для общения, контента и взаимодействий, собранное так, чтобы привычные форматы работали 
          <span class="text-[#00ff8c] font-semibold">проще</span>, 
          <span class="text-[#00ff8c] font-semibold">быстрее</span> и 
          <span class="text-[#00ff8c] font-semibold">естественнее</span>.
        </p>
        <div class="mt-8 grid gap-4">
          <div
            v-for="feature in features"
            :key="feature.title"
            class="group rounded-2xl border border-[#1c2e28] bg-[#111b18]/50 p-4 backdrop-blur-xs transition-all"
          >
            <div class="flex gap-4">
              <div class="mt-2 h-2.5 w-2.5 rounded-full bg-[#00ff8c]/60 group-hover:bg-[#00ff8c] group-hover:shadow-[0_0_10px_#00ff8c] transition-all" />
              <div>
                <p class="text-lg font-semibold">
                  {{ feature.title }}
                </p>
                <p class="text-white/60">
                  {{ feature.text }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="w-130">
        <AuthForm />
      </div>
    </section>
  </main>
</template>