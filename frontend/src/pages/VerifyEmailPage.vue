<script setup lang="ts">
import { useVerifyEmail } from "../features/verification/email/composables/useVerifyEmail"
import MinimalLayout from "@/shared/layouts/MinimalLayout.vue"
import { AppLogo } from "../shared/components/ui"
import { LoaderCircle } from "@lucide/vue"

const { status } = useVerifyEmail()
</script>

<template>
  <MinimalLayout>
    <AppLogo class="text-5xl w-full flex justify-center -mt-4" />
    <div class="z-1 rounded-[40px] border border-border bg-card p-10 mt-6 text-xl">
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