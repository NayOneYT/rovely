<script setup lang="ts">
import FieldLabel from "./FieldLabel.vue"
import { AppButton } from ".."
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
  buttonDisabled?: boolean
  clientError?: string
  serverError?: string
}>()

const emit = defineEmits<{
  input: [event: Event]
  blur: []
  click: []
}>()
</script>

<template>
  <FieldLabel v-bind="$attrs" :for="id" :label />
  <div 
    class="
      group flex items-center w-full bg-[#070908] rounded-[13.5px] border border-[#222a27] 
      focus-within:outline-none focus-within:border-[#13d373] focus-within:shadow-[0_0_6px_#13d373] transition-all duration-200
    "
  >
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
      :disabled="disabled"
      class="flex-1 bg-transparent px-4 py-2.75 focus-visible:outline-none"
    >
    <div class="w-px h-6 transition-all bg-[#222a27] group-focus-within:bg-[#13d373] group-focus-within:shadow-[0_0_6px_#13d373]" />
    <AppButton
      variant="icon"
      @click="emit('click')"
      :disabled="disabled || buttonDisabled"
      class="flex flex-col items-center m-0.75 mr-1.25"
    >
      <slot />
    </AppButton>
  </div>
  <FieldError :clientError :serverError />
</template>