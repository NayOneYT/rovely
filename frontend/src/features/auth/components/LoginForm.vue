<script setup lang="ts">
import { useLocalStorage } from "@vueuse/core"
import { ref } from "vue"
import { useLoginForm } from "../composables/useLoginForm"
import { useGoogleAuth } from "../composables/useGoogleAuth"
import { InputError, AppButton } from "@/shared/components/ui"
import { Eye, EyeOff, Check, Phone } from "@lucide/vue"
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
  <p class="text-3xl font-semibold cursor-default">{{ theUserLoggedInOnce ? "О, знакомое лицо" : "Знакомы?" }}</p>
  <p class="text-sm text-white/60 mt-1 mb-6 cursor-default">Войдите в аккаунт</p>
  <form @submit.prevent="login" class="flex flex-col">
    <label for="identifier" class="text-sm font-medium pb-1 self-start">Логин, email или номер телефона</label>
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
      w-full placeholder:text-white/40 bg-[#070908] rounded-[13.5px] px-4 py-2.75 border border-[#222a27]
      focus-visible:outline-none focus-visible:border-[#13d373] focus-visible:shadow-[0_0_6px_#13d373] transition-all
      "
    >
    <InputError :clientError="identifierClientError" :serverError="identifierServerError" />
    <label for="password" class="text-sm font-medium pb-1 mt-4 self-start">Пароль</label>
    <div 
      class="
      group flex items-center w-full bg-[#070908] rounded-[13.5px] border border-[#222a27] 
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
        class="flex-1 bg-transparent px-4 py-2.75 focus-visible:outline-none"
      >
      <div class="w-px h-6 transition-all bg-[#222a27] group-focus-within:bg-[#13d373] group-focus-within:shadow-[0_0_6px_#13d373]" />
      <AppButton
        variant="icon"
        @click="showPassword = !showPassword"
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
    <div class="flex justify-between text-sm font-medium mt-4 mb-6">
      <label class="group flex items-center gap-1.5 cursor-pointer" :class="isProcessing ? 'pointer-events-none' : ''">
        <input 
          :disabled="isProcessing"
          v-model="rememberMe"
          type="checkbox" 
          class="peer sr-only"
        >
        <div 
          class="
          size-5 flex items-center bg-[#070908] rounded-[4.75px] border border-[#222a27] text-[#070908]
          peer-focus-visible:border-[#13d373] peer-focus-visible:shadow-[0_0_6px_#13d373] group-hover:border-[#13d373] 
          group-hover:shadow-[0_0_6px_#13d373] peer-checked:border-[#13d373] peer-checked:bg-[#13d373] transition-all duration-200
          "
        >
          <Check class="stroke-4 -mb-px" />
        </div>
        Запомнить меня
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
  <div class="flex items-center my-6">  
    <div class="flex-1 h-px bg-linear-to-r from-transparent via-[#13d373]" />
      <span class="text-sm text-white/60 mx-4 select-none">
        или
      </span>
    <div class="flex-1 h-px bg-linear-to-r from-transparent via-[#13d373]" />
  </div>
  <AppButton
    variant="social"
    :to="{ name: 'LoginWithPhone' }"
    :disabled="isProcessing"
  >
    <Phone class="size-5.5 text-[#13d373]" />
    Войти по номеру телефона
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