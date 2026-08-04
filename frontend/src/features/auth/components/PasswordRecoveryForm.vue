<script setup lang="ts">
import { usePasswordRecoveryForm } from "../composables/usePasswordRecoveryForm"
import { InputError } from "@/shared/components/ui"
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
    <label for="identifier" class="texl-lg pb-0.5 self-start">Логин, email или номер телефона</label>
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
    <div class="flex justify-between mt-6">
      <RouterLink
        :to="{ name: 'Login' }"
        :tabindex="isProcessing ? -1 : 0"
        :class="isProcessing ? 'pointer-events-none' : ''"
        class="w-50 texl-lg text-center bg-[#060e0b] select-none p-3 rounded-4xl text-white/60
        cursor-pointer hover:text-white focus-visible:outline-none focus-visible:text-white transition-all"
      >
        На главную
      </RouterLink>
      <button
        :disabled="isProcessing"
        :class="isProcessing ? 'pointer-events-none' : ''"
        class="w-50 self-end relative p-3 rounded-4xl bg-[#13d373] text-[#060e0b] overflow-hidden group
        cursor-pointer hover:shadow-[0_0_30px_-10px_#13d373] focus-visible:outline-none focus-visible:shadow-[0_0_30px_-10px_#13d373] transition-all duration-200"
      >
        <span class="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700 skew-x-12 group-focus-visible:translate-x-full" />
        <span class="flex justify-center items-center gap-1 z-10 font-bold texl-lg select-none">
          Далее
        </span>
      </button>
    </div>
  </form>
  <div v-else class="flex flex-col">
    <button 
      v-if="blurredEmail"
      @click="send('EMAIL')"
      :disabled="isProcessing || !!sendEmailCooldown"
      :class="isProcessing || sendEmailCooldown ? 'pointer-events-none' : ''"
      class="
      relative w-full rounded-4xl bg-[#13d373] text-[#060e0b] transition-all duration-200 overflow-hidden group cursor-pointer
      hover:shadow-[0_0_30px_-10px_#13d373] focus-visible:outline-none focus-visible:shadow-[0_0_30px_-10px_#13d373]
      "
    >
      <span class="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700 skew-x-12 group-focus-visible:translate-x-full" />
      <span class="flex justify-center items-center gap-3 z-10 font-bold texl-lg select-none">
        <span class="py-3">Письмо на {{ blurredEmail }}</span>
        <span class="flex flex-row items-center gap-1">
          <Mail class="size-6" />
          <p 
            v-if="sendEmailCooldown" 
            class="text-sm"
          >
            {{ sendEmailCooldown }}
          </p>
        </span>
      </span>
    </button>
    <button 
      v-if="blurredPhone"
      @click="send('PHONE')"
      :disabled="isProcessing || !!sendTelegramMessageCooldown"
      :class="isProcessing || sendTelegramMessageCooldown ? 'pointer-events-none' : ''"
      class="
      relative w-full mt-2 rounded-4xl bg-[#13d373] text-[#060e0b] transition-all duration-200 overflow-hidden group cursor-pointer
      hover:shadow-[0_0_30px_-10px_#13d373] focus-visible:outline-none focus-visible:shadow-[0_0_30px_-10px_#13d373]
      "
    >
      <span class="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700 skew-x-12 group-focus-visible:translate-x-full" />
      <span class="flex justify-center items-center gap-2 z-10 font-bold texl-lg select-none">
        <span class="py-3">Сообщение на {{ blurredPhone }}</span>
        <span class="flex flex-row items-center">
          <TelegramIcon class="size-8" />
          <p 
            v-if="sendTelegramMessageCooldown" 
            class="text-sm"
          >
            {{ sendTelegramMessageCooldown }}
          </p>
        </span>
      </span>
    </button>
    <button
      @click="step = 1"
      :disabled="isProcessing"
      :class="isProcessing ? 'pointer-events-none' : ''"
      class="w-wull mt-6 texl-lg bg-[#060e0b] select-none p-3 rounded-4xl text-white/60
      cursor-pointer hover:text-white focus-visible:outline-none focus-visible:text-white transition-all"
    >
      Назад
    </button>
  </div>
</template>