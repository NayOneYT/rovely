<script setup lang="ts">
import { useLocalStorage } from "@vueuse/core"
import { ref } from "vue"
import { useLoginForm } from "../composables/useLoginForm"
import { useGoogleAuth } from "../composables/useGoogleAuth"
import { InputError, AppButton } from "@/shared/components/ui"
import { Eye, EyeOff, Check } from "@lucide/vue"
import { GoogleIcon } from "@/shared/components/icons"

const isProcessing = defineModel<boolean>({ default: false })
const theUserLoggedInOnce = useLocalStorage("theUserLoggedInOnce", false)
const showPassword = ref(false)

const { 
  identifierString, identifierClientError, identifierServerError, onIdentifierInput, onIdentifierBlur,
  password, passwordClientError, passwordServerError, onPasswordBlur,
  rememberMe,
  login
} = useLoginForm(isProcessing)

const { 
  googleClient
} = useGoogleAuth(isProcessing)

const handleGoogleLogin = () => {
  isProcessing.value = true
  googleClient.requestCode()
}
</script>

<template>
  <p class="text-4xl font-medium cursor-default">{{ theUserLoggedInOnce ? "О, знакомое лицо" : "Знакомы?" }}</p>
  <p class="text-white/60 mt-1 mb-8 cursor-default">Войдите в аккаунт</p>
  <form @submit="login" class="flex flex-col">
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
    <label for="password" class="text-lg pb-0.5 mt-4 self-start">Пароль</label>
    <div 
      class="
      group flex items-center w-full bg-[#060e0b] rounded-2xl border border-[#1c2e28] 
      focus-within:outline-none focus-within:border-[#13d373] focus-within:shadow-[0_0_6px_#13d373] transition-all
      "
    >
      <input
        v-model="password"
        @blur="onPasswordBlur"
        :disabled="isProcessing"
        :type="showPassword ? 'text' : 'password'"
        id="password"
        autocomplete="current-password"
        maxlength="72"
        class="flex-1 bg-transparent py-3 px-4 focus-visible:outline-none"
      >
      <div class="w-px h-6 transition-all bg-[#1c2e28] group-focus-within:bg-[#13d373] group-focus-within:shadow-[0_0_6px_#13d373]" />
      <AppButton
        variant="icon"
        @click="showPassword = !showPassword"
        @mousedown.prevent
        :disabled="isProcessing"
        class="m-1 mr-1.5"
      >
        <component 
          :is="showPassword ? Eye : EyeOff"
          :class="showPassword ? 'size-7' : 'size-6'"
        />
      </AppButton>
    </div>
    <InputError :clientError="passwordClientError" :serverError="passwordServerError" />
    <div class="flex justify-between mt-4 mb-5">
      <label class="group flex items-center" :class="isProcessing ? 'pointer-events-none' : ''">
        <input 
          :disabled="isProcessing"
          v-model="rememberMe"
          type="checkbox" 
          class="peer sr-only"
        >
        <div 
          class="
          w-5 h-5 cursor-pointer bg-[#060e0b] rounded-full border border-[#1c2e28] text-[#060e0b] flex items-center justify-center 
          peer-focus-visible:shadow-[0_0_6px_#13d373] group-hover:shadow-[0_0_6px_#13d373] peer-checked:text-[#13d373] transition-all
          "
        >
          <Check class="size-4 stroke-5 -mb-0.5" />
        </div>
        <span class="pl-1 cursor-pointer select-none text-white/60 peer-checked:text-white peer-focus-visible:text-white group-hover:text-white transition-all">Запомнить меня</span>
      </label>
      <RouterLink
        :to="{ name: 'PasswordRecovery' }"
        :tabindex="isProcessing ? -1 : 0"
        :class="isProcessing ? 'pointer-events-none' : ''"
        class="text-[#13d373] hover:underline focus-visible:outline-none focus-visible:underline"
      >
        Забыли пароль?
      </RouterLink>
    </div>
    <AppButton
      variant="primary"
      type="submit"
      :disabled="isProcessing"
    >
      {{ isProcessing ? "Проверка..." : "Войти" }}
    </AppButton>
  </form>
  <div class="flex items-center my-6 text-sm text-white/40">  
    <div class="flex-1 h-px bg-linear-to-r from-transparent via-[#13d373]" />
      <span class="mx-4 select-none">
        или
      </span>
    <div class="flex-1 h-px bg-linear-to-r from-transparent via-[#13d373]" />
  </div>
  <RouterLink
    :to="{ name: 'LoginWithPhone' }"
    :tabindex="isProcessing ? -1 : 0"
    :class="isProcessing ? 'pointer-events-none' : ''"
    class="
    block p-3 rounded-4xl bg-[#060e0b] border border-[#1c2e28] text-white text-center
    hover:border-[#13d373] hover:text-white transition-all duration-200
    hover:shadow-[0_0_6px_#13d373] cursor-pointer select-none
    focus-visible:outline-none focus-visible:border-[#13d373] focus-visible:shadow-[0_0_6px_#13d373]
    "
  >
    Войти по номеру телефона
  </RouterLink>
  <button
    @click="handleGoogleLogin"
    :disabled="isProcessing"
    :class="isProcessing ? 'pointer-events-none' : ''"
    class="
    w-full p-3 rounded-4xl mt-2
    bg-[#060e0b] border border-[#1c2e28]
    text-white
    hover:border-[#13d373] hover:text-white
    flex items-center justify-center gap-2
    transition-all duration-200
    hover:shadow-[0_0_6px_#13d373] cursor-pointer select-none
    focus-visible:outline-none focus-visible:border-[#13d373] focus-visible:shadow-[0_0_6px_#13d373]
    "
  >
    <GoogleIcon class="size-5" />
    Войти через Google
  </button>
</template>