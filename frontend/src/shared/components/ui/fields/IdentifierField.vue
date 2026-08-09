<script setup lang="ts">
import { useIdentifierField } from "@/shared/composables/fields/useIdentifierField"
import AppField from "./AppField.vue"

defineProps<{
  field: ReturnType<typeof useIdentifierField>
  disabled?: boolean
  serverError?: string
}>()
</script>

<template>
  <AppField
    label="Логин, email или номер телефона"
    id="identifier"
    placeholder="login | email@example.com | +375 29 123 45 67"
    autocomplete="username"
    maxlength="254"
    v-model="field.value.value"
    @input="field.onInput"
    @blur="field.onBlur"
    :disabled
    :clientError="field.clientError.value"
    :serverError
  />
</template>