<script setup lang="ts">
import { useLoginField } from "@/shared/composables/fields"
import AppField from "./AppField.vue"

defineProps<{
  field: ReturnType<typeof useLoginField>
  disabled?: boolean
  serverError?: string
}>()
</script>

<template>
  <AppField
    label="Логин"
    id="login"
    placeholder="login"
    autocomplete="username"
    maxlength="50"
    v-model="field.value.value"
    @blur="field.onBlur"
    :disabled
    :clientError="field.clientError.value"
    :serverError
  />
</template>