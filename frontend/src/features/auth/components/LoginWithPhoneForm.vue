<script setup lang="ts">
import { storeToRefs } from "pinia"
import { useAuthStore } from "@/stores"
import { useLoginWithPhoneForm } from "../composables/useLoginWithPhoneForm"
import { useGoogleAuth } from "../composables/useGoogleAuth"
import { AuthFormHeader, AppCheckbox, AppButton, AuthDivider } from "@/shared/components/ui"
import { PhoneField, CodeField } from "@/shared/components/ui/fields"
import { RectangleEllipsis } from "@lucide/vue"
import { GoogleIcon } from "@/shared/components/icons"

const { theUserLoggedInOnce, rememberMe, isProcessing } = storeToRefs(useAuthStore())

const {
  phone, phoneServerError,
  code, codeServerError, sendCooldown,
  login, send
} = useLoginWithPhoneForm()

const { googleAuth } = useGoogleAuth()
</script>

<template>
  <AuthFormHeader
    :title="theUserLoggedInOnce ? 'О, знакомое лицо' : 'Знакомы?'"
    subtitle="Войдите в аккаунт"
  />
  <form @submit.prevent="login">
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
      Войти
    </AppButton>
  </form>
  <AuthDivider />
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
    @click="googleAuth"
    :disabled="isProcessing"
    class="w-full mt-4"
  >
    <GoogleIcon class="size-5" />
    Войти через Google
  </AppButton>
</template>