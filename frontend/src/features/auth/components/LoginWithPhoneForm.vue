<script setup lang="ts">
import { useLocalStorage } from "@vueuse/core"
import { useLoginWithPhoneForm } from "../composables/useLoginWithPhoneForm"
import { useGoogleAuth } from "../composables/useGoogleAuth"
import { PhoneField, CodeField } from "@/shared/components/ui/fields"
import { AppCheckbox, AppButton } from "@/shared/components/ui"
import { RectangleEllipsis } from "@lucide/vue"
import { GoogleIcon } from "@/shared/components/icons"

const isProcessing = defineModel<boolean>({ default: false })
const theUserLoggedInOnce = useLocalStorage("theUserLoggedInOnce", false)

const {
  phone, phoneServerError,
  code, codeServerError, sendCooldown,
  rememberMe,
  login, send
} = useLoginWithPhoneForm(isProcessing)

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
    <PhoneField
      :field="phone"
      :disabled="isProcessing"
      :serverError="phoneServerError"
    />
    <CodeField
      :field="code"
      @click="send"
      :cooldown="sendCooldown"
      :disabled="isProcessing"
      :serverError="codeServerError"
      class="mt-4"
    />
    <AppCheckbox
      v-model="rememberMe"
      :disabled="isProcessing"
      class="mt-4"
    >
      Запомнить меня
    </AppCheckbox>
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
    :to="{ name: 'Login' }"
    :disabled="isProcessing"
    class="mt-6"
  >
    <RectangleEllipsis class="size-6 text-brand" />
    Войти с паролем
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