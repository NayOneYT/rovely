<script setup lang="ts">
import { useAuthWidget } from "../composables/useAuthWidget"
import PasswordRecoveryForm from "./PasswordRecoveryForm.vue"
import RegistrationForm from "./RegistrationForm.vue"
import LoginForm from "./LoginForm.vue"
import LoginWithPhoneForm from "./LoginWithPhoneForm.vue"

const { isProcessing, currentForm } = useAuthWidget()
</script>

<template>
  <section class="bg-[#111b18] w-full border border-[#1c2e28] rounded-4xl p-10">
    <div 
      v-if="currentForm !== PasswordRecoveryForm"
      class="relative flex bg-[#060e0b] rounded-4xl select-none mb-6"
    >
      <div 
        class="absolute top-0 bottom-0 w-1/2 bg-[#13d373] rounded-4xl transition-all duration-200"
        :style="{ transform: currentForm === RegistrationForm ? 'translateX(100%)' : 'translateX(0)' }"
      />
      <RouterLink
        :to="currentForm === RegistrationForm ? '/login' : ''"
        :tabindex="isProcessing || (currentForm === LoginForm || currentForm === LoginWithPhoneForm) ? -1 : 0"
        :class="[
          isProcessing || (currentForm === LoginForm || currentForm === LoginWithPhoneForm) ? 'pointer-events-none' : '', 
          currentForm === LoginForm || currentForm === LoginWithPhoneForm 
            ? 'text-[#060e0b] font-semibold' 
            : 'cursor-pointer text-white/60 hover:text-white focus-visible:text-white'
        ]"
        class="relative w-full text-center texl-lg p-3 rounded-4xl transition-all duration-200 focus-visible:outline-none" 
      >
        Вход
      </RouterLink>
      <RouterLink
        :to="`/registration`"
        :tabindex="isProcessing || currentForm === RegistrationForm ? -1 : 0"
        :class="[
          isProcessing || currentForm === RegistrationForm ? 'pointer-events-none' : '', 
          currentForm === RegistrationForm  
            ? 'text-[#060e0b] font-semibold' 
            : 'cursor-pointer text-white/60 hover:text-white focus-visible:text-white'
        ]"
        class="relative w-full text-center texl-lg p-3 rounded-4xl transition-all duration-200 focus-visible:outline-none"
      >
        Регистрация
      </RouterLink>
    </div>
    <component 
      :is="currentForm"
      v-model="isProcessing"
    />
  </section>
</template>