<script setup lang="ts">
import { usePasswordRecoveryForm } from "../composables/usePasswordRecoveryForm"
import { InputError, AppButton } from "@/shared/components/ui"
import { Mail } from "@lucide/vue"
import { TelegramIcon } from "@/shared/components/icons"

const isProcessing = defineModel<boolean>({ default: false })

const {
  identifierString, identifierClientError, identifierServerError, onIdentifierInput, onIdentifierBlur,
  step, blurredEmail, blurredPhone, sendEmailCooldown, sendTelegramMessageCooldown,
  getContacts, send
} = usePasswordRecoveryForm(isProcessing)
</script>

<template>
  <p class="text-4xl font-medium cursor-default">Восстановление пароля</p>
  <p class="text-white/60 mt-1 mb-8 cursor-default">{{ step === 1 ? "Что за аккаунт?" : "Как будем восстанавливать?" }}</p>
  <form v-if="step === 1" @submit="getContacts" class="flex flex-col">
    <label for="identifier" class="text-lg pb-0.5 self-start">Логин, email или номер телефона</label>
    <input 
      :value="identifierString"
      @input="onIdentifierInput"
      @blur="onIdentifierBlur"
      :disabled="isProcessing"
      id="identifier"
      autocomplete="username"
      type="text"
      maxlength="254"
      placeholder="NayOne | email@example.com | +375 29 123 45 67" 
      spellcheck="false"
      class="
      w-full bg-[#060e0b] rounded-2xl p-3 px-4 border border-[#1c2e28]
      focus-visible:outline-none focus-visible:border-[#13d373] focus-visible:shadow-[0_0_6px_#13d373] transition-all
      "
    >
    <InputError :clientError="identifierClientError" :serverError="identifierServerError" />
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
  <div v-else class="flex flex-col">
    <AppButton
      v-if="blurredEmail"
      variant="primary"
      @click="send('EMAIL')"
      :disabled="isProcessing || !!sendEmailCooldown"
    >
      Письмо на {{ blurredEmail }}
      <Mail class="ml-2 mr-1 size-6" />
      <span
        v-if="!!sendEmailCooldown" 
        class="text-sm"
      >
        {{ sendEmailCooldown }}
      </span>
    </AppButton>
    <AppButton
      v-if="blurredPhone"
      variant="primary"
      @click="send('PHONE')"
      :disabled="isProcessing || !!sendTelegramMessageCooldown"
      class="mt-6"
    >
      Сообщение на {{ blurredPhone }}
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
      @click="step = 1"
      :disabled="isProcessing"
      class="mt-6"
    >
      Назад
    </AppButton>
  </div>
</template>