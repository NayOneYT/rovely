<script setup lang="ts">
import { useLocalStorage } from "@vueuse/core"
import { useLoginForm } from "../composables/useLoginForm"
import { useGoogleAuth } from "../composables/useGoogleAuth"
import { IdentifierField, PasswordField } from "@/shared/components/ui/fields"
import { AppCheckbox, AppButton } from "@/shared/components/ui"
import { Phone } from "@lucide/vue"
import { GoogleIcon } from "@/shared/components/icons"

const isProcessing = defineModel<boolean>({ default: false })
const theUserLoggedInOnce = useLocalStorage("theUserLoggedInOnce", false)

const { 
  identifier, identifierServerError,
  password, passwordServerError,
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
  <p class="text-sm text-text-muted mt-1 cursor-default">Войдите в аккаунт</p>
  <form @submit.prevent="login" class="flex flex-col mt-6">
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
      <RouterLink
        :to="{ name: 'PasswordRecovery' }"
        :tabindex="isProcessing ? -1 : 0"
        :class="isProcessing ? 'pointer-events-none' : ''"
        class="text-sm font-medium text-brand hover:underline focus-visible:underline"
      >
        Забыли пароль?
      </RouterLink>
    </div>
    <AppButton
      variant="primary"
      type="submit"
      :disabled="isProcessing"
      class="mt-6"
    >
      {{ isProcessing ? "Проверка..." : "Войти" }}
    </AppButton>
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
    :to="{ name: 'LoginWithPhone' }"
    :disabled="isProcessing"
    class="mt-6"
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