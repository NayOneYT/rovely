<template>
  <main class="relative h-screen overflow-hidden flex flex-wrap content-center justify-center bg-[#070908] text-white">
    <div class="absolute top-1/3 -right-40 size-125 rounded-full bg-[#13d373]/3 blur-[125px]" />
    <div class="absolute -bottom-40 left-1/4 w-175 h-100 rounded-full bg-[#13d373]/3 blur-[140px]" />
    <div class="absolute inset-0 opacity-2.5 bg-[linear-gradient(rgb(19,211,115)_1px,transparent_1px),linear-gradient(90deg,rgb(19,211,115)_1px,transparent_1px)] bg-size-[48px_48px]" />
    <slot />
  </main>
</template>