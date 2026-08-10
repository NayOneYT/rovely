<script setup lang="ts">
defineProps<{
  title: string
  subtitle: string
}>()
</script>

<template>
  <p class="text-3xl font-semibold">{{ title }}</p>
  <p class="text-hint mt-1 mb-6">{{ subtitle }}</p>
</template>