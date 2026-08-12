<script setup lang="ts">
import { Check } from "@lucide/vue"

const model = defineModel<boolean>()

defineProps<{
  disabled?: boolean
}>()
</script>

<template>
  <label 
    class="group flex items-center gap-1.5 text-sm font-medium"
    :class="disabled ? 'opacity-50' : 'cursor-pointer'"
  >
    <input 
      type="checkbox" 
      v-model="model"
      :disabled
      class="peer sr-only"
    >
    <div
      class="
        flex items-center size-5 bg-bg rounded-[4.75px] border border-border text-bg
        transition-all duration-200
      "
      :class="disabled ? '' : `
        peer-focus-visible:border-brand group-hover:border-brand peer-checked:border-brand 
        peer-focus-visible:shadow-glow group-hover:shadow-glow peer-checked:bg-brand
      `"
    >
      <Check class="stroke-4 -mb-px" />
    </div>
    <slot />
  </label>
</template>