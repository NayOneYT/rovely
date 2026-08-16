<script setup lang="ts">
import MinimalLayout from "@/shared/layouts/MinimalLayout.vue"
import { AppLogo } from "@/shared/components/ui"
import { AppButton } from "@/shared/components/ui"

</script>

<template>
  <MinimalLayout>
    <AppLogo class="w-full text-5xl flex justify-center -mt-4" />
    <div class="flex flex-col justify-center items-center mt-6 p-10 bg-card border border-border rounded-[64px]">
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