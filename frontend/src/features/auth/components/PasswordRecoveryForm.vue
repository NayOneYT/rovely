<script setup lang="ts">
import { storeToRefs } from "pinia"
import { useAuthStore } from "../auth.store.ts"
import { usePasswordRecoveryForm } from "../composables/usePasswordRecoveryForm"
import { AuthFormHeader, AppButton } from "@/shared/components/ui"
import { IdentifierField } from "@/shared/components/ui/fields"
import { Mail } from "@lucide/vue"
import { TelegramIcon } from "@/shared/components/icons"

const { 
  passwordRecoveryStep, passwordRecoveryBlurredEmail, passwordRecoveryBlurredPhone, isProcessing
} = storeToRefs(useAuthStore())

const {
  identifier, identifierServerError,
  sendEmailCooldown, sendTelegramMessageCooldown,
  getContacts, send
} = usePasswordRecoveryForm()
</script>

<template>
  <AuthFormHeader
    title="Восстановление пароля"
    :subtitle="passwordRecoveryStep === 1 ? 'Что за аккаунт?' : 'Как будем восстанавливать?'"
  />
  <form v-if="passwordRecoveryStep === 1" @submit.prevent="getContacts">
    <IdentifierField
      :field="identifier"
      :serverError="identifierServerError"
      :disabled="isProcessing"
    />
    <div class="flex gap-6 mt-6">
      <AppButton
        variant="secondary"
        :to="{ name: 'Login' }"
        :disabled="isProcessing"
        class="flex-1"
      >
        На главную
      </AppButton>
      <AppButton
        variant="primary"
        type="submit"
        :disabled="isProcessing"
        class="flex-1"
      >
        Далее
      </AppButton>
    </div>
  </form>
  <div v-else class="flex flex-col mt-6">
    <AppButton
      v-if="passwordRecoveryBlurredEmail"
      variant="primary"
      @click="send('EMAIL')"
      :disabled="isProcessing || !!sendEmailCooldown"
    >
      {{ passwordRecoveryBlurredEmail }}
      <Mail class="ml-2 mr-1 size-6" />
      <span
        v-if="!!sendEmailCooldown" 
        class="text-sm"
      >
        {{ sendEmailCooldown }}
      </span>
    </AppButton>
    <AppButton
      v-if="passwordRecoveryBlurredPhone"
      variant="primary"
      @click="send('PHONE')"
      :disabled="isProcessing || !!sendTelegramMessageCooldown"
      class="mt-4"
    >
      {{ passwordRecoveryBlurredPhone }}
      <TelegramIcon class="ml-2.5 mr-0.5 size-6 scale-125" />
      <span 
        v-if="!!sendTelegramMessageCooldown" 
        class="text-sm"
      >
        {{ sendTelegramMessageCooldown }}
      </span>
    </AppButton>
    <AppButton
      variant="secondary"
      @click="passwordRecoveryStep = 1"
      :disabled="isProcessing"
      class="mt-6"
    >
      Назад
    </AppButton>
  </div>
</template>