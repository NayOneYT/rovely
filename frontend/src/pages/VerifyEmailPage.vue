<script setup lang="ts">
import { useVerifyEmail } from "../features/verification/email/composables/useVerifyEmail"
import MinimalLayout from "@/shared/layouts/MinimalLayout.vue"
import { AppLogo } from "../shared/components/ui"
import { LoaderCircle } from "@lucide/vue"

const { status } = useVerifyEmail()
</script>

<template>
  <MinimalLayout class="h-screen">
    <AppLogo class="text-5xl w-full flex justify-center -mt-2" />
    <div class="bg-card px-4 sm:px-10 py-2.75 sm:py-7.5 mt-4 text-xl border border-border rounded-[13.5px] sm:rounded-[35px]">
      <p v-if="status === 'IDLE'">
        <LoaderCircle class="size-10 animate-spin" />
      </p>
      <p 
        v-else-if="status === 'TOKEN_INVALID'"
        class="text-red-400"
      >
        Запросите новую ссылку
      </p>
      <p v-else-if="status === 'ALREADY_VERIFIED'">
        Почта уже подтверждена, можете продолжать регистрацию
      </p>
      <p v-else>
        Почта подтверждена
      </p>
    </div>
  </MinimalLayout>
</template>