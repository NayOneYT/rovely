<script setup lang="ts">
import { usePhoneField } from "@/shared/composables/fields";
import { InputError } from ".."

const {
  label = "Телефон"
} = defineProps<{
  label?: string
  field: ReturnType<typeof usePhoneField>
  disabled?: boolean
  serverError?: string
}>()
</script>

<template>
  <div>
    <label for="phone" class="text-sm font-medium pb-1 self-start">{{ label }}</label>
    <input
      type="tel"
      autocomplete="tel"
      id="phone"
      placeholder="+375 29 123 45 67"
      :value="field.value.value"
      @input="field.onInput"
      @blur="field.onBlur"
      :disabled
      class="
        w-full placeholder:text-white/40 bg-[#070908] rounded-[13.5px] px-4 py-2.75 border border-[#222a27]
        focus-visible:outline-none focus-visible:border-[#13d373] focus-visible:shadow-[0_0_6px_#13d373] transition-all duration-200
      "
    >
    <InputError :clientError="field.clientError.value" :serverError />
  </div>
</template>