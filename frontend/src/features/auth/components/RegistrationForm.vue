<script setup lang="ts">
import { useLocalStorage } from "@vueuse/core"
import { useRegistrationForm } from "../composables/useRegistrationForm"
import { useGoogleAuth } from "../composables/useGoogleAuth"
import { NameFiend, UsernameField, EmailField, PhoneField, CodeField, LoginField, PasswordField } from "@/shared/components/ui/fields"
import { AppButton } from "@/shared/components/ui"
import { GoogleIcon } from "@/shared/components/icons"

const isProcessing = defineModel<boolean>({ default: false })
const theUserLoggedInOnce = useLocalStorage("theUserLoggedInOnce", false)

const {
  name,
  username, usernameServerError,
  email, emailServerError, isEmailVerified, sendEmailCooldown,
  phone, phoneServerError,
  code, codeServerError, sendTelegramMessageCooldown,
  login, loginServerError,
  password,
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
  <p class="text-sm text-text-muted mt-1 cursor-default">Расскажите нам о себе</p>
  <form
    v-if="step === 1"
    @submit.prevent="goToNextStep"
    class="flex flex-col mt-6"
  >
    <NameFiend
      :field="name"
      :disabled="isProcessing"
    />
    <UsernameField
      :field="username"
      :disabled="isProcessing"
      :serverError="usernameServerError"
      class="mt-4"
    />
    <p class="text-sm text-text-muted mt-4">Вас смогут найти по @{{ username.value.value || "username" }}</p>
    <AppButton
      variant="primary"
      type="submit"
      :disabled="isProcessing"
      class="mt-6"
    >
      Далее
    </AppButton>
  </form>
  <form
    v-if="step === 2"
    @submit.prevent="goToNextStep"
    class="flex flex-col mt-6"
    novalidate
  >
    <EmailField
      :field="email"
      @click="handleSendEmailVerification"
      :disabled="isProcessing"
      :cooldown="sendEmailCooldown"
      :isEmailVerified
      :serverError="emailServerError"
    />
    <PhoneField
      :field="phone"
      :serverError="phoneServerError"
      :disabled="isProcessing"
      class="mt-4"
    />
    <p class="text-sm text-text-muted mt-4">Достаточно указать одно из полей</p>
    <div class="flex gap-6 mt-6">
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
    class="flex flex-col mt-6"
  >
    <CodeField
      :field="code"
      @click="handleSendPhoneVerification"
      :cooldown="sendTelegramMessageCooldown"
      :disabled="isProcessing"
      :serverError="codeServerError"
    />
    <p class="text-sm text-text-muted mt-4">
      Чтобы получить код:<br>
      1. Перейдите в Telegram-бота — 
      <a 
        href="https://t.me/rovely_bot" 
        target="_blank" 
        :class="isProcessing ? 'pointer-events-none' : ''"
        class="font-medium text-brand hover:underline focus-visible:underline"
      >
        @rovely_bot
      </a><br>
      2. Активируйте его нажав на кнопку либо через /start<br>
      3. Кнопкой отправьте боту свой номер телефона<br>
      4. Нажмите на самолетик справа от поля ввода кода
    </p>
    <div class="flex gap-6 mt-6">
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
    class="flex flex-col mt-6"
  >
    <LoginField
      :field="login"
      :disabled="isProcessing"
      :serverError="loginServerError"
    />
    <PasswordField 
      :field="password"
      :disabled="isProcessing"
      class="mt-4"
    />
    <p class="text-sm text-text-muted mt-4">
      <span>Регистрируясь, вы принимаете </span> 
      <RouterLink 
        :to="{ name: 'Terms' }" 
        target="_blank"
        :tabindex="isProcessing ? -1 : 0"
        :class="isProcessing ? 'pointer-events-none' : ''"
        class="font-medium text-brand hover:underline focus-visible:underline"
      >
        условия</RouterLink> <!-- if you move </RouterLink> to a new line, the space before "и" will also be underlined -->
      <span> и </span> 
      <RouterLink 
        :to="{ name: 'Privacy' }" 
        target="_blank"
        :tabindex="isProcessing ? -1 : 0"
        :class="isProcessing ? 'pointer-events-none' : ''"
        class="font-medium text-brand hover:underline focus-visible:underline"
      >
        политику
      </RouterLink>
    </p>
    <div class="flex gap-6 mt-6">
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
  <div class="flex items-center mt-6">  
    <div class="flex-1 h-px bg-linear-to-r from-transparent via-brand" />
      <span class="text-sm text-text-muted mx-4 select-none">
        или
      </span>
    <div class="flex-1 h-px bg-linear-to-r from-transparent via-brand" />
  </div>
  <AppButton
    variant="social"
    @click="handleGoogleRegistration"
    :disabled="isProcessing"
    class="w-full mt-6"
  >
    <GoogleIcon class="size-5" />
    Продолжить с Google
  </AppButton>
</template>