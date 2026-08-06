<script setup lang="ts">
import { useLocalStorage } from "@vueuse/core"
import { ref } from "vue"
import { useRegistrationForm } from "../composables/useRegistrationForm"
import { useGoogleAuth } from "../composables/useGoogleAuth"
import { InputError, AppButton } from "@/shared/components/ui"
import { Mail, Eye, EyeOff, Check } from "@lucide/vue"
import { TelegramIcon, GoogleIcon } from "@/shared/components/icons"

const isProcessing = defineModel<boolean>({ default: false })
const theUserLoggedInOnce = useLocalStorage("theUserLoggedInOnce", false)
const showPassword = ref(false)

const {
 name, nameClientError, onNameBlur,
  username, usernameClientError, usernameServerError, onUsernameBlur,
  email, emailClientError, emailServerError, onEmailBlur, isEmailVerified, sendEmailCooldown,
  onPhoneInput, phoneString, onPhoneBlur, phoneClientError, phoneServerError,
  onCodeInput, codeString, onCodeBlur, codeClientError, codeServerError, sendTelegramMessageCooldown,
  login, loginClientError, loginServerError, onLoginBlur,
  password, passwordClientError, onPasswordBlur,
  step, handleSendEmailVerification, handleSendPhoneVerification, goToNextStep, register
} = useRegistrationForm(isProcessing)

const { 
  googleClient
} = useGoogleAuth(isProcessing)

const handleGoogleRegistration = () => {
  isProcessing.value = true
  googleClient.requestCode()
}
</script>

