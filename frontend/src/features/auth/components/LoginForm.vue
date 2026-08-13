<script setup lang="ts">
import { storeToRefs } from "pinia"
import { useAuthStore } from "@/stores"
import { useLoginForm } from "../composables/useLoginForm"
import { useGoogleAuth } from "../composables/useGoogleAuth"
import { AuthFormHeader, AppCheckbox, AppTextLink, AppButton, AuthDivider } from "@/shared/components/ui"
import { IdentifierField, PasswordField } from "@/shared/components/ui/fields"
import { Phone } from "@lucide/vue"
import { GoogleIcon } from "@/shared/components/icons"

const { theUserLoggedInOnce, rememberMe, isProcessing } = storeToRefs(useAuthStore())

const { 
  identifier, identifierServerError,
  password, passwordServerError,
  login
} = useLoginForm()

const { 
  googleClient
} = useGoogleAuth()

const handleGoogleLogin = () => {
  isProcessing.value = true
  googleClient.requestCode()
}
</script>

<template>
  <AuthFormHeader
    :title="theUserLoggedInOnce ? 'О, знакомое лицо' : 'Знакомы?'"
    subtitle="Войдите в аккаунт"
  />
  <form @submit.prevent="login">
    <IdentifierField
      :field="identifier"
      :disabled="isProcessing"
      :serverError="identifierServerError"
    />
    <PasswordField
      :field="password"
      :disabled="isProcessing"
      :serverError="passwordServerError"
      class="mt-4"
    />
    <div class="flex justify-between mt-4">
      <AppCheckbox
        v-model="rememberMe"
        :disabled="isProcessing"
      >
        Запомнить меня
      </AppCheckbox>
      <AppTextLink
        :to="{ name: 'PasswordRecovery' }"
        :disabled="isProcessing"
        class="text-sm"
      >
        Забыли пароль?
      </AppTextLink>
    </div>
    <AppButton
      variant="primary"
      type="submit"
      :disabled="isProcessing"
      class="mt-6"
    >
      Войти
    </AppButton>
  </form>
  <AuthDivider />
  <AppButton
    variant="social"
    :to="{ name: 'LoginWithPhone' }"
    :disabled="isProcessing"
  >
    <Phone class="size-5.5 text-brand" />
    Войти по номеру телефона
  </AppButton>
  <AppButton
    variant="social"
    @click="handleGoogleLogin"
    :disabled="isProcessing"
    class="w-full mt-4"
  >
    <GoogleIcon class="size-5" />
    Войти через Google
  </AppButton>
</template>