<script setup lang="ts">
import {RouterLink, type RouteLocationRaw } from "vue-router"


type ButtonVariant = "primary" | "secondary" | "social" | "icon"

const baseClasses = "flex justify-center items-center select-none cursor-pointer focus:outline-none transition-all duration-200"

const variantClasses: Record<ButtonVariant, string> = {
  primary: "text-black text-base font-bold px-5 py-3 rounded-full bg-[#13d373] hover:shadow-[0_0_15px_#13d373] focus-visible:shadow-[0_0_15px_#13d373]",
  secondary: "text-white/60 text-base font-normal px-5 py-3 rounded-full bg-[#070908] hover:text-white focus-visible:text-white",
  social: "text-white text-base font-normal px-4 py-2.75 border border-[#222a27] rounded-full bg-[#070908] gap-2 hover:border-[#13d373] hover:shadow-[0_0_6px_#13d373] focus-visible:border-[#13d373] focus-visible:shadow-[0_0_6px_#13d373]",
  icon: "text-sm size-10 text-white/60 hover:text-white focus-visible:text-white"
}

defineProps<{
  variant: ButtonVariant
  to?: RouteLocationRaw
  disabled?: boolean
}>()
</script>

<template>
  <component
    :is="!!to ? RouterLink : 'button'"
    :to="to"
    :type="!!to ? undefined : 'button'"
    @mousedown="(event: MouseEvent) => variant === 'icon' && event.preventDefault()"
    :disabled="!!to ? undefined : disabled"
    :tabindex="disabled ? -1 : 0"
    :class="[
      baseClasses,
      variantClasses[variant],
      disabled ? 'pointer-events-none' : ''
    ]"
  >
    <slot />
  </component>
</template>