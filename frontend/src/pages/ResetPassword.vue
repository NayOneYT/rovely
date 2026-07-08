<script setup lang="ts">
import { useResetPasswordForm } from '@/features/auth/composables/useResetPasswordForm'
import SiteLogo from '@/components/SiteLogo.vue'
import InputError from '@/components/InputError.vue';
import { ref } from "vue"
import SvgLoading from '@/components/SvgLoading.vue';
import SvgEyeClosed from '@/components/SvgEyeClosed.vue';
import SvgEyeOpen from '@/components/SvgEyeOpen.vue';

const {
  password, passwordClientError, onPasswordBlur,
  isTokenValid, isProcessing, checkPasswordRecoveryToken, resetPassword
} = useResetPasswordForm()

checkPasswordRecoveryToken()

const showPassword = ref<boolean>(false)
</script>

<template>
  <main class="relative h-screen flex flex-wrap content-center justify-center bg-[#060e0b] text-white">
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_50%,rgb(0,0,0)_100%)]" />
    <SiteLogo class="text-5xl relative w-full flex justify-center -mt-12" />
    <section 
      :class="isTokenValid ? 'w-130' : ''"
      class="rounded-4xl border border-[#1c2e28] bg-[#111b18] p-10 backdrop-blur-xs mt-4 transition-all"
    >
      <p v-if="isProcessing && !isTokenValid">
        <SvgLoading class="size-10" />
      </p>
      <p 
        v-else-if="!isTokenValid"
        class="text-red-400 text-xl"
      >
        Запросите новую ссылку
      </p>
      <form
        v-else
        @submit="resetPassword"
        class="flex flex-col"
      >
        <p class="text-4xl font-medium cursor-default">Сброс пароля</p>
        <p class="text-white/60 mt-1 mb-8 cursor-default">Введите новый пароль</p>
        <label for="password" class="texl-lg pb-0.5 self-start">Пароль</label>
        <div 
          class="
          group flex items-center w-full bg-[#060e0b] rounded-2xl border border-[#1c2e28] 
          focus-within:outline-none focus-within:border-[#13d373] focus-within:shadow-[0_0_6px_#13d373] transition-all
          "
        >
          <input
            v-model="password"
            @blur="onPasswordBlur"
            :disabled="isProcessing"
            :type="showPassword ? 'text' : 'password'"
            id="password"
            autocomplete="current-password"
            maxlength="72"
            placeholder="Новый пароль"
            class="flex-1 bg-transparent p-3 px-4 focus-visible:outline-none"
          >
          <div class="w-px h-6 transition-all bg-[#1c2e28] group-focus-within:bg-[#13d373] group-focus-within:shadow-[0_0_6px_#13d373]" />
          <div class="w-14 px-3 flex items-center justify-center">
            <button
              type="button"
              @click="showPassword = !showPassword"
              @mousedown.prevent
              class="p-3 text-white/60 not-disabled:hover:text-white not-disabled:cursor-pointer transition-all focus-visible:outline-none focus-visible:text-white"
              :disabled="isProcessing"
            >
              <SvgEyeOpen v-if="showPassword" class="size-6" />
              <SvgEyeClosed v-else class="size-6" />
            </button>
          </div>
        </div>
        <InputError :clientError="passwordClientError" />
        <button
          :disabled="isProcessing"
          :class="isProcessing ? 'pointer-events-none' : ''"
          class="w-full self-end relative p-3 mt-6 rounded-4xl bg-[#13d373] text-[#060e0b] overflow-hidden group
          cursor-pointer hover:shadow-[0_0_30px_-10px_#13d373] focus-visible:outline-none focus-visible:shadow-[0_0_30px_-10px_#13d373] transition-all duration-200"
        >
          <span class="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700 skew-x-12 group-focus-visible:translate-x-full" />
          <span class="flex justify-center items-center gap-1 z-10 font-bold texl-lg select-none">
            Далее
          </span>
        </button>
      </form>
    </section>
  </main>
</template>