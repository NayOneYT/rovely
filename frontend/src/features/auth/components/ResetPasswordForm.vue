<script setup lang="ts">
import { useResetPasswordForm } from "../composables/useResetPasswordForm"
import { PasswordField } from "@/shared/components/ui/fields"
import { AppButton } from "@/shared/components/ui"
import { LoaderCircle } from "@lucide/vue"

const { 
  password,
  status, reset 
} = useResetPasswordForm()
</script>

<template>
  <div
    :class="status === 'READY' || status === 'RESETTING' ? 'w-130' : ''"
    class="z-1 rounded-[40px] border border-[#222a27] bg-[#101312] p-10 mt-4 transition-all"
  >
    <p v-if="status === 'CHECKING'">
      <LoaderCircle class="size-10 animate-spin" />
    </p>
    <p 
      v-else-if="status === 'TOKEN_INVALID'"
      class="text-red-400 text-xl"
    >
      Запросите новую ссылку
    </p>
    <form
      v-else-if="status === 'READY' || status === 'RESETTING'"
      @submit.prevent="reset"
      class="flex flex-col"
    >
      <p class="text-3xl font-semibold cursor-default">Сброс пароля</p>
      <p class="text-sm text-white/60 mt-1 mb-6 cursor-default">Введите новый пароль</p>
      <PasswordField
        :field="password"
        :isNewPassword="true"
        :disabled="status === 'RESETTING'"
      />
      <AppButton
        variant="primary"
        type="submit"
        :disabled="status==='RESETTING'"
        class="mt-6"
      >
        Изменить
      </AppButton>
    </form>
    <p v-else class="text-xl">
      Пароль изменен
    </p>
  </div>
</template>