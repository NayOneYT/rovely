<script setup lang="ts">
import { useAuthWidget } from "../composables/useAuthWidget"
import { computed } from "vue"
import PasswordRecoveryForm from "./PasswordRecoveryForm.vue"
import RegistrationForm from "./RegistrationForm.vue"
import LoginForm from "./LoginForm.vue"
import LoginWithPhoneForm from "./LoginWithPhoneForm.vue"

const { isProcessing, currentForm } = useAuthWidget()

const isLogin = computed<boolean>(() => currentForm.value === LoginForm || currentForm.value === LoginWithPhoneForm)
const isRegistration = computed<boolean>(() => currentForm.value === RegistrationForm)
</script>

<template>
  <div class="w-full bg-card border border-border rounded-[64px] p-10">
    <nav 
      v-if="currentForm !== PasswordRecoveryForm"
      class="relative flex mb-6 bg-bg rounded-full select-none"
    >
      <div
        class="absolute top-0 bottom-0 w-1/2 bg-brand rounded-full transition-all duration-200"
        :class="isRegistration ? 'translate-x-full' : 'translate-x-0'"
      />
      <RouterLink
        :to="{ name: 'Login' }"
        :tabindex="isProcessing || isLogin ? -1 : 0"
        class="relative w-full text-center px-5 py-3 transition-all duration-200" 
        :class="[
          isLogin 
            ? 'text-text-dark font-bold pointer-events-none' 
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
            ? 'text-text-dark font-bold pointer-events-none' 
            : 'text-text-muted cursor-pointer hover:text-text-main focus-visible:text-text-main',
          isProcessing && !isRegistration ? 'opacity-50 pointer-events-none' : ''
        ]"
      >
        Регистрация
      </RouterLink>
    </nav>
    <component 
      :is="currentForm"
      v-model="isProcessing"
    />
  </div>
</template>