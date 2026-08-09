<script setup lang="ts">
import { useLoginField } from "@/shared/composables/fields"
import FieldError from "./FieldError.vue"

defineProps<{
  field: ReturnType<typeof useLoginField>
  disabled?: boolean
  serverError?: string
}>()
</script>

<template>
  <label v-bind="$attrs" for="login" class="text-sm font-medium pb-1 self-start">Логин</label>
  <input
    type="text"
    autocomplete="username"
    id="login"
    maxlength="50"
    placeholder="login"
    v-model="field.value.value"
    @blur="field.onBlur"
    :disabled
    class="
      w-full placeholder:text-white/40 bg-[#070908] rounded-[13.5px] px-4 py-2.75 border border-[#222a27]
      focus-visible:outline-none focus-visible:border-[#13d373] focus-visible:shadow-[0_0_6px_#13d373] transition-all duration-200
    "
  >
  <FieldError :clientError="field.clientError.value" :serverError />
</template>