<script setup lang="ts">

type ButtonVariant = "primary" | "secondary" | "outline" | "icon"

const baseClasses = "not-disabled:cursor-pointer focus:outline-none transition-all duration-200"

const variantClasses: Record<ButtonVariant, string> = {
  primary: "",
  secondary: "",
  outline: "",
  icon: "flex justify-center items-center size-10 text-white/60 not-disabled:hover:text-white focus-visible:text-white"
}

defineProps<{
  variant: ButtonVariant
}>()
</script>

<template>
  <button
    type="button"
    :class="[
      baseClasses,
      variantClasses[variant]
    ]"
  >
    <slot />
  </button>
</template>