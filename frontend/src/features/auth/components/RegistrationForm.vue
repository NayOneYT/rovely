<script setup lang="ts">
import { ref } from "vue"
import { useRegistrationForm } from "../composables/useRegistrationForm"
import InputError from "@/components/InputError.vue"
import SvgGoogle from "@/components/SvgGoogle.vue"
import SvgEmail from "@/components/SvgEmail.vue"
import SvgEyeOpen from "@/components/SvgEyeOpen.vue"
import SvgEyeClosed from "@/components/SvgEyeClosed.vue"
import SvgTelegram from "@/components/SvgTelegram.vue"

const {
  name, nameClientError, onNameBlur,
  username, usernameClientError, usernameServerError, onUsernameBlur,
  email, emailClientError, emailServerError, onEmailBlur, isEmailVerified, sendVerificationEmailCooldown,
  phoneClientError, phoneServerError, onPhoneBlur, onPhoneInput, phoneString,
  onCodeInput, codeString, onCodeBlur, codeClientError, codeServerError, sendCodeCooldown,
  login, loginClientError, loginServerError, onLoginBlur,
  password, passwordClientError, onPasswordBlur,
  step, handleSendVerificationEmail, handleSendVerificationCode, goToNextStep, register
} = useRegistrationForm()

const showPassword = ref(false)
</script>

