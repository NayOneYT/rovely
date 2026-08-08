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
    :class="disabled ? '' : 'cursor-pointer'"
  >
    <input 
      type="checkbox" 
      v-model="model"
      :disabled
      class="peer sr-only"
    >
    <div
      class="flex items-center size-5 bg-[#070908] rounded-[4.75px] border border-[#222a27] text-[#070908] transition-all duration-200"
      :class="disabled ? '' : `
        peer-focus-visible:border-[#13d373] group-hover:border-[#13d373] peer-checked:border-[#13d373] 
        peer-focus-visible:shadow-[0_0_6px_#13d373] group-hover:shadow-[0_0_6px_#13d373] peer-checked:bg-[#13d373]
      `"
    >
      <Check class="stroke-4 -mb-px" />
    </div>
    <slot />
  </label>
</template>