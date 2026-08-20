<script setup lang="ts">
import MinimalLayout from "@/shared/layouts/MinimalLayout.vue"
import { AppLogo } from "@/shared/components/ui"
import { AppButton } from "@/shared/components/ui"

</script>

<template>
  <MinimalLayout class="h-screen">
    <AppLogo class="w-full text-5xl flex justify-center -mt-2" />
    <div class="
      flex flex-col justify-center items-center mt-4 p-4 sm:p-10 bg-card border border-border
      rounded-[40px] sm:rounded-[64px]
    ">
      <p class="text-5xl font-bold text-text-danger">404</p>
      <p class="mt-1 text-xl">Страница не найдена</p>
      <AppButton
        variant="primary"
        :to="{ name: 'Login' }"
        class="w-full mt-6"
      >
        На главную
      </AppButton>
    </div>
  </MinimalLayout>
</template>