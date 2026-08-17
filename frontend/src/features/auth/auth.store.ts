import { defineStore } from "pinia"
import { ref } from "vue"
import type { PasswordRecoveryStep, RegistrationStep } from "./auth.types"

export const useAuthStore = defineStore("auth", () => {
  const theUserLoggedInOnce = ref(false)

  const loginIdentifier = ref("")
  const loginPassword = ref("")

  const loginWithPhonePhone = ref("")
  const loginWithPhoneCode = ref("")
  const loginWithPhoneSendCooldownsUntilMs = ref<Record<string, number>>({})

  const rememberMe = ref(false)

  const passwordRecoveryStep = ref<PasswordRecoveryStep>(1)
  const passwordRecoveryIdentifier = ref("")
  const passwordRecoveryBlurredEmail = ref<string>()
  const passwordRecoverySendEmailCooldownsUntilMs = ref<Record<string, number>>({})
  const passwordRecoveryBlurredPhone = ref<string>()
  const passwordRecoverySendTelegramMessageCooldownsUntilMs = ref<Record<string, number>>({})

  const registrationStep = ref<RegistrationStep>(1)
  const registrationName = ref("")
  const registrationUsername = ref("")
  const registrationEmail = ref("")
  const registrationSendEmailCooldownsUntilMs = ref<Record<string, number>>({})
  const registrationPhone = ref("")
  const registrationCode = ref("")
  const registrationSendTelegramMessageCooldownsUntilMs = ref<Record<string, number>>({})
  const registrationLogin = ref("")
  const registrationPassword = ref("")
  const isProcessing = ref(false)

  return {
    theUserLoggedInOnce,
    loginIdentifier, loginPassword,
    loginWithPhonePhone, loginWithPhoneCode, loginWithPhoneSendCooldownsUntilMs,
    rememberMe,
    passwordRecoveryStep, passwordRecoveryIdentifier,
    passwordRecoveryBlurredEmail, passwordRecoverySendEmailCooldownsUntilMs,
    passwordRecoveryBlurredPhone, passwordRecoverySendTelegramMessageCooldownsUntilMs,
    registrationStep, registrationName, registrationUsername,
    registrationEmail, registrationSendEmailCooldownsUntilMs,
    registrationPhone, registrationCode, registrationSendTelegramMessageCooldownsUntilMs,
    registrationLogin, registrationPassword,
    isProcessing
  }
}, {
  persist: [
    {
      storage: localStorage,
      pick: [
        "theUserLoggedInOnce", "loginWithPhoneSendCooldownsUntilMs", "rememberMe",
        "passwordRecoverySendEmailCooldownsUntilMs", "passwordRecoverySendTelegramMessageCooldownsUntilMs",
        "registrationSendEmailCooldownsUntilMs", "registrationSendTelegramMessageCooldownsUntilMs"
      ]
    }, {
      storage: sessionStorage,
      pick: [
        "loginIdentifier",
        "loginWithPhonePhone",
        "passwordRecoveryStep", "passwordRecoveryIdentifier",
        "passwordRecoveryBlurredEmail", "passwordRecoveryBlurredPhone",
        "registrationStep", "registrationName", "registrationUsername", "registrationEmail",
        "registrationPhone", "registrationLogin"
      ]
    }
  ]
})