<template>
  <p class="text-4xl font-medium cursor-default">Давайте знакомиться</p>
  <p class="text-white/60 mt-1 mb-8 cursor-default">Расскажите нам о себе</p>
  <form @submit.prevent="goToNextStep" class="flex flex-col" v-if="step === 1">
    <label for="name" class="text-[18px] pb-0.5 self-start">Отображаемое имя (необязательно)</label>
    <input 
      v-model="name"
      @blur="onNameBlur"
      id="name"
      autocomplete="name"
      type="text"
      maxlength="30"
      placeholder="Гуру успешного успеха 😎💸"
      class="
      w-full bg-[#060e0b] rounded-2xl p-3 px-4 border border-[#1c2e28]
      focus-visible:outline-none focus-visible:border-[#13d373] focus-visible:shadow-[0_0_6px_#13d373] transition-all
      "
    >
    <InputError :clientError="nameClientError" />
    <label for="username" class="text-[18px] pb-0.5 mt-4 self-start">Имя пользователя (необязательно)</label>
    <input 
      v-model="username"
      @blur="onUsernameBlur"
      id="username"
      type="text"
      maxlength="30"
      placeholder="username"
      class="
      w-full bg-[#060e0b] rounded-2xl p-3 px-4 border border-[#1c2e28]
      focus-visible:outline-none focus-visible:border-[#13d373] focus-visible:shadow-[0_0_6px_#13d373] transition-all
      "
    >
    <InputError :clientError="usernameClientError" :serverError="usernameServerError" />
    <p class="text-white/40 font-light mt-2"><i>Вас смогут найти по @username</i></p>
    <button
      class="
      w-full self-end relative p-3 mt-6 rounded-4xl bg-[#13d373] text-[#060e0b] transition-all duration-200 overflow-hidden group cursor-pointer
      hover:shadow-[0_0_30px_-10px_#13d373] focus-visible:outline-none focus-visible:shadow-[0_0_30px_-10px_#13d373]
      "
    >
      <span class="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700 skew-x-12 group-focus-visible:translate-x-full"></span>
      <span class="flex justify-center items-center gap-1 z-10 font-bold text-[18px] select-none">
        Далее
      </span>
    </button>
  </form>
  <form @submit.prevent="goToNextStep" class="flex flex-col" v-if="step === 2">
    <label for="email" class="text-[18px] pb-0.5 self-start">Email</label>
    <div 
      class="
      group flex items-center w-full bg-[#060e0b] rounded-2xl border border-[#1c2e28]
      focus-within:outline-none focus-within:border-[#13d373] focus-within:shadow-[0_0_6px_#13d373] transition-all
      "
    >
      <input 
        v-model="email"
        @blur="onEmailBlur"
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
          :disabled="isEmailVerified || !!sendVerificationEmailCooldown"
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
        class="
        w-50 text-[18px] bg-[#060e0b] select-none p-3 rounded-4xl cursor-pointer text-white/60
      hover:text-white focus-visible:text-white focus-visible:outline-none transition-all
        "
      >
        Назад
      </button>
      <button
        class="
        w-50 self-end relative p-3 rounded-4xl bg-[#13d373] text-[#060e0b] transition-all duration-200 overflow-hidden group cursor-pointer
        hover:shadow-[0_0_30px_-10px_#13d373] focus-visible:outline-none focus-visible:shadow-[0_0_30px_-10px_#13d373]
        "
      >
        <span class="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700 skew-x-12 group-focus-visible:translate-x-full"></span>
        <span class="flex justify-center items-center gap-1 z-10 font-bold text-[18px] select-none">
          Далее
        </span>
      </button>
    </div>
  </form>
  <form @submit.prevent="goToNextStep" class="flex flex-col" v-if="step === 2.5">
    <label for="code" class="text-[18px] pb-0.5 self-start">Код подтверждения</label>
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
          :disabled="!!sendCodeCooldown"
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
      1. Перейдите в Telegram-бота — <a href="https://t.me/rovely_bot" target="_blank" class="hover:text-white transition-all focus-visible:outline-none focus-visible:text-white">@rovely_bot (ссылка)</a><br>
      2. Активируйте его нажав на кнопку либо через /start<br>
      3. Отправьте боту свой номер телефона (кнопкой)<br>
      4. Нажмите на самолетик справа от поля ввода кода</i>
    </p>
    <div class="flex justify-between mt-6">
      <button
        @click.prevent="step = 2"
        class="
        w-50 text-[18px] bg-[#060e0b] select-none p-3 rounded-4xl cursor-pointer text-white/60
      hover:text-white focus-visible:text-white focus-visible:outline-none transition-all
        "
      >
        Назад
      </button>
      <button
        class="
        w-50 self-end relative p-3 rounded-4xl bg-[#13d373] text-[#060e0b] transition-all duration-200 overflow-hidden group cursor-pointer
        hover:shadow-[0_0_30px_-10px_#13d373] focus-visible:outline-none focus-visible:shadow-[0_0_30px_-10px_#13d373]
        "
      >
        <span class="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700 skew-x-12 group-focus-visible:translate-x-full"></span>
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
      class="
      group flex items-center w-full bg-[#060e0b] rounded-2xl border border-[#1c2e28]
      focus-within:outline-none focus-within:border-[#13d373] focus-within:shadow-[0_0_6px_#13d373] transition-all
      "
    >
      <input
        v-model="password"
        @blur="onPasswordBlur"
        id="password"
        autocomplete="current-password"
        :type="showPassword ? 'text' : 'password'"
        maxlength="72"
        placeholder="Введите пароль"
        class="flex-1 bg-transparent p-3 px-4 focus-visible:outline-none"
      >
      <div class="w-px h-6 transition-all bg-[#1c2e28] group-focus-within:bg-[#13d373] group-focus-within:shadow-[0_0_6px_#13d373]" />
      <div class=" w-14 px-3 flex items-center justify-center">
        <button
          type="button"
          @click="showPassword = !showPassword"
          @mousedown.prevent
          class="p-3 text-white/60 not-disabled:hover:text-white not-disabled:cursor-pointer transition-all focus-visible:outline-none focus-visible:text-white"
        >
          <SvgEyeOpen v-if="showPassword" class="size-6" />
          <SvgEyeClosed v-else class="size-6" />
        </button>
      </div>
    </div>
    <InputError :clientError="passwordClientError" />
    <p class="text-white/40 font-light mt-2"><i>Используйте логин для входа в аккаунт</i></p>
    <div class="flex justify-between mt-6">
      <button
        @click.prevent="step = 2"
        class="
        w-50 text-[18px] bg-[#060e0b] select-none p-3 rounded-4xl cursor-pointer text-white/60
      hover:text-white focus-visible:text-white focus-visible:outline-none transition-all
        "
      >
        Назад
      </button>
      <button
        class="
        w-50 self-end relative p-3 rounded-4xl bg-[#13d373] text-[#060e0b] transition-all duration-200 overflow-hidden group cursor-pointer
        hover:shadow-[0_0_30px_-10px_#13d373] focus-visible:outline-none focus-visible:shadow-[0_0_30px_-10px_#13d373]
        "
      >
        <span class="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700 skew-x-12 group-focus-visible:translate-x-full"></span>
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
    <SvgGoogle class="size-5" />
    Продолжить с Google
  </button>
</template>