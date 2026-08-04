<script setup lang="ts">

type ButtonVariant = "primary" | "secondary" | "outline" | "icon"

const baseClasses = "select-none not-disabled:cursor-pointer focus:outline-none transition-all duration-200"

const variantClasses: Record<ButtonVariant, string> = {
  primary: "flex justify-center items-center text-black text-md font-bold p-3 rounded-full bg-[#13d373] not-disabled:hover:shadow-[0_0_15px_#13d373] focus-visible:shadow-[0_0_15px_#13d373]",
  secondary: "",
  outline: "",
  icon: "text-sm flex justify-center items-center size-10 text-white/60 not-disabled:hover:text-white focus-visible:text-white"
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