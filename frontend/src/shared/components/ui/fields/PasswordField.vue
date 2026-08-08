<script setup lang="ts">
import { usePasswordField } from "@/shared/composables/fields"
import { AppButton, InputError } from ".."
import { Eye, EyeOff } from "@lucide/vue"

defineProps<{
  label?: string
  isNewPassword?: boolean
  field: ReturnType<typeof usePasswordField>
  disabled?: boolean
  serverError?: string
}>()
</script>

<template>
  <div>
    <label for="password" class="text-sm font-medium pb-1 self-start">{{ label ?? (isNewPassword ? "Новый пароль" : "Пароль") }}</label>
    <div 
      class="
        group flex items-center w-full bg-[#070908] rounded-[13.5px] border border-[#222a27] 
        focus-within:outline-none focus-within:border-[#13d373] focus-within:shadow-[0_0_6px_#13d373] transition-all duration-200
      "
    >
      <input
        :type="field.showPassword.value? 'text' : 'password'"
        :autocomplete="isNewPassword ? 'new-password' : 'current-password'"
        id="password"
        maxlength="72"
        v-model="field.value.value"
        @blur="field.onBlur"
        :disabled
        class="flex-1 bg-transparent px-4 py-2.75 focus-visible:outline-none"
      >
      <div class="w-px h-6 transition-all bg-[#222a27] group-focus-within:bg-[#13d373] group-focus-within:shadow-[0_0_6px_#13d373]" />
      <AppButton
        variant="icon"
        @click="field.showPassword.value = !field.showPassword.value"
        :disabled
        class="m-1 mr-1.5"
      >
        <component 
          :is="field.showPassword.value ? Eye : EyeOff"
          :class="field.showPassword.value ? 'size-7' : 'size-6'"
        />
      </AppButton>
    </div>
    <InputError :clientError="field.clientError.value" :serverError />
  </div>
</template>