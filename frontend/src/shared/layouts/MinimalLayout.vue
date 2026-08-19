<template>
  <main class="relative overflow-hidden flex flex-wrap justify-center items-center content-center p-2">
    <div class="hidden lg:block fixed -z-1 top-1/3 -right-40 size-125 rounded-full bg-brand/5 blur-[125px]" />
    <div class="hidden lg:block fixed -z-1 -bottom-40 left-1/4 w-175 h-100 rounded-full bg-brand/5 blur-[140px]" />
    <div class="-z-1 absolute inset-0 opacity-3 bg-grid" />
    <slot />
  </main>
</template>