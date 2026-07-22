<script setup lang="ts">
const props = defineProps<{
  clientError?: string,
  serverError?: string
}>()
</script>

<template>
  <Transition name="error">
    <p 
      v-if="serverError || clientError" 
      class="text-[14px]"
      :class="serverError? 'text-red-400' : 'text-yellow-300'"
    >
      {{ serverError || clientError }}
    </p>
  </Transition>
</template>

<style scoped>
.error-enter-active,
.error-leave-active {
  transition: all 0.2s ease;
}
.error-enter-from,
.error-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>