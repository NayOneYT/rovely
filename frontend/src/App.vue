<script setup lang="ts">
import { Toaster } from "vue-sonner"
import 'vue-sonner/style.css'
</script>

<template>
  <Toaster 
    rich-colors
    position="top-center"
    :close-button=true
    close-button-position="top-right"
    theme="dark"
  />
  <RouterView></RouterView>
</template>