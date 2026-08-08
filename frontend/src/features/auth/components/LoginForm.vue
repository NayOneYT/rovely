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
  <p class="text-sm text-white/60 mt-1 mb-6 cursor-default">Войдите в аккаунт</p>
  <form @submit.prevent="login" class="flex flex-col">
    <IdentifierField
      :field="identifier"
      :serverError="identifierServerError"
      :disabled="isProcessing"
    />
    <PasswordField
      :field="password"
      :serverError="passwordServerError"
      :disabled="isProcessing"
      class="mt-4"
    />
    <div class="flex justify-between mt-4 mb-6">
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
        class="text-sm font-medium text-[#13d373] hover:underline focus-visible:outline-none focus-visible:underline"
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