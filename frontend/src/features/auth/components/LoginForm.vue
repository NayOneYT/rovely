<script setup lang="ts">
import { ref } from "vue"
import { useLoginForm } from "../composables/useLoginForm"
import { useLoginWithPhoneForm } from "../composables/useLoginWithPhoneForm"
import { useGoogleAuth } from "../composables/useGoogleAuth"
import { useLocalStorage } from "@vueuse/core"
import InputError from "@/components/InputError.vue"
import SvgLoading from "@/components/SvgLoading.vue"
import SvgEyeOpen from "@/components/SvgEyeOpen.vue"
import SvgEyeClosed from "@/components/SvgEyeClosed.vue"
import SvgCheck from "@/components/SvgCheck.vue"
import SvgGoogle from "@/components/SvgGoogle.vue"
import SvgTelegram from "@/components/SvgTelegram.vue"

const isProcessing = ref<boolean>(false)

const { 
  identifier, identifierClientError, identifierServerError, onIdentifierBlur,
  password, passwordClientError, passwordServerError, onPasswordBlur,
  login
} = useLoginForm(isProcessing)

const {
  phoneString, onPhoneInput, onPhoneBlur, phoneClientError, phoneServerError,
  codeString, onCodeInput, onCodeBlur, codeClientError, codeServerError, sendCodeCooldown,
  loginWithPhone, sendLoginWithPhoneCode
} = useLoginWithPhoneForm(isProcessing)

const { 
  googleClient
} = useGoogleAuth(isProcessing)

const handleGoogleLogin = () => {
  isProcessing.value = true
  googleClient.requestCode()
}

const rememberMe = useLocalStorage("rememberMe", false)
const theUserLoggedInOnce = useLocalStorage("theUserLoggedInOnce", false)
const showPassword = ref(false)
const isLoginWithPassword = ref(true)
</script>

