<script setup lang="ts">
import { useUsernameField } from "@/shared/composables/fields"
import AppField from "./AppField.vue"

defineProps<{
  field: ReturnType<typeof useUsernameField>
  disabled?: boolean
  serverError?: string
}>()
</script>

<template>
  <AppField
    label="Имя пользователя"
    id="username"
    placeholder="username"
    autocomplete="username"
    maxlength="30"
    v-model="field.value.value"
    @blur="field.onBlur"
    :disabled
    :clientError="field.clientError.value"
    :serverError
  />
</template>