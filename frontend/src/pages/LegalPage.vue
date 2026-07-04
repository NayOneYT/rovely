<script setup lang="ts">
import { privacySections, termSections } from '@/constants/legal'
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const isPrivacy = route.name === "Privacy"
const currentSections =  isPrivacy ? privacySections : termSections
const activeSections = ref<Set<string>>(new Set())
const currentTitle = isPrivacy ? "Политика в отношении обработки персональных данных" : "Пользовательское соглашение"
const currentFooterNote = isPrivacy ? "Разработано в соответствии с законодательством о персональных данных" : "Регулирует порядок использования сервисов и защиту авторских прав"
let observer: IntersectionObserver | null = null

onMounted(() => {
  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        activeSections.value.add(entry.target.id)
      }
      else {
        activeSections.value.delete(entry.target.id)
      }
    })
  }, {
    rootMargin: "-5% 0px -15% 0px"
  })
  currentSections.forEach((section) => {
    const element = document.getElementById(section.id)
    if (element) observer?.observe(element)
  })
})

onUnmounted(() => {
  observer?.disconnect()
})
</script>

<template>
  <div class="grid grid-cols-4 bg-[#060e0b]">
    <main lang="ru" class="col-start-2 col-span-2 text-white">
      <h1 class="my-10 text-2xl text-center">{{ currentTitle }}</h1>
      <section
        v-for="(section, sectionIndex) in currentSections"
        :key="`section-${sectionIndex}`"
        :id="section.id"
      >
        <h2 class="text-xl my-6">
          <router-link 
            :to="{ hash: `#${section.id}` }"
            class="relative group hover:text-[#00ff8c] focus-visible:outline-none focus-visible:text-[#00ff8c] transition-all duration-200"
          >
            <span class="absolute -left-5 font-thin opacity-0 group-hover:opacity-100 group-hover:text-[#00ff8c] transition-all duration-200">#</span>
            {{ section.title }}
          </router-link>
        </h2>
        <p class="text-lg text-justify leading-relaxed hyphens-auto font-light my-6">{{ section.intro }}</p>
        <div class="ml-10 text-lg">
          <p 
            v-for="(subsection, index) in section.subsections" 
            :key="`subsection-${sectionIndex}-${index}`" 
            class="text-justify leading-relaxed hyphens-auto font-light"
          >
            {{ subsection }}
          </p>
          <div
            v-for="(table, tableIndex) in section.tables"
            :key="`table-${sectionIndex}-${tableIndex}`"
            class="my-6 border border-[#1c2e28] rounded-2xl bg-[#111b18]/50"
          >
            <div 
              v-for="(value, key, rowIndex) in table"
              :key="`row-${sectionIndex}-${tableIndex}-${rowIndex}`"
              class="grid grid-cols-7 border-b border-[#1c2e28]"
            >
              <span class="col-span-2 px-3 py-2 border-r border-[#1c2e28]">{{ key }}</span>
              <component
                :is="typeof(value) === 'string' ? 'span' : 'div'"
                class="col-span-5 px-3 py-2"
              >
                <template v-if="typeof(value) === 'string'">
                  {{ value }}
                </template>
                <ul v-else class="list-disc pl-5 text-[#00ff8c]">
                  <li 
                    v-for="(item, index) in value"
                    :key="`item-${sectionIndex}-${tableIndex}-${rowIndex}-${index}`"
                  >
                    <span class="text-white">{{ item }}</span>
                  </li>
                </ul>
              </component>
            </div>
          </div>
        </div>
      </section>
    </main>
    <aside class="col-span-1">
      <section class="fixed top-10 mx-10 p-3 border border-[#1c2e28] rounded-2xl bg-[#111b18]">
        <h3 class="text-lg text-white text-center pb-2">Навигация</h3>
        <nav class="flex flex-col gap-2">
          <router-link
            v-for="(section, index) in currentSections" 
            :key="`nav-${index}`"
            :to="{ hash: `#${section.id}` }"
            :class="activeSections.has(section.id) ? 'text-[#00ff8c]' : 'text-white/60 hover:text-white focus-visible:text-white'"
            class="leading-tight focus-visible:outline-none transition-all duration-200"
          >
            {{ section.title }}
          </router-link>
        </nav>
      </section>
    </aside>
    <footer class="col-span-4 mt-10 border-t border-[#1c2e28] bg-[#111b18]/50 text-sm text-white/40">
      <div class="flex flex-row items-center justify-around px-6 py-8">
        <div>
          <p>© ROVELY. Кузнечик Е.А. Все права защищены.</p>
          <p class="mt-1">{{ currentFooterNote }}</p>
        </div>
        <div class="flex gap-6 text-white/60">
          <router-link to="/" class="hover:text-[#00ff8c] focus-visible:outline-none focus-visible:text-[#00ff8c] transition-all duration-200">Главная</router-link>
          <a href="mailto:nayone.tapok@gmail.com" class="hover:text-[#00ff8c] focus-visible:outline-none focus-visible:text-[#00ff8c] transition-all duration-200">Почта поддержки</a>
        </div>
      </div>
    </footer>
  </div>
</template>