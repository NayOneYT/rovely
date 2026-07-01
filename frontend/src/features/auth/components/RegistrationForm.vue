<script setup lang="ts">
import { ref } from "vue"
import { useRegistrationForm } from "../composables/useRegistrationForm"
import { useGoogleAuth } from "../composables/useGoogleAuth"
import InputError from "@/components/InputError.vue"
import SvgGoogle from "@/components/SvgGoogle.vue"
import SvgEmail from "@/components/SvgEmail.vue"
import SvgEyeOpen from "@/components/SvgEyeOpen.vue"
import SvgEyeClosed from "@/components/SvgEyeClosed.vue"
import SvgTelegram from "@/components/SvgTelegram.vue"
import SvgCheck from "@/components/SvgCheck.vue"

const isProcessing = ref<boolean>(false)

const {
  name, nameClientError, onNameBlur,
  username, usernameClientError, usernameServerError, onUsernameBlur,
  email, emailClientError, emailServerError, onEmailBlur, isEmailVerified, sendVerificationEmailCooldown,
  phoneClientError, phoneServerError, onPhoneBlur, onPhoneInput, phoneString,
  onCodeInput, codeString, onCodeBlur, codeClientError, codeServerError, sendCodeCooldown,
  login, loginClientError, loginServerError, onLoginBlur,
  password, passwordClientError, onPasswordBlur,
  step, handleSendVerificationEmail, handleSendVerificationCode, goToNextStep, register
} = useRegistrationForm(isProcessing)

const { 
  googleClient
} = useGoogleAuth(isProcessing)

const handleGoogleRegistration = () => {
  isProcessing.value = true
  googleClient.requestCode()
}

const showPassword = ref(false)
const acceptedTerms = ref(false)
</script>

