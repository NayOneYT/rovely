import { useForm } from "vee-validate"
import { toTypedSchema } from "@vee-validate/zod"
import { registerSchema, type CheckAvailabilityDto } from "../schema"
import { useNameField, useUsernameField, useLoginField, usePasswordField } from "@/shared/composables/fields"
import { ref, computed, watch, type Ref } from "vue"
import { authApi } from "../api"
import { ApiError, ErrorCode } from "@/shared/api/types"
import { useMutation } from "@tanstack/vue-query"
import { useRouter } from "vue-router"
import { useEmailVerification } from "@/features/verification/email/composables/useEmailVerification"
import { usePhoneVerification } from "@/features/verification/phone/usePhoneVerification"
import { toast } from "vue-sonner"
import type { RegistrationStep, CheckAvailabilityResult } from "../types"

export const useRegistrationForm = (isProcessing: Ref<boolean>) => {
  const step = ref<RegistrationStep>(1)
  const verifiedEmails = ref<Set<string>>(new Set())
  const isEmailVerified = computed(() => emailVerification.email.value.value && verifiedEmails.value.has(emailVerification.email.value.value.toLowerCase()))

  const router = useRouter()

  const { handleSubmit } = useForm({
    validationSchema: toTypedSchema(registerSchema)
  })

  const name = useNameField()

  const username = useUsernameField()
  const usernameServerError = ref<string>()
  watch(username.value, () => usernameServerError.value = undefined)

  const emailVerification = useEmailVerification(isProcessing, name.value)
  const phoneVerification = usePhoneVerification(isProcessing, name.value)

  const login = useLoginField()
  const loginServerError = ref<string>()
  watch(login.value, () => loginServerError.value = undefined)

  const password = usePasswordField()

  const checkAvailabilityMutation = useMutation({
    mutationFn: authApi.checkAvailability,
    onError: (error) => {
      if (!(error instanceof ApiError)) toast.error("Что-то пошло не так, попробуйте позже")
    }
  })

  const checkAvailability = async (data: CheckAvailabilityDto): Promise<CheckAvailabilityResult> => {
    try {
      await checkAvailabilityMutation.mutateAsync(data)
      return "AVAILABLE"
    } catch (error) {
      if (error instanceof ApiError) return "TAKEN"
      return "ERROR"
    }
  }

  const handleSendEmailVerification = async () => {
    if (!emailVerification.email.value.value) {
      toast.warning("Сначала укажите email")
      return
    }
    const status = await emailVerification.send()
    if (status === "ALREADY_VERIFIED") verifiedEmails.value.add(emailVerification.email.value.value.toLowerCase())
  }

  const handleSendPhoneVerification = async () => {
    const status = await phoneVerification.send()
    if (status === "ALREADY_VERIFIED") await goToNextStep()
  }

  const goToNextStep = async () => {
    isProcessing.value = true
    switch (step.value) {
      case 1:
        const [nameResult, usernameResult] = await Promise.all([
          name.validate(),
          username.validate()
        ])
        if (!nameResult.valid || !usernameResult.valid) break
        if (username.value.value) {
          const checkResult = await checkAvailability({
            field: "username",
            value: username.value.value
          })
          if (checkResult === "AVAILABLE") usernameServerError.value = undefined
          else {
            if (checkResult === "TAKEN") usernameServerError.value = "Этот username занят"
            break
          }
        }
        step.value = 2
        break
      case 2:
        if (!emailVerification.email.value.value && !phoneVerification.phone.value.value) {
          toast.warning("Сначала укажите email или номер телефона")
          break
        }
        const [emailResult, phoneResult] = await Promise.all([
          emailVerification.email.validate(),
          phoneVerification.phone.validate()
        ])
        if (!emailResult.valid || !phoneResult.valid) break
        if (emailVerification.email.value.value) {
          const checkResult = await checkAvailability({
            field: "email",
            value: emailVerification.email.value.value
          })
          if (checkResult === "AVAILABLE") emailVerification.emailServerError.value = undefined
          else {
            if (checkResult === "TAKEN") emailVerification.emailServerError.value = "Этот email занят"
            break
          }
          const status = await emailVerification.checkRegistration()
          if (status === "NOT_VERIFIED") {
            verifiedEmails.value.delete(emailVerification.email.value.value.toLowerCase())
            break
          }
          verifiedEmails.value.add(emailVerification.email.value.value.toLowerCase())
        }
        if (phoneVerification.phone.value.value) {
          const checkResult = await checkAvailability({
            field: "phone",
            value: phoneVerification.phone.value.value
          })
          if (checkResult === "AVAILABLE") phoneVerification.phoneServerError.value = undefined
          else {
            if (checkResult === "TAKEN") phoneVerification.phoneServerError.value = "Этот номер телефона занят"
            break
          }
          const status = await phoneVerification.checkRegistration()
          if (status === "NOT_VERIFIED") {
            phoneVerification.codeServerError.value = undefined
            step.value = 2.5
            break
          }
        }
        step.value = 3
        break
      case 2.5:
        const result = await phoneVerification.verify()
        if (result === "SUCCESS") step.value = 3
        break
    }
    isProcessing.value = false
  }

  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: () => {
      toast.success("Аккаунт создан")
      router.replace({ name: "Login" })
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        let targetStep: RegistrationStep = 3
        switch (error.code) {
          case ErrorCode.USERNAME_TAKEN:
            usernameServerError.value = "Этот username занят"
            targetStep = 1
            break
          case ErrorCode.EMAIL_TAKEN:
            emailVerification.emailServerError.value = "Этот email занят"
            targetStep = 2
            break
          case ErrorCode.PHONE_TAKEN:
            phoneVerification.phoneServerError.value = "Этот номер телефона занят"
            targetStep = 2
            break
          case ErrorCode.LOGIN_TAKEN:
            loginServerError.value = "Этот логин занят"
            break
          case ErrorCode.EMAIL_VERIFICATION_EXPIRED:
            toast.warning("Необходимо заново подтвердить email")
            targetStep = 2
            break
          case ErrorCode.PHONE_VERIFICATION_EXPIRED:
            toast.warning("Необходимо заново подтвердить номер телефона")
            targetStep = 2.5
            break
        }
        step.value = targetStep
      } else toast.error("Что-то пошло не так, попробуйте позже")
    }
  })

  const register = handleSubmit(async (values) => {
    try {
      isProcessing.value = true
      await registerMutation.mutateAsync(values)
    } catch { } finally {
      isProcessing.value = false
    }
  })

  return {
    name,
    username, usernameServerError,
    email: emailVerification.email, emailServerError: emailVerification.emailServerError, isEmailVerified, sendEmailCooldown: emailVerification.sendCooldown,
    phone: phoneVerification.phone, phoneServerError: phoneVerification.phoneServerError,
    code: phoneVerification.code, codeServerError: phoneVerification.codeServerError, sendTelegramMessageCooldown: phoneVerification.sendCooldown,
    login, loginServerError,
    password,
    step, handleSendEmailVerification, handleSendPhoneVerification, goToNextStep, register
  }
}