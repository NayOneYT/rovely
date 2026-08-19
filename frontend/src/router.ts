import { createRouter, createWebHistory } from "vue-router"
import { currentAccountQueryOptions } from "./entities/account/useCurrentAccount.ts"
import { queryClient } from "./shared/api/index.ts"

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
      component: () => import("@/pages/welcome/WelcomePage.vue"),
      meta: { title: "Вход | ROVELY", guestOnly: true }
    },
    {
      path: "/login-with-phone",
      name: "LoginWithPhone",
      component: () => import("@/pages/welcome/WelcomePage.vue"),
      meta: { title: "Вход по номеру телефона | ROVELY", guestOnly: true }
    },
    {
      path: "/password-recovery",
      name: "PasswordRecovery",
      component: () => import("@/pages/welcome/WelcomePage.vue"),
      meta: { title: "Восстановление пароля | ROVELY", guestOnly: true }
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
      component: () => import("@/pages/welcome/WelcomePage.vue"),
      meta: { title: "Регистрация | ROVELY", guestOnly: true }
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
    },
    {
      path: "/:notFound(.*)*",
      name: "NotFound",
      component: () => import("@/pages/NotFoundPage.vue"),
      meta: { title: "Страница не найдена | ROVELY" }
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
  const isGuestOnly = to.meta.guestOnly
  const isRequiresAuth = to.meta.requiresAuth
  if (!isGuestOnly && !isRequiresAuth) return true

  const currentAccount = await queryClient.ensureQueryData(currentAccountQueryOptions)
  if (isGuestOnly && currentAccount) return { path: `/profiles/${currentAccount.profile.username}` }
  if (isRequiresAuth && !currentAccount) return { name: "Login" }
  return true
})

router.afterEach((to) => {
  const title = to.meta.title
  if (title && typeof title === "string") {
    document.title = title
  }
})