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
  <MinimalLayout class="flex-col gap-6 xl:flex-row">
    <canvas ref="canvasRef" class="absolute size-full -z-1 opacity-50" />
    <AuthWidget class="
      max-w-118 sm:max-w-130 xl:order-1
      xl:[@media(max-height:633px)]:[zoom:0.85]
      xl:[@media(min-height:634px)]:[zoom:0.9]
      xl:[@media(min-height:668px)]:[zoom:0.95]
      xl:[@media(min-height:702px)]:[zoom:1]
    " />
    <div class="
      flex flex-col items-center max-w-170
      xl:[@media(max-height:633px)]:[zoom:0.85]
      xl:[@media(min-height:634px)]:[zoom:0.9]
      xl:[@media(min-height:668px)]:[zoom:0.95]
      xl:[@media(min-height:702px)]:[zoom:1]
    ">
      <AppLogo class="text-7xl" />
      <h1 class="mt-4 text-center text-lg">
        Пространство для общения, контента и взаимодействий, собранное так, чтобы привычные форматы работали 
        <span class="font-semibold">проще</span>, 
        <span class="font-semibold">быстрее</span> и 
        <span class="font-semibold">естественнее</span>
      </h1>
      <div class="grid gap-4 mt-4">
        <div
          v-for="feature in WELCOME_FEATURES"
          :key="feature.title"
          class="px-4 sm:px-10 py-2.75 sm:py-7.5 bg-card/60 border border-border/60 rounded-[13.5px] 
          sm:rounded-[35px] backdrop-blur-xs hover:bg-card hover:border-border transition-all duration-200"
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
  </MinimalLayout>
</template>