import { useRoute } from 'vue-router'
import { PRIVACY_SECTIONS, TERM_SECTIONS } from './constants'
import { ref, onMounted, onUnmounted } from "vue"

export const useLegalPage = () => {
  const route = useRoute()
  const isPrivacy = route.name === "Privacy"

  const currentTitle = isPrivacy
    ? "Политика в отношении обработки персональных данных"
    : "Пользовательское соглашение"

  const currentSections = isPrivacy
    ? PRIVACY_SECTIONS
    : TERM_SECTIONS

  const currentFooterNote = isPrivacy
    ? "Разработано в соответствии с законодательством о персональных данных"
    : "Регулирует порядок использования сервисов и защиту авторских прав"

  const activeSections = ref<Set<string>>(new Set())
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

  return { currentTitle, currentSections, activeSections, currentFooterNote }
}