import { useRoute, type RouteLocationRaw } from 'vue-router'
import { PRIVACY_SECTIONS, TERM_SECTIONS } from './legal.constants'
import { computed, ref, onMounted, onUnmounted, nextTick, watch } from "vue"

type LegalLink = {
  to: RouteLocationRaw
  label: string
}

export const useLegalPage = () => {
  const route = useRoute()
  const isPrivacy = computed(() => route.name === "Privacy")

  const currentTitle = computed(() => isPrivacy.value
    ? "Политика в отношении обработки персональных данных"
    : "Пользовательское соглашение"
  )

  const currentSections = computed(() => isPrivacy.value
    ? PRIVACY_SECTIONS
    : TERM_SECTIONS
  )

  const currentFooterNote = computed(() => isPrivacy.value
    ? "Разработано в соответствии с законодательством о персональных данных"
    : "Регулирует порядок использования сервисов и защиту авторских прав"
  )

  const currentLink = computed<LegalLink>(() => isPrivacy.value
    ? {
      to: { name: "Terms" },
      label: "Правила пользования"
    }
    : {
      to: { name: "Privacy" },
      label: "Политика конфиденциальности"
    }
  )

  const activeSections = ref<Set<string>>(new Set())
  let observer: IntersectionObserver | null = null

  const setupObserver = () => {
    observer?.disconnect()
    activeSections.value.clear()

    observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          activeSections.value.add(entry.target.id)
        } else {
          activeSections.value.delete(entry.target.id)
        }
      })
    }, {
      rootMargin: "-5% 0px -15% 0px"
    })

    nextTick(() => {
      currentSections.value.forEach((section) => {
        const element = document.getElementById(section.id)
        if (element) observer?.observe(element)
      })
    })
  }

  onMounted(() => setupObserver())
  watch(isPrivacy, setupObserver)
  onUnmounted(() => observer?.disconnect())

  return { currentTitle, currentSections, activeSections, currentFooterNote, currentLink }
}