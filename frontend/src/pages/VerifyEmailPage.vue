<script setup lang="ts">
import { useVerifyEmail } from "../features/verification/email/composables/useVerifyEmail"
import MinimalLayout from "@/shared/layouts/MinimalLayout.vue"
import { SiteLogo } from "../shared/components/ui"
import { LoaderCircle } from "@lucide/vue"

const { status } = useVerifyEmail()
</script>

<template>
  <MinimalLayout>
    <SiteLogo class="text-5xl relative w-full flex justify-center -mt-12" />
    <div class="z-1 rounded-4xl border border-[#1c2e28] bg-[#111b18] p-10 mt-4 text-xl transition-all">
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