<script setup lang="ts">
defineProps<{
  for: string
  label: string
}>()
</script>

<template>
  <label :for class="text-sm font-medium select-none pb-1 self-start">{{ label }}</label>
</template>