<template>
  <p class="text-4xl font-medium cursor-default">Давайте знакомиться</p>
  <p class="text-white/60 mt-1 mb-8 cursor-default">Расскажите нам о себе</p>
  <form @submit.prevent="goToNextStep" class="flex flex-col" v-if="step === 1">
    <label for="name" class="text-[18px] pb-0.5 self-start">Отображаемое имя (необязательно)</label>
    <input 
      v-model="name"
      @blur="onNameBlur"
      :disabled="isProcessing"
      id="name"
      autocomplete="name"
      type="text"
      maxlength="30"
      placeholder="Гуру успешного успеха 😎💸"
      class="w-full bg-[#060e0b] rounded-2xl p-3 px-4 border border-[#1c2e28]
      focus-visible:outline-none focus-visible:border-[#13d373] focus-visible:shadow-[0_0_6px_#13d373] transition-all"
    >
    <InputError :clientError="nameClientError" />
    <label for="username" class="text-[18px] pb-0.5 mt-4 self-start">Имя пользователя (необязательно)</label>
    <input 
      v-model="username"
      @blur="onUsernameBlur"
      :disabled="isProcessing"
      id="username"
      type="text"
      maxlength="30"
      placeholder="username"
      class="w-full bg-[#060e0b] rounded-2xl p-3 px-4 border border-[#1c2e28]
      focus-visible:outline-none focus-visible:border-[#13d373] focus-visible:shadow-[0_0_6px_#13d373] transition-all"
    >
    <InputError :clientError="usernameClientError" :serverError="usernameServerError" />
    <p class="text-white/40 font-light mt-2"><i>Вас смогут найти по @{{ username || "username" }}</i></p>
    <button
      :disabled="isProcessing"
      :class="isProcessing ? 'pointer-events-none' : ''"
      class="w-full self-end relative p-3 mt-6 rounded-4xl bg-[#13d373] text-[#060e0b] overflow-hidden group
      cursor-pointer hover:shadow-[0_0_30px_-10px_#13d373] focus-visible:outline-none focus-visible:shadow-[0_0_30px_-10px_#13d373] transition-all duration-200"
    >
      <span class="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700 skew-x-12 group-focus-visible:translate-x-full" />
      <span class="flex justify-center items-center gap-1 z-10 font-bold text-[18px] select-none">
        Далее
      </span>
    </button>
  </form>
  <form @submit.prevent="goToNextStep" class="flex flex-col" v-if="step === 2">
    <label for="email" class="text-[18px] pb-0.5 self-start">Email</label>
    <div 
      :class="isProcessing ? 'pointer-events-none' : ''"
      class="group flex items-center w-full bg-[#060e0b] rounded-2xl border border-[#1c2e28]
      focus-within:border-[#13d373] focus-within:outline-none focus-within:shadow-[0_0_6px_#13d373] transition-all"
    >
      <input 
        v-model="email"
        @blur="onEmailBlur"
        :disabled="isProcessing"
        id="email"
        autocomplete="email"
        type="email"
        maxlength="254"
        placeholder="email@example.com"
        class="flex-1 bg-transparent p-3 px-4 focus-visible:outline-none"
      >
      <div class="w-px h-6 transition-all bg-[#1c2e28] group-focus-within:bg-[#13d373] group-focus-within:shadow-[0_0_6px_#13d373]" />
      <div class="w-14 px-3 flex items-center justify-center">
        <button
          type="button"
          @click="handleSendVerificationEmail"
          @mousedown.prevent
          :disabled="isEmailVerified || !!sendVerificationEmailCooldown || isProcessing"
          class="flex flex-col items-center justify-center text-white/60 not-disabled:hover:text-white not-disabled:cursor-pointer transition-all focus-visible:outline-none focus-visible:text-white"
        >
          <SvgEmail :class="sendVerificationEmailCooldown && !isEmailVerified ? 'size-5 mt-1' : 'size-6 m-3'" />
          <p v-if="sendVerificationEmailCooldown && !isEmailVerified" class="text-sm">{{ sendVerificationEmailCooldown }}</p>
        </button>
      </div>
    </div>
    <InputError :clientError="emailClientError" :serverError="emailServerError" />
    <label for="phone" class="text-[18px] pb-0.5 mt-4 self-start">Телефон</label>
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
    <p class="text-white/40 font-light mt-2"><i>* Достаточно указать одно из полей</i></p>
    <div class="flex justify-between mt-6">
      <button
        @click.prevent="step = 1"
        :disabled="isProcessing"
        :class="isProcessing ? 'pointer-events-none' : ''"
        type="button"
        class="w-50 text-[18px] bg-[#060e0b] select-none p-3 rounded-4xl text-white/60
        cursor-pointer hover:text-white focus-visible:outline-none focus-visible:text-white transition-all"
      >
        Назад
      </button>
      <button
        :disabled="isProcessing"
        :class="isProcessing ? 'pointer-events-none' : ''"
        class="w-50 self-end relative p-3 rounded-4xl bg-[#13d373] text-[#060e0b] overflow-hidden group
        cursor-pointer hover:shadow-[0_0_30px_-10px_#13d373] focus-visible:outline-none focus-visible:shadow-[0_0_30px_-10px_#13d373] transition-all duration-200"
      >
        <span class="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700 skew-x-12 group-focus-visible:translate-x-full" />
        <span class="flex justify-center items-center gap-1 z-10 font-bold text-[18px] select-none">
          Далее
        </span>
      </button>
    </div>
  </form>
  <form @submit.prevent="goToNextStep" class="flex flex-col" v-if="step === 2.5">
    <label for="code" class="text-[18px] pb-0.5 self-start">Код подтверждения</label>
    <div 
      :class="isProcessing ? 'pointer-events-none' : ''"
      class="group flex items-center w-full bg-[#060e0b] rounded-2xl border border-[#1c2e28]
      focus-within:border-[#13d373] focus-within:outline-none focus-within:shadow-[0_0_6px_#13d373] transition-all"
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
          @click="handleSendVerificationCode"
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
    <p class="text-white/40 font-light mt-2">
      <i>Чтобы получить код:<br>
      1. Перейдите в Telegram-бота — 
      <a 
        href="https://t.me/rovely_bot" 
        target="_blank" 
        :class="isProcessing ? 'pointer-events-none' : ''"
        class="hover:text-white transition-all focus-visible:outline-none focus-visible:text-white"
      >
        @rovely_bot (ссылка)
      </a><br>
      2. Активируйте его нажав на кнопку либо через /start<br>
      3. Отправьте боту свой номер телефона (кнопкой)<br>
      4. Нажмите на самолетик справа от поля ввода кода</i>
    </p>
    <div class="flex justify-between mt-6">
      <button
        @click.prevent="step = 2"
        :disabled="isProcessing"
        :class="isProcessing ? 'pointer-events-none' : ''"
        type="button"
        class="w-50 text-[18px] bg-[#060e0b] select-none p-3 rounded-4xl text-white/60
        cursor-pointer hover:text-white focus-visible:outline-none focus-visible:text-white transition-all"
      >
        Назад
      </button>
      <button
        :disabled="isProcessing"
        :class="isProcessing ? 'pointer-events-none' : ''"
        class="w-50 self-end relative p-3 rounded-4xl bg-[#13d373] text-[#060e0b] overflow-hidden group
        cursor-pointer hover:shadow-[0_0_30px_-10px_#13d373] focus-visible:outline-none focus-visible:shadow-[0_0_30px_-10px_#13d373] transition-all duration-200"
      >
        <span class="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700 skew-x-12 group-focus-visible:translate-x-full" />
        <span class="flex justify-center items-center gap-1 z-10 font-bold text-[18px] select-none">
          Далее
        </span>
      </button>
    </div>
  </form>
  <form @submit="register" class="flex flex-col" v-if="step === 3">
    <label for="login" class="text-[18px] pb-0.5 self-start">Логин</label>
    <input 
      v-model="login"
      @blur="onLoginBlur"
      :disabled="isProcessing"
      id="login"
      type="text"
      maxlength="50"
      placeholder="NayOne"
      class="
      w-full bg-[#060e0b] rounded-2xl p-3 px-4 border border-[#1c2e28]
      focus-visible:outline-none focus-visible:border-[#13d373] focus-visible:shadow-[0_0_6px_#13d373] transition-all
      "
    >
    <InputError :clientError="loginClientError" :serverError="loginServerError" />
    <label for="password" class="text-[18px] pb-0.5 mt-4 self-start">Пароль</label>
    <div 
      :class="isProcessing ? 'pointer-events-none' : ''"
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
      <div class=" w-14 px-3 flex items-center justify-center">
        <button
          @click="showPassword = !showPassword"
          @mousedown.prevent
          :disabled="isProcessing"
          type="button"
          class="p-3 text-white/60 not-disabled:hover:text-white not-disabled:cursor-pointer transition-all focus-visible:outline-none focus-visible:text-white"
        >
          <SvgEyeOpen v-if="showPassword" class="size-6" />
          <SvgEyeClosed v-else class="size-6" />
        </button>
      </div>
    </div>
    <InputError :clientError="passwordClientError" />
    <div class="flex justify-between mt-4 mb-5">
      <label class="group flex items-center">
        <input
          v-model="acceptedTerms"
          :disabled="isProcessing"
          type="checkbox" 
          class="peer sr-only"
        >
        <div 
          :class="isProcessing ? 'pointer-events-none' : ''"
          class="w-5 h-5 bg-[#060e0b] rounded-full border border-[#1c2e28] text-[#060e0b] flex items-center justify-center
          cursor-pointer peer-focus-visible:shadow-[0_0_6px_#13d373] group-hover:shadow-[0_0_6px_#13d373] peer-checked:text-[#13d373] transition-all"
        >
          <SvgCheck class="size-4" />
        </div>
        <span 
          :class="isProcessing ? 'pointer-events-none' : ''"
          class="pl-1 select-none text-white/60 cursor-pointer peer-checked:text-white peer-focus-visible:text-white group-hover:text-white transition-all"
        >
          <span>Я принимаю </span> 
          <a 
            :class="isProcessing ? 'pointer-events-none' : ''"
            href="/terms" 
            target="_blank" 
            class="text-[#13d373] hover:underline focus-visible:outline-none focus-visible:underline"
          >
            условия
          </a>
          <span> и </span> 
          <a 
            :class="isProcessing ? 'pointer-events-none' : ''"
            href="/privacy" 
            target="_blank" 
            class="text-[#13d373] hover:underline focus-visible:outline-none focus-visible:underline"
          >
            политику
          </a>
        </span>
      </label>
    </div>
    <div class="flex justify-between">
      <button
        @click.prevent="step = 2"
        :disabled="isProcessing"
        :class="isProcessing ? 'pointer-events-none' : ''"
        type="button"
        class="w-50 text-[18px] bg-[#060e0b] select-none p-3 rounded-4xl  text-white/60
        cursor-pointer hover:text-white focus-visible:text-white focus-visible:outline-none transition-all"
      >
        Назад
      </button>
      <button
        :disabled="!acceptedTerms || isProcessing"
        :class="!acceptedTerms || isProcessing ? 'pointer-events-none' : ''"
        class="w-50 self-end relative p-3 rounded-4xl bg-[#13d373] text-[#060e0b] overflow-hidden group
        cursor-pointer hover:shadow-[0_0_30px_-10px_#13d373] focus-visible:outline-none focus-visible:shadow-[0_0_30px_-10px_#13d373] transition-all duration-200"
      >
        <span class="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700 skew-x-12 group-focus-visible:translate-x-full" />
        <span class="flex justify-center items-center gap-1 z-10 font-bold text-[18px] select-none">
          Завершить
        </span>
      </button>
    </div>
  </form>
  <div class="flex items-center my-6 text-sm text-white/40">  
    <div class="flex-1 h-px bg-linear-to-r from-transparent via-[#13d373]" />
      <span class="mx-4 select-none">
        или
      </span>
    <div class="flex-1 h-px bg-linear-to-r from-transparent via-[#13d373]" />
  </div>
  <button
    @click="handleGoogleRegistration"
    :disabled="isProcessing"
    :class="isProcessing ? 'pointer-events-none' : ''"
    class="w-full p-3 rounded-4xl mt-2 bg-[#060e0b] border border-[#1c2e28] text-white flex items-center justify-center gap-2 
    select-none cursor-pointer hover:border-[#13d373] hover:text-white hover:shadow-[0_0_6px_#13d373] 
    focus-visible:outline-none focus-visible:border-[#13d373] focus-visible:shadow-[0_0_6px_#13d373] transition-all duration-200"
  >
    <SvgGoogle class="size-5" />
    Продолжить с Google
  </button>
</template>