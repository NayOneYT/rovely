<script setup lang="ts">
defineProps<{
  for: string
  label: string
  disabled?: boolean
}>()
</script>

<template>
  <label
    :for
    class="text-sm font-medium select-none pb-1 self-start"
    :class="disabled ? 'opacity-50' : ''"
  >
    {{ label }}
  </label>
</template>