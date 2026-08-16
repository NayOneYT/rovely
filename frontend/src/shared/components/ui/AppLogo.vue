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
  <div class="font-logo">
    <span 
      v-for="(letter, index) in letters" 
      :key="index" 
      class="
        cursor-default select-none px-1 first:pl-0 last:pr-0 last:-ml-1 animate-shimmer transition-all duration-200
        text-shadow-[0_0_6px_currentColor] hover:text-shadow-[0_0_50px_currentColor]
      "
      :style="{
        animationDuration: `${letter.duration}s`,
        animationDelay: `${-letter.duration * (index / 6)}s`
      }"
    >
      {{ letter.char }}
    </span>
  </div>
</template>