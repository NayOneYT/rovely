<script setup lang="ts">
import { useLocalStorage } from "@vueuse/core"
import { useLoginWithPhoneForm } from "../composables/useLoginWithPhoneForm"
import { useGoogleAuth } from "../composables/useGoogleAuth"
import { InputError, AppButton } from "@/shared/components/ui"
import { Check, RectangleEllipsis } from "@lucide/vue"
import { TelegramIcon, GoogleIcon } from "@/shared/components/icons"

const isProcessing = defineModel<boolean>({ default: false })
const theUserLoggedInOnce = useLocalStorage("theUserLoggedInOnce", false)

const {
  phoneString, onPhoneInput, onPhoneBlur, phoneClientError, phoneServerError,
  codeString, onCodeInput, onCodeBlur, codeClientError, codeServerError, sendCooldown,
  rememberMe,
  login, send
} = useLoginWithPhoneForm(isProcessing)

const { 
  googleClient
} = useGoogleAuth(isProcessing)

const handleGoogleLogin = () => {
  isProcessing.value = true
  googleClient.requestCode()
}

</script>

<template>
  <p class="text-3xl font-semibold cursor-default">{{ theUserLoggedInOnce ? "О, знакомое лицо" : "Знакомы?" }}</p>
  <p class="text-sm text-white/60 mt-1 mb-6 cursor-default">Войдите в аккаунт</p>
  <form @submit.prevent="login" class="flex flex-col">
    <label for="phone" class="text-sm font-medium pb-1 self-start">Телефон</label>
    <input
      :value="phoneString"
      @input="onPhoneInput"
      @blur="onPhoneBlur"
      :disabled="isProcessing"
      id="phone"
      autocomplete="tel"
      type="tel"
      placeholder="+375 29 123 45 67"
      class="
      w-full placeholder:text-white/40 bg-[#060e0b] rounded-lg p-3 px-4 border border-[#1c2e28]
      focus-visible:outline-none focus-visible:border-[#13d373] focus-visible:shadow-[0_0_6px_#13d373] transition-all
      "
    >
    <InputError :clientError="phoneClientError" :serverError="phoneServerError" />
    <label for="code" class="text-sm font-medium pb-1 mt-4 self-start">Код подтверждения</label>
    <div 
      class="
      group flex items-center w-full bg-[#060e0b] rounded-lg border border-[#1c2e28]
      focus-within:outline-none focus-within:border-[#13d373] focus-within:shadow-[0_0_6px_#13d373] transition-all
      "
    >
      <input
        :value="codeString"
        @input="onCodeInput"
        @blur="onCodeBlur"
        :disabled="isProcessing"
        id="code"
        type="text"
        inputmode="numeric"
        maxlength="6"
        placeholder="123456"
        class="flex-1 placeholder:text-white/40 bg-transparent p-3 px-4 focus-visible:outline-none"
      >
      <div class="w-px h-6 transition-all bg-[#1c2e28] group-focus-within:bg-[#13d373] group-focus-within:shadow-[0_0_6px_#13d373]" />
      <AppButton
        variant="icon"
        @click="send"
        @mousedown.prevent
        :disabled="isProcessing || !!sendCooldown"
        class="m-1 mr-1.5 flex flex-col items-center"
      >
        <TelegramIcon :class="sendCooldown ? 'size-6 -mb-1' : 'p-1.25'"/>
        <p v-if="!!sendCooldown" class="-mb-0.5">
          {{ sendCooldown }}
        </p>
      </AppButton>
    </div>
    <InputError :clientError="codeClientError" :serverError="codeServerError" />
    <label class="group flex items-center text-sm font-medium gap-1.5 mt-4 mb-6 cursor-pointer" :class="isProcessing ? 'pointer-events-none' : ''">
      <input 
        :disabled="isProcessing"
        v-model="rememberMe"
        type="checkbox" 
        class="peer sr-only"
      >
      <div 
        class="
        size-5 flex items-center bg-[#060e0b] rounded-[5px] border border-[#1c2e28] text-[#060e0b]
        peer-focus-visible:border-[#13d373] peer-focus-visible:shadow-[0_0_6px_#13d373] group-hover:border-[#13d373] 
        group-hover:shadow-[0_0_6px_#13d373] peer-checked:border-[#13d373] peer-checked:bg-[#13d373] transition-all duration-200
        "
      >
        <Check class="stroke-4 -mb-px" />
      </div>
      Запомнить меня
    </label>
    <AppButton
      variant="primary"
      type="submit"
      :disabled="isProcessing"
    >
      {{ isProcessing ? "Проверка..." : "Войти" }}
    </AppButton>
  </form>
  <div class="flex items-center my-6">  
    <div class="flex-1 h-px bg-linear-to-r from-transparent via-[#13d373]" />
      <span class="text-sm text-white/60 mx-4 select-none">
        или
      </span>
    <div class="flex-1 h-px bg-linear-to-r from-transparent via-[#13d373]" />
  </div>
  <AppButton
    variant="social"
    :to="{ name: 'Login' }"
    :disabled="isProcessing"
  >
    <RectangleEllipsis class="size-6 text-[#13d373]" />
    Войти с паролем
  </AppButton>
  <AppButton
    variant="social"
    @click="handleGoogleLogin"
    :disabled="isProcessing"
    class="w-full mt-2.5"
  >
    <GoogleIcon class="size-5" />
    Войти через Google
  </AppButton>
</template>