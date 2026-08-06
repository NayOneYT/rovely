<script setup lang="ts">
import { useResetPasswordForm } from "../composables/useResetPasswordForm"
import { ref } from "vue"
import { InputError, AppButton } from "@/shared/components/ui"
import { LoaderCircle, Eye, EyeOff } from "@lucide/vue"

const { 
  password, passwordClientError, onPasswordBlur,
  status, reset 
} = useResetPasswordForm()

const showPassword = ref<boolean>(false)
</script>

<template>
  <div
    :class="status === 'READY' || status === 'RESETTING' ? 'w-130' : ''"
    class="z-1 rounded-4xl border border-[#1c2e28] bg-[#111b18] p-10 mt-4 transition-all"
  >
    <p v-if="status === 'CHECKING'">
      <LoaderCircle class="size-10 animate-spin" />
    </p>
    <p 
      v-else-if="status === 'TOKEN_INVALID'"
      class="text-red-400 text-xl"
    >
      Запросите новую ссылку
    </p>
    <form
      v-else-if="status === 'READY' || status === 'RESETTING'"
      @submit.prevent="reset"
      class="flex flex-col"
    >
      <p class="text-3xl font-semibold cursor-default">Сброс пароля</p>
      <p class="text-sm text-white/60 mt-1 mb-6 cursor-default">Введите новый пароль</p>
      <label for="password" class="text-sm font-medium pb-1 self-start">Новый пароль</label>
      <div 
        class="
        group flex items-center w-full bg-[#060e0b] rounded-lg border border-[#1c2e28] 
        focus-within:outline-none focus-within:border-[#13d373] focus-within:shadow-[0_0_6px_#13d373] transition-all
        "
      >
        <input
          v-model="password"
          @blur="onPasswordBlur"
          :disabled="status === 'RESETTING'"
          :type="showPassword ? 'text' : 'password'"
          id="password"
          autocomplete="new-password"
          maxlength="72"
          class="flex-1 bg-transparent p-3 px-4 focus-visible:outline-none"
        >
        <div class="w-px h-6 transition-all bg-[#1c2e28] group-focus-within:bg-[#13d373] group-focus-within:shadow-[0_0_6px_#13d373]" />
        <AppButton
          variant="icon"
          @click="showPassword = !showPassword"
          @mousedown.prevent
          :disabled="status === 'RESETTING'"
          class="m-1 mr-1.5"
          :class="showPassword ? 'p-1' : 'p-2'"
        >
          <component 
            :is="showPassword ? Eye : EyeOff"
            :class="showPassword ? 'size-7' : 'size-6'"
          />
      </AppButton>
      </div>
      <InputError :clientError="passwordClientError" />
      <AppButton
        variant="primary"
        type="submit"
        :disabled="status==='RESETTING'"
        class="mt-6"
      >
        Изменить
      </AppButton>
    </form>
    <p v-else class="text-xl">
      Пароль изменен
    </p>
  </div>
</template>