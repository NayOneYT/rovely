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
      name: "login",
      component: () => import("@/pages/HomePage.vue"),
      meta: { title: "Вход | ROVELY" }
    },
    {
      path: "/registration",
      name: "registration",
      component: () => import("@/pages/HomePage.vue"),
      meta: { title: "Регистрация | ROVELY" }
    },
    {
      path: "/verification/email/verify/:token",
      name: "verifyEmail",
      component: () => import("@/pages/VerifyEmailPage.vue"),
      meta: { title: "Верификация почты | ROVELY" }
    }
  ],
})

router.beforeEach(async (to) => {
  const isAuthRoute = to.name === "login" || to.name === "registration"
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