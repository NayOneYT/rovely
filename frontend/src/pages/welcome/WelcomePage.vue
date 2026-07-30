<script setup lang="ts">
import { ref } from "vue"
import { useParticlesCanvas } from './useParticlesCanvas';
import { SiteLogo } from '@/shared/components/ui'
import { WELCOME_FEATURES } from './constants'
import AuthWidget from '@/features/auth/components/AuthWidget.vue'

const canvasRef = ref<HTMLCanvasElement>()
useParticlesCanvas(canvasRef)
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
          <span class="text-[#00ff8c] font-semibold">естественнее</span>
        </p>
        <div class="mt-8 grid gap-4">
          <div
            v-for="feature in WELCOME_FEATURES"
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
                  {{ feature.description }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="w-130">
        <AuthWidget />
      </div>
    </section>
  </main>
</template>