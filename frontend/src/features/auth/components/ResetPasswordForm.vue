<script setup lang="ts">
import { useResetPasswordForm } from "../composables/useResetPasswordForm"
import { AuthFormHeader, AppButton } from "@/shared/components/ui"
import { PasswordField } from "@/shared/components/ui/fields"
import { LoaderCircle } from "@lucide/vue"

const { 
  password,
  status, remainingTime,
  reset
} = useResetPasswordForm()
</script>

<template>
  <div
    class="bg-card border border-border"
    :class="status === 'READY' || status === 'RESETTING'
      ? 'w-full max-w-118 sm:max-w-130 p-4 sm:p-10 rounded-[40px] sm:rounded-[64px]'
      : 'px-4 sm:px-10 py-2.75 sm:py-7.5 rounded-[13.5px] sm:rounded-[35px]'"
  >
    <p v-if="status === 'CHECKING'">
      <LoaderCircle class="size-10 animate-spin" />
    </p>
    <p 
      v-else-if="status === 'TOKEN_INVALID'"
      class="text-text-danger text-xl"
    >
      Запросите новую ссылку
    </p>
    <form 
      v-else-if="status === 'READY' || status === 'RESETTING'"
      @submit.prevent="reset"
    >
      <AuthFormHeader
        title="Сброс пароля"
        :subtitle="`Измените пароль в течение ${remainingTime}`"
      />
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