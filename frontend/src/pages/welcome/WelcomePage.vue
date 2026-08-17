<script setup lang="ts">
import { ref } from "vue"
import { useParticlesCanvas } from './useParticlesCanvas';
import { AppLogo } from '@/shared/components/ui'
import { WELCOME_FEATURES } from './welcome.constants'
import AuthWidget from '@/features/auth/components/AuthWidget.vue'
import MinimalLayout from "@/shared/layouts/MinimalLayout.vue";

const canvasRef = ref<HTMLCanvasElement>()
useParticlesCanvas(canvasRef)
</script>

<template>
  <MinimalLayout>
    <canvas ref="canvasRef" class="absolute size-full opacity-50" />
    <section class="relative flex justify-center items-center gap-10">
      <div class="flex flex-col items-center w-185">
        <AppLogo class="text-7xl" />
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
            class="p-4 bg-card/60 border border-border/60 rounded-2xl backdrop-blur-xs
            hover:bg-card hover:border-border transition-all duration-200"
          >
            <h2 class="text-xl font-semibold">
              {{ feature.title }}
            </h2>
            <p class="text-hint mt-1">
              {{ feature.description }}
            </p>
          </div>
        </div>
      </div>
      <div class="w-130">
        <AuthWidget />
      </div>
    </section>
  </MinimalLayout>
</template>