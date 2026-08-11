<script setup lang="ts">
import type { RouteLocationRaw } from "vue-router"

defineProps<{
  to?: RouteLocationRaw
  href?: string
  target?: "_blank"
  disabled?: boolean
}>()
</script>
<template>
  <RouterLink
    v-if="to"
    :to
    :target
    :tabindex="disabled ? -1 : 0"
    :class="disabled ? 'pointer-events-none' : ''"
    class="font-medium text-brand hover:underline focus-visible:underline"
  >
    <slot />
  </RouterLink>
  <a
    v-else-if="href"
    :href
    :target
    :tabindex="disabled ? -1 : 0"
    :class="disabled ? 'pointer-events-none' : ''"
    class="font-medium text-brand hover:underline focus-visible:underline"
  >
    <slot />
  </a>
</template>