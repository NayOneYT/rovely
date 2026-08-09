<script setup lang="ts">
import { useNameField } from "@/shared/composables/fields"
import AppField from "./AppField.vue"

defineProps<{
  field: ReturnType<typeof useNameField>
  disabled?: boolean
}>()
</script>

<template>
  <AppField
    label="Отображаемое имя"
    id="name"
    placeholder="Гуру успешного успеха 😎💸"
    autocomplete="name"
    maxlength="30"
    v-model="field.value.value"
    @blur="field.onBlur"
    :disabled
    :clientError="field.clientError.value"
  />
</template>