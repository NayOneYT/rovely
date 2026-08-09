<script setup lang="ts">
import { useIdentifierField } from "@/shared/composables/fields/useIdentifierField"
import FieldError from "./FieldError.vue"

defineProps<{
  field: ReturnType<typeof useIdentifierField>
  disabled?: boolean
  serverError?: string
}>()
</script>

<template>
  <label v-bind="$attrs" for="identifier" class="text-sm font-medium pb-1 self-start">Логин, email или номер телефона</label>
  <input
    type="text"
    autocomplete="username"
    id="identifier"
    maxlength="254"
    placeholder="login | email@example.com | +375 29 123 45 67" 
    spellcheck="false"
    :value="field.value.value"
    @input="field.onInput"
    @blur="field.onBlur"
    :disabled
    class="
      w-full placeholder:text-white/40 bg-[#070908] rounded-[13.5px] px-4 py-2.75 border border-[#222a27]
      focus-visible:outline-none focus-visible:border-[#13d373] focus-visible:shadow-[0_0_6px_#13d373] transition-all duration-200
    "
  >
  <FieldError :clientError="field.clientError.value" :serverError />
</template>