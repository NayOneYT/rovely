<script setup lang="ts">
import MinimalLayout from "@/shared/layouts/MinimalLayout.vue"
import { useLegalPage } from "./useLegalPage"
import { AppTextLink } from "@/shared/components/ui"
import { ref } from "vue"
import { X, List } from "@lucide/vue"
import { onClickOutside } from "@vueuse/core"

const { currentTitle, currentSections, activeSections, currentFooterNote, currentLink } = useLegalPage()

const sheetRef = ref<HTMLElement>()
const isSheetOpen = ref(false)
onClickOutside(sheetRef, () => {
  if (isSheetOpen.value) isSheetOpen.value = false
})
</script>

<template>
  <MinimalLayout class="grid grid-cols-12 items-stretch">
    <main lang="ru" class="col-span-12 lg:col-span-8 2xl:col-start-4 2xl:col-span-6">
      <h1 class="text-2xl sm:text-3xl text-center">{{ currentTitle }}</h1>
      <section
        v-for="(section, sectionIndex) in currentSections"
        :key="`section-${sectionIndex}`"
        :id="section.id"
        class="mt-6 text-justify hyphens-auto"
      >
        <RouterLink
          :to="{ hash: `#${section.id}` }"
          class="relative inline group text-lg sm:text-xl"
        >
          <span class="
            hidden lg:inline absolute -left-5 pr-2 text-brand opacity-0 group-hover:opacity-100 transition-all duration-200
          ">#</span>
          {{ section.title }}
        </RouterLink>
        <p class="sm:text-lg mt-4">{{ section.intro }}</p>
        <div class="mt-4 ml-4 sm:ml-10 text-sm sm:text-base">
          <p 
            v-for="(subsection, index) in section.subsections" 
            :key="`subsection-${sectionIndex}-${index}`"
          >
            {{ subsection }}
          </p>
          <div
            v-for="(table, tableIndex) in section.tables"
            :key="`table-${sectionIndex}-${tableIndex}`"
            class="mt-4 border border-border rounded-[13.5px] bg-card"
          >
            <div 
              v-for="(value, key, rowIndex) in table"
              :key="`row-${sectionIndex}-${tableIndex}-${rowIndex}`"
              class="grid grid-cols-7 not-last:border-b border-border"
            >
              <span class="col-span-2 px-4 py-2.75 border-r border-border">{{ key }}</span>
              <component
                :is="typeof(value) === 'string' ? 'span' : 'div'"
                class="col-span-5 px-4 py-2.75"
              >
                <template v-if="typeof(value) === 'string'">
                  {{ value }}
                </template>
                <ul v-else class="list-disc pl-5">
                  <li 
                    v-for="(item, index) in value"
                    :key="`item-${sectionIndex}-${tableIndex}-${rowIndex}-${index}`"
                  >
                    {{ item }}
                  </li>
                </ul>
              </component>
            </div>
          </div>
        </div>
      </section>
    </main>
    <nav
      ref="sheetRef"
      class="fixed flex lg:hidden flex-col top-1/2 right-2 -translate-y-1/2 overflow-hidden will-change-transform bg-card border border-border transition-all duration-200"
      :class="isSheetOpen ? 'w-60 sm:w-70 rounded-[13.5px] border-brand shadow-glow' : 'w-12 rounded-3xl'"
    >
      <div class="flex justify-between items-center">
        <span
          v-if="isSheetOpen"
          class="px-4 py-2.75 text-sm sm:text-base"
        >
          Содержание
        </span>
        <button
          @click="isSheetOpen = !isSheetOpen"
          class="flex justify-center items-center ml-auto p-2.75 text-brand"
          :class=" isSheetOpen ? 'px-4 rounded-[13.5px]' : 'rounded-3xl'"
        >
          <X v-if="isSheetOpen" />
          <List v-else />
      </button>
      </div>
      <div
        class="grid transition-all duration-200"
        :class="isSheetOpen ? 'px-4 py-2.75 pt-0 grid-rows-[1fr] grid-cols-[1fr]' : 'grid-rows-[0fr] grid-cols-[0fr]'"
      >
        <div class="max-h-60 overflow-y-auto overflow-x-hidden text-xs sm:text-sm">
          <AppTextLink
            v-for="(section, index) in currentSections" 
            :key="`content-${index}`"
            :to="{ hash: `#${section.id}` }"
            class="inline-block py-1 sm:py-0.5"
          >
            {{ section.title }}
          </AppTextLink>
        </div>
      </div>
    </nav>
    <aside class="hidden lg:flex col-start-9 col-span-4 2xl:col-start-10 2xl:col-span-3 justify-center ml-2">
      <section class="sticky top-2 self-start px-4 xl:px-10 py-2.75 xl:py-7.5 max-w-120 bg-card rounded-[13.5px] xl:rounded-[35px] border border-border">
        <h2 class="text-xl text-center">Содержание</h2>
        <nav class="flex flex-col overflow-y-auto max-h-[calc(100vh-74px)] xl:max-h-[calc(100vh-112px)] mt-1">
          <RouterLink
            v-for="(section, index) in currentSections" 
            :key="`nav-${index}`"
            :to="{ hash: `#${section.id}` }"
            :tabindex="activeSections.has(section.id) ? -1 : 0"
            class="py-0.5 transition-all duration-200"
            :class="activeSections.has(section.id) 
              ? 'text-text-main pointer-events-none' 
              : 'text-text-muted hover:text-text-main focus-visible:text-text-main'"
          >
            {{ section.title }}
          </RouterLink>
        </nav>
      </section>
    </aside>
    <footer 
      class="
        col-span-12 lg:col-start-2 lg:col-span-10 flex xl:col-start-3 xl:col-span-8 2xl:col-start-4 2xl:col-span-6 flex-col gap-2 sm:flex-row justify-between text-xs sm:text-sm mt-6 px-4 lg:px-10 py-2.75 lg:py-7.5 rounded-[13.5px] lg:rounded-[35px] border border-border bg-card
      "
    >
      <div class="text-text-muted">
        <p>© ROVELY. Кузнечик Е.А. Все права защищены.</p>
        <p class="mt-2">{{ currentFooterNote }}</p>
      </div>
      <div class="shrink-0 flex flex-col sm:items-end">
        <AppTextLink
          :to="currentLink.to"
        >
          {{ currentLink.label }}
        </AppTextLink>
        <div class="flex gap-5 mt-2">
          <AppTextLink :to="{ name: 'Login' }">
            Главная
          </AppTextLink>
          <AppTextLink href="mailto:nayone.tapok@gmail.com">
            Почта поддержки
          </AppTextLink>
        </div>
      </div>
    </footer>
  </MinimalLayout>
</template>