<template>
  <main class="relative h-screen overflow-hidden flex flex-wrap content-center justify-center">
    <div class="absolute top-1/3 -right-40 size-125 rounded-full bg-brand/3 blur-[125px]" />
    <div class="absolute -bottom-40 left-1/4 w-175 h-100 rounded-full bg-brand/3 blur-[140px]" />
    <div class="-z-1 absolute inset-0 opacity-2.5 bg-grid" />
    <slot />
  </main>
</template>