<template>
  <p class="text-4xl font-medium cursor-default">{{ theUserLoggedInOnce? "О, знакомое лицо" : "Знакомы?" }}</p>
  <p class="text-white/60 mt-1 mb-8 cursor-default">Войдите в аккаунт, чтобы продолжить</p>
  <form v-if="isLoginWithPassword" @submit="login" class="flex flex-col">
    <label for="identifier" class="texl-lg pb-0.5 self-start">Логин или email</label>
    <input 
      v-model="identifier"
      @blur="onIdentifierBlur"
      :disabled="isProcessing"
      id="identifier"
      autocomplete="username"
      type="text"
      maxlength="254"
      placeholder="NayOne | email@example.com" 
      spellcheck="false"
      class="
      w-full bg-[#060e0b] rounded-2xl p-3 px-4 border border-[#1c2e28]
      focus-visible:outline-none focus-visible:border-[#13d373] focus-visible:shadow-[0_0_6px_#13d373] transition-all
      "
    >
    <InputError :clientError="identifierClientError" :serverError="identifierServerError" />
    <label for="password" class="texl-lg pb-0.5 mt-4 self-start">Пароль</label>
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
        placeholder="Введите пароль"
        class="flex-1 bg-transparent p-3 px-4 focus-visible:outline-none"
      >
      <div class="w-px h-6 transition-all bg-[#1c2e28] group-focus-within:bg-[#13d373] group-focus-within:shadow-[0_0_6px_#13d373]" />
      <div class="w-14 px-3 flex items-center justify-center">
        <button
          type="button"
          @click="showPassword = !showPassword"
          @mousedown.prevent
          class="p-3 text-white/60 not-disabled:hover:text-white not-disabled:cursor-pointer transition-all focus-visible:outline-none focus-visible:text-white"
          :disabled="isProcessing"
        >
          <SvgEyeOpen v-if="showPassword" class="size-6" />
          <SvgEyeClosed v-else class="size-6" />
        </button>
      </div>
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
          class="w-5 h-5 cursor-pointer bg-[#060e0b] rounded-full border border-[#1c2e28] text-[#060e0b] flex items-center justify-center 
          peer-focus-visible:shadow-[0_0_6px_#13d373] group-hover:shadow-[0_0_6px_#13d373] peer-checked:text-[#13d373] transition-all
          "
        >
          <SvgCheck class="size-4" />
        </div>
        <span class="pl-1 cursor-pointer select-none text-white/60 peer-checked:text-white peer-focus-visible:text-white group-hover:text-white transition-all">Запомнить меня</span>
      </label>
      <a 
        :href="isProcessing ? undefined : '/'"
        :class="isProcessing ? 'pointer-events-none' : ''"
        class="text-[#13d373] hover:underline focus-visible:outline-none focus-visible:underline"
      >
        Забыли пароль?
      </a>
    </div>
    <button
      :disabled="isProcessing"
      :class="isProcessing ? 'pointer-events-none' : ''"
      class="
      relative w-full p-3 rounded-4xl bg-[#13d373] text-[#060e0b] transition-all duration-200 overflow-hidden group cursor-pointer
      hover:shadow-[0_0_30px_-10px_#13d373] focus-visible:outline-none focus-visible:shadow-[0_0_30px_-10px_#13d373]
      "
    >
      <span class="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700 skew-x-12 group-focus-visible:translate-x-full" />
      <span class="flex justify-center items-center gap-1 z-10 font-bold texl-lg select-none">
        <SvgLoading v-if="isProcessing" class="size-6 text-[#060e0b]" />
        {{ isProcessing ? "Проверка..." : "Войти" }}
      </span>
    </button>
  </form>
  <form v-else @submit="loginWithPhone" class="flex flex-col">
    <label for="phone" class="texl-lg pb-0.5 self-start">Телефон</label>
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
      w-full bg-[#060e0b] rounded-2xl p-3 px-4 border border-[#1c2e28]
      focus-visible:outline-none focus-visible:border-[#13d373] focus-visible:shadow-[0_0_6px_#13d373] transition-all
      "
    >
    <InputError :clientError="phoneClientError" :serverError="phoneServerError" />
    <label for="code" class="texl-lg pb-0.5 mt-4 self-start">Код подтверждения</label>
    <div 
      class="
      group flex items-center w-full bg-[#060e0b] rounded-2xl border border-[#1c2e28]
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
        class="flex-1 bg-transparent p-3 px-4 focus-visible:outline-none"
      >
      <div class="w-px h-6 transition-all bg-[#1c2e28] group-focus-within:bg-[#13d373] group-focus-within:shadow-[0_0_6px_#13d373]" />
      <div class="w-14 px-3 flex items-center justify-center">
        <button
          type="button"
          @click="sendLoginWithPhoneCode"
          @mousedown.prevent
          :disabled="!!sendCodeCooldown || isProcessing"
          class="flex flex-col items-center justify-center text-white/60 not-disabled:hover:text-white not-disabled:cursor-pointer transition-all focus-visible:outline-none focus-visible:text-white"
        >
          <SvgTelegram :class="sendCodeCooldown ? 'size-6 mt-1' : 'size-8 m-2'" />
          <p v-if="sendCodeCooldown" class="text-sm">{{ sendCodeCooldown }}</p>
        </button>
      </div>
    </div>
    <InputError :clientError="codeClientError" :serverError="codeServerError" />
    <div class="flex justify-between mt-4 mb-5">
      <label class="group flex items-center" :class="isProcessing ? 'pointer-events-none' : ''">
        <input 
          :disabled="isProcessing"
          v-model="rememberMe"
          type="checkbox" 
          class="peer sr-only"
        >
        <div 
          class="w-5 h-5 cursor-pointer bg-[#060e0b] rounded-full border border-[#1c2e28] text-[#060e0b] flex items-center justify-center 
          peer-focus-visible:shadow-[0_0_6px_#13d373] group-hover:shadow-[0_0_6px_#13d373] peer-checked:text-[#13d373] transition-all
          "
        >
          <SvgCheck class="size-4" />
        </div>
        <span class="pl-1 cursor-pointer select-none text-white/60 peer-checked:text-white peer-focus-visible:text-white group-hover:text-white transition-all">Запомнить меня</span>
      </label>
    </div>
    <button
      class="
      relative w-full p-3 rounded-4xl bg-[#13d373] text-[#060e0b] transition-all duration-200 overflow-hidden group cursor-pointer
      hover:shadow-[0_0_30px_-10px_#13d373] focus-visible:outline-none focus-visible:shadow-[0_0_30px_-10px_#13d373]
      "
      :disabled="isProcessing"
      :class="isProcessing ? 'pointer-events-none' : ''"
    >
      <span class="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700 skew-x-12 group-focus-visible:translate-x-full" />
      <span class="flex justify-center items-center gap-1 z-10 font-bold texl-lg select-none">
        <SvgLoading v-if="isProcessing" class="size-6 text-[#060e0b]" />
        {{ isProcessing ? "Проверка..." : "Войти" }}
      </span>
    </button>
  </form>
  <div class="flex items-center my-6 text-sm text-white/40">  
    <div class="flex-1 h-px bg-linear-to-r from-transparent via-[#13d373]" />
      <span class="mx-4 select-none">
        или
      </span>
    <div class="flex-1 h-px bg-linear-to-r from-transparent via-[#13d373]" />
  </div>
  <button
    @click="isLoginWithPassword = !isLoginWithPassword"
    class="
    w-full p-3 rounded-4xl bg-[#060e0b] border border-[#1c2e28] text-white
    hover:border-[#13d373] hover:text-white transition-all duration-200
    hover:shadow-[0_0_6px_#13d373] cursor-pointer select-none
    focus-visible:outline-none focus-visible:border-[#13d373] focus-visible:shadow-[0_0_6px_#13d373]
    "
    :disabled="isProcessing"
    :class="isProcessing ? 'pointer-events-none' : ''"
  >
    {{ isLoginWithPassword ? "Войти по номеру телефона" : "Войти с паролем" }}
  </button>
  <button
    @click="handleGoogleLogin"
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
    :disabled="isProcessing"
    :class="isProcessing ? 'pointer-events-none' : ''"
  >
    <SvgGoogle class="size-5" />
    Войти через Google
  </button>
</template>