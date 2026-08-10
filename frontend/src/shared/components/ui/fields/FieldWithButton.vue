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
      group flex items-center w-full bg-bg rounded-[13.5px] border border-border 
      focus-within:border-brand focus-within:shadow-glow transition-all duration-200
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
      class="flex-1 bg-transparent placeholder:text-placeholder px-4 py-2.75"
    >
    <div class="w-px h-6 transition-all bg-border group-focus-within:bg-brand group-focus-within:shadow-glow" />
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