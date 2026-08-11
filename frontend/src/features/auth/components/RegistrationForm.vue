<script setup lang="ts">
import { useLocalStorage } from "@vueuse/core"
import { useRegistrationForm } from "../composables/useRegistrationForm"
import { useGoogleAuth } from "../composables/useGoogleAuth"
import { AuthFormHeader, AppButton, AppTextLink, AuthDivider } from "@/shared/components/ui"
import { 
  NameFiend, UsernameField, EmailField, PhoneField, CodeField, LoginField, PasswordField 
} from "@/shared/components/ui/fields"
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
  <AuthFormHeader
    :title="theUserLoggedInOnce ? 'Снова знакомимся?' : 'Давайте знакомиться'"
    subtitle="Расскажите о себе"
  />
  <form v-if="step === 1" @submit.prevent="goToNextStep">
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
    <p class="text-hint mt-4">Вас смогут найти по @{{ username.value.value || "username" }}</p>
    <AppButton
      variant="primary"
      type="submit"
      :disabled="isProcessing"
      class="mt-6"
    >
      Далее
    </AppButton>
  </form>
  <form v-if="step === 2" @submit.prevent="goToNextStep" novalidate>
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
    <p class="text-hint mt-4">Достаточно указать одно из полей</p>
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
  <form v-if="step === 2.5" @submit.prevent="goToNextStep">
    <CodeField
      :field="code"
      @click="handleSendPhoneVerification"
      :cooldown="sendTelegramMessageCooldown"
      :disabled="isProcessing"
      :serverError="codeServerError"
    />
    <div class="text-hint mt-4">
      <p>Чтобы получить код:</p>
      <p>
        1. Перейдите в Telegram-бота —
        <AppTextLink
          href="https://t.me/rovely_bot" 
          target="_blank"
          :disabled="isProcessing"
        >
          @rovely_bot
      </AppTextLink>
      </p>
      <p>2. Активируйте его нажав на кнопку либо через /start</p>
      <p>3. Кнопкой отправьте боту свой номер телефона</p>
      <p>4. Нажмите на самолетик справа от поля ввода кода</p>
    </div>
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
  <form v-if="step === 3" @submit="register">
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
    <p class="text-hint mt-4">
      <span>Регистрируясь, вы принимаете </span>
      <AppTextLink
        :to="{ name: 'Terms' }" 
        target="_blank"
        :disabled="isProcessing"
        class="text-sm"
      >
        условия</AppTextLink> <!-- if you move </AppTextLink> to a new line, the space before "и" will also be underlined -->
      <span> и </span>
      <AppTextLink
        :to="{ name: 'Privacy' }" 
        target="_blank"
        :disabled="isProcessing"
        class="text-sm"
      >
        политику
      </AppTextLink>
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
  <AuthDivider />
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