<script setup lang="ts">
defineProps<{
  clientError?: string,
  serverError?: string
}>()
</script>

<template>
  <Transition
    enterActiveClass="transition-all ease-out duration-200"
    enterFromClass="opacity-0 -translate-y-2"
    enterToClass="opacity-100 translate-y-0"
    leaveActiveClass="transition-all ease-in duration-200"
    leaveFromClass="opacity-100 translate-y-0"
    leaveToClass="opacity-0 -translate-y-2"
  >
    <p 
      v-if="serverError || clientError" 
      role="alert"
      class="text-sm mt-1 "
      :class="serverError? 'text-text-danger' : 'text-text-warning'"
    >
      {{ serverError || clientError }}
    </p>
  </Transition>
</template>