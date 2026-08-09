<script setup lang="ts">
import { usePasswordField } from "@/shared/composables/fields"
import FieldWithButton from "./FieldWithButton.vue"
import { Eye, EyeOff } from "@lucide/vue"

defineProps<{
  isNewPassword?: boolean
  field: ReturnType<typeof usePasswordField>
  disabled?: boolean
  serverError?: string
}>()
</script>

<template>
  <FieldWithButton
    :label="isNewPassword ? 'Новый пароль' : 'Пароль'"
    v-model="field.value.value"
    id="password"
    @click="field.showPassword.value = !field.showPassword.value"
    @blur="field.onBlur"
    :type="field.showPassword.value ? 'text' : 'password'"
    :autocomplete="isNewPassword ? 'new-password' : 'current-password'"
    maxlength="72"
    :disabled
    :clientError="field.clientError.value"
    :serverError
  >
    <component 
      :is="field.showPassword.value ? Eye : EyeOff"
      :class="field.showPassword.value ? 'size-7' : 'size-6'"
    />
  </FieldWithButton>
</template>