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
    theme="system" 
  />
  <RouterView></RouterView>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Chiron+GoRound+TC:wght@200..900&display=swap');

* {
  font-family: "Chiron GoRound TC", sans-serif;
  font-optical-sizing: auto;
  font-weight: 400;
}
</style>