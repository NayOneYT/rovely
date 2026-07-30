<script setup lang="ts">
const letters = [
  { char: "R", duration: 3.5},
  { char: "O", duration: 3},
  { char: "V", duration: 4},
  { char: "E", duration: 5},
  { char: "L", duration: 4.5},
  { char: "Y", duration: 3.75},
]
</script>

<template>
  <div>
    <span 
      v-for="(letter, index) in letters" 
      :key="index" 
      class="logo-letter cursor-default select-none"
      :style="{
        animationDuration: `${letter.duration}s`,
        animationDelay: `${-letter.duration * (index / 6)}s`
      }"
    >
      {{ letter.char }}
    </span>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Exo+2:ital,wght@0,100..900;1,100..900&display=swap');

.logo-letter {
  font-family: "Exo 2", sans-serif;
  font-optical-sizing: auto;
  font-weight: 900;
  transition: text-shadow 0.2s ease;
  animation: shimmer ease-in-out infinite;
  text-shadow: 0 0 6px currentColor;
  padding: 0 4px;
}

.logo-letter:first-of-type {
  padding-left: 0;
}

.logo-letter:last-of-type {
  padding-right: 0;
}

.logo-letter:hover {
  text-shadow: 0 0 50px currentColor;
}

@keyframes shimmer {
  0%   { color: #08eb79; }
  50%  { color: #1a7a42; }
  100% { color: #08eb79; }
}
</style>