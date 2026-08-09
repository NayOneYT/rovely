<script setup lang="ts">
import { usePhoneField } from "@/shared/composables/fields";
import AppField from "./AppField.vue"

defineProps<{
  field: ReturnType<typeof usePhoneField>
  disabled?: boolean
  serverError?: string
}>()
</script>

<template>
  <AppField
    label="Телефон"
    id="phone"
    placeholder="+375 29 123 45 67"
    autocomplete="tel"
    v-model="field.value.value"
    @input="field.onInput"
    @blur="field.onBlur"
    :disabled
    :clientError="field.clientError.value"
    :serverError
  />
</template>