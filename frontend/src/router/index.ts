import { createRouter, createWebHistory } from "vue-router"
import WelcomePage from "../pages/welcome/WelcomePage.vue"
import { authApi } from "../features/auth/api"

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      redirect: "/login"
    },
    {
      path: "/login",
      name: "Login",
      component: WelcomePage,
      meta: { title: "Вход | ROVELY" }
    },
    {
      path: "/login-with-phone",
      name: "LoginWithPhone",
      component: WelcomePage,
      meta: { title: "Вход по номеру телефона | ROVELY" }
    },
    {
      path: "/password-recovery",
      name: "PasswordRecovery",
      component: WelcomePage,
      meta: { title: "Восстановление пароля | ROVELY" }
    },
    {
      path: "/reset-password/:token",
      name: "ResetPassword",
      component: () => import("@/pages/ResetPasswordPage.vue"),
      meta: { title: "Сброс пароля | ROVELY" }
    },
    {
      path: "/registration",
      name: "Registration",
      component: WelcomePage,
      meta: { title: "Регистрация | ROVELY" }
    },
    {
      path: "/verify-email/:token",
      name: "VerifyEmail",
      component: () => import("@/pages/VerifyEmailPage.vue"),
      meta: { title: "Верификация почты | ROVELY" }
    },
    {
      path: "/terms",
      name: "Terms",
      component: () => import("@/pages/legal/LegalPage.vue"),
      meta: { title: "Правила пользования | ROVELY" }
    },
    {
      path: "/privacy",
      name: "Privacy",
      component: () => import("@/pages/legal/LegalPage.vue"),
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
  const isAuthRoute = to.name === "Login" || to.name === "LoginWithPhone" || to.name === "PasswordRecovery" || to.name === "Registration"
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