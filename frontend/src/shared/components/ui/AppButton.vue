<script setup lang="ts">
import {RouterLink, type RouteLocationRaw } from "vue-router"


type ButtonVariant = "primary" | "secondary" | "social" | "icon"

const baseClasses = "flex justify-center items-center select-none cursor-pointer transition-all duration-200"

const variantClasses: Record<ButtonVariant, string> = {
  primary: `
    text-text-dark text-base font-bold px-5 py-3 rounded-full bg-brand
    hover:shadow-glow-lg focus-visible:shadow-glow-lg
  `,
  secondary: `
    text-text-muted text-base font-normal px-5 py-3 rounded-full bg-bg 
    hover:text-text-main focus-visible:text-text-main
  `,
  social: `
    text-text-main text-base font-normal px-4 py-2.75 border border-border rounded-full bg-bg gap-2 
    hover:border-brand hover:shadow-glow 
    focus-visible:border-brand focus-visible:shadow-glow
  `,
  icon: "text-sm size-10 text-text-muted hover:text-text-main focus-visible:text-text-main"
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