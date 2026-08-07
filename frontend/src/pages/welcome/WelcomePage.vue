<script setup lang="ts">
import { ref } from "vue"
import { useParticlesCanvas } from './useParticlesCanvas';
import { SiteLogo } from '@/shared/components/ui'
import { WELCOME_FEATURES } from './constants'
import AuthWidget from '@/features/auth/components/AuthWidget.vue'
import MinimalLayout from "@/shared/layouts/MinimalLayout.vue";

const canvasRef = ref<HTMLCanvasElement>()
useParticlesCanvas(canvasRef)
</script>

<template>
  <MinimalLayout>
    <canvas ref="canvasRef" class="absolute size-full opacity-50" />
    <section class="h-full relative flex justify-between items-center gap-10">
      <div class="flex flex-col items-center w-185 cursor-default">
        <SiteLogo class="text-7xl" />
        <h1 class="my-8 text-center text-lg">
          Пространство для общения, контента и взаимодействий, собранное так, чтобы привычные форматы работали 
          <span class="font-semibold">проще</span>, 
          <span class="font-semibold">быстрее</span> и 
          <span class="font-semibold">естественнее</span>
        </h1>
        <div class="grid gap-4">
          <div
            v-for="feature in WELCOME_FEATURES"
            :key="feature.title"
            class="p-4 bg-[#101312]/60 border border-[#222a27] rounded-[12px] backdrop-blur-xs hover:bg-[#101312] transition-all duration-200"
          >
            <div class="flex gap-4">
              <div>
                <h2 class="text-xl font-semibold">
                  {{ feature.title }}
                </h2>
                <p class="text-sm text-white/60 mt-1">
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
  </MinimalLayout>
</template>