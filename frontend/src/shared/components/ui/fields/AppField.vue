<script setup lang="ts">
import FieldLabel from "./FieldLabel.vue"
import FieldError from "./FieldError.vue"

const model = defineModel<string>()

const {
  type = "text"
} = defineProps<{
  id: string
  label: string
  type?: string
  placeholder?: string
  autocomplete?: string
  maxlength?: number | string
  spellcheck?: boolean | "true" | "false"
  disabled?: boolean
  clientError?: string
  serverError?: string
}>()

const emit = defineEmits<{
  input: [event: Event]
  blur: []
}>()
</script>

<template>
  <FieldLabel v-bind="$attrs" :for="id" :label />
  <input
    :type
    :id
    :placeholder
    :autocomplete
    :maxlength
    :spellcheck
    v-model="model"
    @input="(event) => emit('input', event)"
    @blur="emit('blur')"
    :disabled
    class="
      w-full placeholder:text-white/40 bg-[#070908] rounded-[13.5px] px-4 py-2.75 border border-[#222a27]
      focus-visible:outline-none focus-visible:border-[#13d373] focus-visible:shadow-[0_0_6px_#13d373] 
      transition-all duration-200
    "
  >
  <FieldError :clientError :serverError />
</template>