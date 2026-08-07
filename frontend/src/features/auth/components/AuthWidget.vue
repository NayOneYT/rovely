<script setup lang="ts">
import { useAuthWidget } from "../composables/useAuthWidget"
import PasswordRecoveryForm from "./PasswordRecoveryForm.vue"
import RegistrationForm from "./RegistrationForm.vue"
import LoginForm from "./LoginForm.vue"
import LoginWithPhoneForm from "./LoginWithPhoneForm.vue"

const { isProcessing, currentForm } = useAuthWidget()
</script>

<template>
  <div class="w-full bg-[#101312] border border-[#222a27] rounded-[40px] p-10">
    <nav 
      v-if="currentForm !== PasswordRecoveryForm"
      class="relative flex mb-6 bg-[#070908] rounded-full select-none"
    >
      <div
        class="absolute top-0 bottom-0 w-1/2 bg-[#13d373] rounded-full transition-all duration-200"
        :style="{ transform: currentForm === RegistrationForm ? 'translateX(100%)' : 'translateX(0)' }"
      />
      <RouterLink
        :to="{ name: 'Login' }"
        :tabindex="isProcessing || (currentForm === LoginForm || currentForm === LoginWithPhoneForm) ? -1 : 0"
        :class="[
          isProcessing || (currentForm === LoginForm || currentForm === LoginWithPhoneForm) ? 'pointer-events-none' : '', 
          currentForm === LoginForm || currentForm === LoginWithPhoneForm 
            ? 'text-black font-bold' 
            : 'text-white/60 cursor-pointer hover:text-white focus-visible:text-white'
        ]"
        class="relative w-full text-center px-5 py-3 focus-visible:outline-none transition-all duration-200" 
      >
        Вход
      </RouterLink>
      <RouterLink
        :to="{ name: 'Registration' }"
        :tabindex="isProcessing || currentForm === RegistrationForm ? -1 : 0"
        :class="[
          isProcessing || currentForm === RegistrationForm ? 'pointer-events-none' : '', 
          currentForm === RegistrationForm  
            ? 'text-black font-bold' 
            : 'text-white/60 cursor-pointer hover:text-white focus-visible:text-white'
        ]"
        class="relative w-full text-center px-5 py-3 focus-visible:outline-none transition-all duration-200"
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