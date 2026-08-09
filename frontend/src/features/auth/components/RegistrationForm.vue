<script setup lang="ts">
import { useLocalStorage } from "@vueuse/core"
import { useRegistrationForm } from "../composables/useRegistrationForm"
import { useGoogleAuth } from "../composables/useGoogleAuth"
import { InputError, AppButton } from "@/shared/components/ui"
import { Mail } from "@lucide/vue"
import { GoogleIcon } from "@/shared/components/icons"
import { NameFiend, UsernameField, PhoneField, CodeField, PasswordField } from "@/shared/components/ui/fields"

const isProcessing = defineModel<boolean>({ default: false })
const theUserLoggedInOnce = useLocalStorage("theUserLoggedInOnce", false)

const {
  name,
  username, usernameServerError,
  email, emailClientError, emailServerError, onEmailBlur, isEmailVerified, sendEmailCooldown,
  phone, phoneServerError,
  code, codeServerError, sendTelegramMessageCooldown,
  login, loginClientError, loginServerError, onLoginBlur,
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
  <p class="text-sm text-white/60 mt-1 mb-6 cursor-default">Расскажите нам о себе</p>
  <form
    v-if="step === 1"
    @submit.prevent="goToNextStep"
    class="flex flex-col"
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
    <p class="text-sm text-white/60 mt-4 mb-6">Вас смогут найти по @{{ username.value.value || "username" }}</p>
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
      class="group flex items-center w-full bg-[#070908] rounded-[13.5px] border border-[#222a27]
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
        class="flex-1 placeholder:text-white/40 bg-transparent px-4 py-2.75 focus-visible:outline-none"
      >
      <div class="w-px h-6 transition-all bg-[#222a27] group-focus-within:bg-[#13d373] group-focus-within:shadow-[0_0_6px_#13d373]" />
      <AppButton
        variant="icon"
        @click="handleSendEmailVerification"
        :disabled="isProcessing || isEmailVerified || !!sendEmailCooldown"
        class="m-0.75 mr-1.25 flex flex-col items-center"
      >
        <Mail :class="!!sendEmailCooldown && !isEmailVerified ? 'size-5 -mb-0.5' : 'size-8 p-1'"/>
        <p v-if="!!sendEmailCooldown && !isEmailVerified" class="-mb-1">
          {{ sendEmailCooldown }}
        </p>
      </AppButton>
    </div>
    <InputError :clientError="emailClientError" :serverError="emailServerError" />
    <PhoneField
      :field="phone"
      :serverError="phoneServerError"
      :disabled="isProcessing"
      class="mt-4"
    />
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
    <CodeField
      :field="code"
      @click="handleSendPhoneVerification"
      :cooldown="sendTelegramMessageCooldown"
      :disabled="isProcessing"
      :serverError="codeServerError"
    />
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
      w-full placeholder:text-white/40 bg-[#070908] rounded-[13.5px] px-4 py-2.75 border border-[#222a27]
      focus-visible:outline-none focus-visible:border-[#13d373] focus-visible:shadow-[0_0_6px_#13d373] transition-all
      "
    >
    <InputError :clientError="loginClientError" :serverError="loginServerError" />
    <PasswordField 
      :field="password"
      :disabled="isProcessing"
      class="mt-4"
    />
    <p class="text-sm text-white/60 mt-4 mb-6">
      <span>Регистрируясь, вы принимаете </span> 
      <RouterLink 
        :to="{ name: 'Terms' }" 
        target="_blank"
        :tabindex="isProcessing ? -1 : 0"
        :class="isProcessing ? 'pointer-events-none' : ''"
        class="font-medium text-[#13d373] hover:underline focus-visible:outline-none focus-visible:underline"
      >
        условия</RouterLink> <!-- if you move </RouterLink> to a new line, the space before "и" will also be underlined -->
      <span> и </span> 
      <RouterLink 
        :to="{ name: 'Privacy' }" 
        target="_blank"
        :tabindex="isProcessing ? -1 : 0"
        :class="isProcessing ? 'pointer-events-none' : ''"
        class="font-medium text-[#13d373] hover:underline focus-visible:outline-none focus-visible:underline"
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