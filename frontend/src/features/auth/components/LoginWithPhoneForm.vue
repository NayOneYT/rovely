<script setup lang="ts">
import { useLocalStorage } from "@vueuse/core"
import { useLoginWithPhoneForm } from "../composables/useLoginWithPhoneForm"
import { useGoogleAuth } from "../composables/useGoogleAuth"
import { PhoneField } from "@/shared/components/ui/fields"
import { InputError, AppCheckbox, AppButton } from "@/shared/components/ui"
import { RectangleEllipsis } from "@lucide/vue"
import { TelegramIcon, GoogleIcon } from "@/shared/components/icons"

const isProcessing = defineModel<boolean>({ default: false })
const theUserLoggedInOnce = useLocalStorage("theUserLoggedInOnce", false)

const {
  phone, phoneServerError,
  codeString, onCodeInput, onCodeBlur, codeClientError, codeServerError, sendCooldown,
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
  <p class="text-sm text-white/60 mt-1 mb-6 cursor-default">Войдите в аккаунт</p>
  <form @submit.prevent="login" class="flex flex-col">
    <PhoneField
      :field="phone"
      :serverError="phoneServerError"
      :disabled="isProcessing"
    />
    <label for="code" class="text-sm font-medium pb-1 mt-4 self-start">Код подтверждения</label>
    <div 
      class="
      group flex items-center w-full bg-[#070908] rounded-[13.5px] border border-[#222a27]
      focus-within:outline-none focus-within:border-[#13d373] focus-within:shadow-[0_0_6px_#13d373] transition-all
      "
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
        class="flex-1 placeholder:text-white/40 bg-transparent px-4 py-2.75 focus-visible:outline-none"
      >
      <div class="w-px h-6 transition-all bg-[#222a27] group-focus-within:bg-[#13d373] group-focus-within:shadow-[0_0_6px_#13d373]" />
      <AppButton
        variant="icon"
        @click="send"
        :disabled="isProcessing || !!sendCooldown"
        class="m-0.75 mr-1.25 flex flex-col items-center"
      >
        <TelegramIcon :class="sendCooldown ? 'size-6 -mb-1' : 'p-1.25'"/>
        <p v-if="!!sendCooldown" class="-mb-0.5">
          {{ sendCooldown }}
        </p>
      </AppButton>
    </div>
    <InputError :clientError="codeClientError" :serverError="codeServerError" />
    <AppCheckbox
      v-model="rememberMe"
      :disabled="isProcessing"
      class="mt-4 mb-6"
    >
      Запомнить меня
    </AppCheckbox>
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
    :to="{ name: 'Login' }"
    :disabled="isProcessing"
  >
    <RectangleEllipsis class="size-6 text-[#13d373]" />
    Войти с паролем
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