<template>
  <p class="text-3xl font-semibold cursor-default">{{ theUserLoggedInOnce ? "Снова знакомимся?" : "Давайте знакомиться" }}</p>
  <p class="text-sm text-white/60 mt-1 mb-6 cursor-default">Расскажите нам о себе</p>
  <form
    v-if="step === 1"
    @submit.prevent="goToNextStep"
    class="flex flex-col"
  >
    <label for="name" class="text-sm font-medium pb-1 self-start">Отображаемое имя</label>
    <input 
      v-model="name"
      @blur="onNameBlur"
      :disabled="isProcessing"
      id="name"
      autocomplete="name"
      type="text"
      maxlength="30"
      placeholder="Гуру успешного успеха 😎💸"
      class="w-full placeholder:text-white/40 bg-[#060e0b] rounded-lg p-3 px-4 border border-[#1c2e28]
      focus-visible:outline-none focus-visible:border-[#13d373] focus-visible:shadow-[0_0_6px_#13d373] transition-all"
    >
    <InputError :clientError="nameClientError" />
    <label for="username" class="text-sm font-medium pb-1 mt-4 self-start">Имя пользователя</label>
    <input 
      v-model="username"
      @blur="onUsernameBlur"
      :disabled="isProcessing"
      id="username"
      type="text"
      maxlength="30"
      placeholder="username"
      class="w-full placeholder:text-white/40 bg-[#060e0b] rounded-lg p-3 px-4 border border-[#1c2e28]
      focus-visible:outline-none focus-visible:border-[#13d373] focus-visible:shadow-[0_0_6px_#13d373] transition-all"
    >
    <InputError :clientError="usernameClientError" :serverError="usernameServerError" />
    <p class="text-sm text-white/60 mt-4 mb-6">Вас смогут найти по @{{ username || "username" }}</p>
    <AppButton
      variant="primary"
      type="submit"
      :disabled="isProcessing"
    >
      Далее
    </AppButton>
  </form>
  <form
    v-if="step === 2"
    @submit.prevent="goToNextStep"
    class="flex flex-col"
    novalidate
  >
    <label for="email" class="text-sm font-medium pb-1 self-start">Email</label>
    <div 
      :class="isProcessing ? 'pointer-events-none' : ''"
      class="group flex items-center w-full bg-[#060e0b] rounded-lg border border-[#1c2e28]
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
        class="flex-1 placeholder:text-white/40 bg-transparent p-3 px-4 focus-visible:outline-none"
      >
      <div class="w-px h-6 transition-all bg-[#1c2e28] group-focus-within:bg-[#13d373] group-focus-within:shadow-[0_0_6px_#13d373]" />
      <AppButton
        variant="icon"
        @click="handleSendEmailVerification"
        @mousedown.prevent
        :disabled="isProcessing || isEmailVerified || !!sendEmailCooldown"
        class="m-1 mr-1.5 flex flex-col items-center"
      >
        <Mail :class="!!sendEmailCooldown && !isEmailVerified ? 'size-5 -mb-0.5' : 'size-8 p-1'"/>
        <p v-if="!!sendEmailCooldown && !isEmailVerified" class="-mb-1">
          {{ sendEmailCooldown }}
        </p>
      </AppButton>
    </div>
    <InputError :clientError="emailClientError" :serverError="emailServerError" />
    <label for="phone" class="text-sm font-medium pb-1 mt-4 self-start">Номер телефона</label>
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
    <p class="text-sm text-white/60 mt-4 mb-6">Достаточно указать одно из полей</p>
    <div class="flex gap-6">
      <AppButton
        variant="secondary"
        @click="step = 1"
        :disabled="isProcessing"
        class="flex-1"
      >
        Назад
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
  <form
    v-if="step === 2.5"
    @submit.prevent="goToNextStep"
    class="flex flex-col"
  >
    <label for="code" class="text-sm font-medium pb-1 self-start">Код подтверждения</label>
    <div 
      :class="isProcessing ? 'pointer-events-none' : ''"
      class="group flex items-center w-full bg-[#060e0b] rounded-lg border border-[#1c2e28]
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
        class="flex-1 placeholder:text-white/40 bg-transparent p-3 px-4 focus-visible:outline-none"
      >
      <div class="w-px h-6 transition-all bg-[#1c2e28] group-focus-within:bg-[#13d373] group-focus-within:shadow-[0_0_6px_#13d373]" />
      <AppButton
        variant="icon"
        @click="handleSendPhoneVerification"
        @mousedown.prevent
        :disabled="isProcessing || !!sendTelegramMessageCooldown"
        class="m-1 mr-1.5 flex flex-col items-center"
      >
        <TelegramIcon :class="sendTelegramMessageCooldown ? 'size-6 -mb-1' : 'p-1.25'"/>
        <p v-if="!!sendTelegramMessageCooldown" class="-mb-0.5">
          {{ sendTelegramMessageCooldown }}
        </p>
      </AppButton>
    </div>
    <InputError :clientError="codeClientError" :serverError="codeServerError" />
    <p class="text-sm text-white/60 mt-4 mb-6">
      Чтобы получить код:<br>
      1. Перейдите в Telegram-бота — 
      <a 
        href="https://t.me/rovely_bot" 
        target="_blank" 
        :class="isProcessing ? 'pointer-events-none' : ''"
        class="font-medium text-[#13d373] hover:underline focus-visible:outline-none focus-visible:underline"
      >
        @rovely_bot
      </a><br>
      2. Активируйте его нажав на кнопку либо через /start<br>
      3. Кнопкой отправьте боту свой номер телефона<br>
      4. Нажмите на самолетик справа от поля ввода кода
    </p>
    <div class="flex gap-6">
      <AppButton
        variant="secondary"
        @click="step = 2"
        :disabled="isProcessing"
        class="flex-1"
      >
        Назад
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
  <form
    v-if="step === 3"
    @submit="register"
    class="flex flex-col"
  >
    <label for="login" class="text-sm font-medium pb-1 self-start">Логин</label>
    <input 
      v-model="login"
      @blur="onLoginBlur"
      :disabled="isProcessing"
      id="login"
      type="text"
      maxlength="50"
      placeholder="NayOne"
      class="
      w-full placeholder:text-white/40 bg-[#060e0b] rounded-lg p-3 px-4 border border-[#1c2e28]
      focus-visible:outline-none focus-visible:border-[#13d373] focus-visible:shadow-[0_0_6px_#13d373] transition-all
      "
    >
    <InputError :clientError="loginClientError" :serverError="loginServerError" />
    <label for="password" class="text-sm font-medium pb-1 mt-4 self-start">Пароль</label>
    <div 
      :class="isProcessing ? 'pointer-events-none' : ''"
      class="
      group flex items-center w-full bg-[#060e0b] rounded-lg border border-[#1c2e28]
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
        class="flex-1 bg-transparent p-3 px-4 focus-visible:outline-none"
      >
      <div class="w-px h-6 transition-all bg-[#1c2e28] group-focus-within:bg-[#13d373] group-focus-within:shadow-[0_0_6px_#13d373]" />
      <AppButton
        variant="icon"
        @click="showPassword = !showPassword"
        @mousedown.prevent
        :disabled="isProcessing"
        class="m-1 mr-1.5"
        :class="showPassword ? 'p-1' : 'p-2'"
      >
        <component 
          :is="showPassword ? Eye : EyeOff"
          :class="showPassword ? 'size-7' : 'size-6'"
        />
      </AppButton>
    </div>
    <InputError :clientError="passwordClientError" />
    <p class="text-sm text-white/60 mt-4 mb-6">
      <span>Регистрируясь, вы принимаете </span> 
      <RouterLink 
        :to="{ name: 'Terms' }" 
        target="_blank"
        :tabindex="isProcessing ? -1 : 0"
        :class="isProcessing ? 'pointer-events-none' : ''"
        class="text-[#13d373] hover:underline focus-visible:outline-none focus-visible:underline"
      >
        условия</RouterLink> <!-- if you move </RouterLink> to a new line, the space before "и" will also be underlined -->
      <span> и </span> 
      <RouterLink 
        :to="{ name: 'Privacy' }" 
        target="_blank"
        :tabindex="isProcessing ? -1 : 0"
        :class="isProcessing ? 'pointer-events-none' : ''"
        class="text-[#13d373] hover:underline focus-visible:outline-none focus-visible:underline"
      >
        политику
      </RouterLink>
    </p>
    <div class="flex gap-6">
      <AppButton
        variant="secondary"
        @click="step = 2"
        :disabled="isProcessing"
        class="flex-1"
      >
        Назад
      </AppButton>
      <AppButton
        variant="primary"
        type="submit"
        :disabled="isProcessing"
        class="flex-1"
      >
        Завершить
      </AppButton>
    </div>
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
    @click="handleGoogleRegistration"
    :disabled="isProcessing"
    class="w-full"
  >
    <GoogleIcon class="size-5" />
    Продолжить с Google
  </AppButton>
</template>