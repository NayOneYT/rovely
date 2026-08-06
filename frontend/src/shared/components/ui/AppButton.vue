<script setup lang="ts">
import {RouterLink, type RouteLocationRaw } from "vue-router"


type ButtonVariant = "primary" | "secondary" | "outline" | "icon"

const baseClasses = "flex justify-center items-center select-none cursor-pointer focus:outline-none transition-all duration-200"

const variantClasses: Record<ButtonVariant, string> = {
  primary: "text-black text-lg font-bold px-3.5 py-2 rounded-full bg-[#13d373] hover:shadow-[0_0_15px_#13d373] focus-visible:shadow-[0_0_15px_#13d373]",
  secondary: "text-white/60 text-lg font-normal px-3.5 py-2 rounded-full bg-[#060e0b] hover:text-white focus-visible:text-white",
  outline: "",
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