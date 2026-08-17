<script setup lang="ts">
import LoginForm from "./LoginForm.vue"
import LoginWithPhoneForm from "./LoginWithPhoneForm.vue"
import RegistrationForm from "./RegistrationForm.vue"
import PasswordRecoveryForm from "./PasswordRecoveryForm.vue"
import { useRoute } from "vue-router"
import { computed } from "vue"
import { storeToRefs } from "pinia"
import { useAuthStore } from "../auth.store.ts"

const formsMap = {
  Login: LoginForm,
  LoginWithPhone: LoginWithPhoneForm,
  Registration: RegistrationForm,
  PasswordRecovery: PasswordRecoveryForm
}
type FormMapKey = keyof typeof formsMap
const route = useRoute()

const currentForm = computed(() => formsMap[route.name as FormMapKey])
const isLogin = computed(() => currentForm.value === LoginForm || currentForm.value === LoginWithPhoneForm)
const isRegistration = computed(() => currentForm.value === RegistrationForm)
const { isProcessing } = storeToRefs(useAuthStore())
</script>

<template>
  <div class="w-full bg-card border border-border rounded-[64px] p-10">
    <nav 
      v-if="currentForm !== PasswordRecoveryForm"
      class="relative flex mb-6 bg-bg rounded-full select-none"
    >
      <div
        class="absolute top-0 bottom-0 w-1/2 border border-brand rounded-full transition-all duration-200"
        :class="isRegistration ? 'translate-x-full' : 'translate-x-0'"
      />
      <RouterLink
        :to="{ name: 'Login' }"
        :tabindex="isProcessing || isLogin ? -1 : 0"
        class="relative w-full text-center px-5 py-3 transition-all duration-200" 
        :class="[
          isLogin 
            ? 'text-text-main pointer-events-none' 
            : 'text-text-muted cursor-pointer hover:text-text-main focus-visible:text-text-main',
          isProcessing && !isLogin ? 'pointer-events-none opacity-50' : ''
        ]"
      >
        Вход
      </RouterLink>
      <RouterLink
        :to="{ name: 'Registration' }"
        :tabindex="isProcessing || isRegistration ? -1 : 0"
        class="relative w-full text-center px-5 py-3 transition-all duration-200"
        :class="[
          isRegistration
            ? 'text-text-main pointer-events-none' 
            : 'text-text-muted cursor-pointer hover:text-text-main focus-visible:text-text-main',
          isProcessing && !isRegistration ? 'opacity-50 pointer-events-none' : ''
        ]"
      >
        Регистрация
      </RouterLink>
    </nav>
    <component :is="currentForm" />
  </div>
</template>