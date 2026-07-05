import { createRouter, createWebHistory } from 'vue-router'
import authApi from '@/features/auth/api'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      redirect: "/login"
    },
    {
      path: "/login",
      name: "Login",
      component: () => import("@/pages/HomePage.vue"),
      meta: { title: "Вход | ROVELY" }
    },
    {
      path: "/registration",
      name: "Registration",
      component: () => import("@/pages/HomePage.vue"),
      meta: { title: "Регистрация | ROVELY" }
    },
    {
      path: "/verification/email/verify/:token",
      name: "VerifyEmail",
      component: () => import("@/pages/VerifyEmail.vue"),
      meta: { title: "Верификация почты | ROVELY" }
    },
    {
      path: "/terms",
      name: "Terms",
      component: () => import("@/pages/LegalPage.vue"),
      meta: { title: "Правила пользования | ROVELY" }
    },
    {
      path: "/privacy",
      name: "Privacy",
      component: () => import("@/pages/LegalPage.vue"),
      meta: { title: "Политика конфиденциальности | ROVELY" }
    }
  ],
  scrollBehavior(to) {
    if (to.hash) {
      return {
        el: to.hash,
        behavior: "smooth"
      }
    }
    return {
      top: 0,
      behavior: "smooth"
    }
  }
})

router.beforeEach(async (to) => {
  const isAuthRoute = to.name === "Login" || to.name === "Registration"
  if (isAuthRoute) {
    try {
      const account = await authApi.me()
      return { path: `/profiles/${account.profile.username}` }
    } catch {
      return true
    }
  }
})

router.afterEach((to) => {
  const title = to.meta.title
  if (title && typeof title === "string") {
    document.title = title
  }
})

export default router