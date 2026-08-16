<script setup lang="ts">
import { useLegalPage } from './useLegalPage'
import { AppTextLink } from "@/shared/components/ui"

const { currentTitle, currentSections, activeSections, currentFooterNote, currentLink } = useLegalPage()
</script>

<template>
  <div class="grid grid-cols-4">
    <main lang="ru" class="col-start-2 col-span-2 p-10 m-2">
      <h1 class="text-3xl text-center">{{ currentTitle }}</h1>
      <section
        v-for="(section, sectionIndex) in currentSections"
        :key="`section-${sectionIndex}`"
        :id="section.id"
        class="mt-6 text-justify hyphens-auto"
      >
        <RouterLink
          :to="{ hash: `#${section.id}` }"
          class="relative block group text-xl"
        >
          <span class="
            absolute -left-5 pr-2 text-brand opacity-0 group-hover:opacity-100 transition-all duration-200">#</span>
          {{ section.title }}
        </RouterLink>
        <p class="text-lg mt-4">{{ section.intro }}</p>
        <div class="mt-4 ml-10">
          <p 
            v-for="(subsection, index) in section.subsections" 
            :key="`subsection-${sectionIndex}-${index}`"
          >
            {{ subsection }}
          </p>
          <div
            v-for="(table, tableIndex) in section.tables"
            :key="`table-${sectionIndex}-${tableIndex}`"
            class="mt-4 border border-border rounded-[10px] bg-card"
          >
            <div 
              v-for="(value, key, rowIndex) in table"
              :key="`row-${sectionIndex}-${tableIndex}-${rowIndex}`"
              class="grid grid-cols-7 not-last:border-b border-border"
            >
              <span class="col-span-2 px-3 py-2 border-r border-border">{{ key }}</span>
              <component
                :is="typeof(value) === 'string' ? 'span' : 'div'"
                class="col-span-5 px-3 py-2"
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
    <aside class="col-span-1 flex justify-center">
      <section class="fixed mt-2 mr-2 px-5 py-3 rounded-2xl bg-card border border-border">
        <h2 class="text-xl text-center">Навигация</h2>
        <nav class="flex flex-col mt-1">
          <RouterLink
            v-for="(section, index) in currentSections" 
            :key="`nav-${index}`"
            :to="{ hash: `#${section.id}` }"
            :tabindex="activeSections.has(section.id) ? -1 : 0"
            :class="activeSections.has(section.id) 
              ? 'text-text-main pointer-events-none' 
              : 'text-text-muted hover:text-text-main focus-visible:text-text-main'"
            class="py-0.5 transition-all duration-200"
          >
            {{ section.title }}
          </RouterLink>
        </nav>
      </section>
    </aside>
    <footer class="col-start-2 col-span-2 flex justify-between text-sm p-10 rounded-[40px] mb-2 border border-border bg-card">
      <div class="text-text-muted">
        <p>© ROVELY. Кузнечик Е.А. Все права защищены.</p>
        <p class="mt-2">{{ currentFooterNote }}</p>
      </div>
      <div class="flex flex-col items-end">
        <AppTextLink :to="currentLink.to">
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
  </div>
</template>