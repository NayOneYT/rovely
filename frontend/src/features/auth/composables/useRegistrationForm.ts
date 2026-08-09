import { useForm, useField } from "vee-validate"
import { toTypedSchema } from "@vee-validate/zod"
import { registerSchema, type CheckAvailabilityDto } from "../schema"
import { usePasswordField } from "@/shared/composables/fields"
import { ref, computed, watch, type Ref } from "vue"
import { authApi } from "../api"
import { ApiError, ErrorCode } from "@/shared/api/types"
import { useMutation } from "@tanstack/vue-query"
import { useRouter } from "vue-router"
import { useEmailVerification } from "@/features/verification/email/composables/useEmailVerification"
import { usePhoneVerification } from "@/features/verification/phone/usePhoneVerification"
import { toast } from "vue-sonner"
import type { RegistrationStep } from "../types"

export const useRegistrationForm = (isProcessing: Ref<boolean>) => {
  const step = ref<RegistrationStep>(1)
  const verifiedEmails = ref<Set<string>>(new Set())
  const isEmailVerified = computed(() => emailVerification.email.value && verifiedEmails.value.has(emailVerification.email.value.toLowerCase()))

  const router = useRouter()

  const { handleSubmit } = useForm({
    validationSchema: toTypedSchema(registerSchema)
  })

  const {
    value: name,
    errorMessage: nameClientError,
    validate: nameValidate,
    meta: nameMeta,
    handleBlur: nameHandleBlur
  } = useField<string>("name", undefined, {
    validateOnValueUpdate: false
  })

  const {
    value: username,
    errorMessage: usernameClientError,
    validate: usernameValidate,
    meta: usernameMeta,
    handleBlur: usernameHandleBlur
  } = useField<string>("username", undefined, {
    validateOnValueUpdate: false
  })

  const {
    value: login,
    errorMessage: loginClientError,
    validate: loginValidate,
    meta: loginMeta,
    handleBlur: loginHandleBlur
  } = useField<string>("login", undefined, {
    validateOnValueUpdate: false
  })

  const password = usePasswordField()

  const emailVerification = useEmailVerification(isProcessing, name)
  const phoneVerification = usePhoneVerification(isProcessing, name)

  const usernameServerError = ref<string>()
  const loginServerError = ref<string>()

  watch(name, () => {
    if (nameMeta.touched) nameValidate()
  })

  watch(username, () => {
    usernameServerError.value = undefined
    if (usernameMeta.touched) usernameValidate()
  })

  watch(login, () => {
    loginServerError.value = undefined
    if (loginMeta.touched) loginValidate()
  })

  const onNameBlur = () => {
    if (nameMeta.dirty) {
      nameHandleBlur()
      nameValidate()
    }
  }

  const onUsernameBlur = () => {
    if (usernameMeta.dirty) {
      usernameHandleBlur()
      usernameValidate()
    }
  }

  const onLoginBlur = () => {
    if (loginMeta.dirty) {
      loginHandleBlur()
      loginValidate()
    }
  }

  const checkAvailabilityMutation = useMutation({
    mutationFn: authApi.checkAvailability,
    onError: (error) => {
      if (!(error instanceof ApiError)) toast.error("Что-то пошло не так, попробуйте позже")
    }
  })

  const checkAvailability = async (data: CheckAvailabilityDto) => {
    try {
      await checkAvailabilityMutation.mutateAsync(data)
      return true
    } catch {
      return false
    }
  }

  const handleSendEmailVerification = async () => {
    if (!emailVerification.email.value) {
      toast.warning("Сначала укажите email")
      return
    }
    const status = await emailVerification.send()
    if (status === "ALREADY_VERIFIED") verifiedEmails.value.add(emailVerification.email.value.toLowerCase())
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
          nameValidate(),
          usernameValidate()
        ])
        if (!nameResult.valid || !usernameResult.valid) break
        if (username.value) {
          const available = await checkAvailability({
            field: "username",
            value: username.value
          })
          if (!available) {
            usernameServerError.value = "Этот username занят"
            break
          }
        }
        usernameServerError.value = undefined
        step.value = 2
        break
      case 2:
        if (!emailVerification.email.value && !phoneVerification.phone.value.value) {
          toast.warning("Сначала укажите email или номер телефона")
          break
        }
        const [emailResult, phoneResult] = await Promise.all([
          emailVerification.emailValidate(),
          phoneVerification.phone.validate()
        ])
        if (!emailResult.valid || !phoneResult.valid) break
        if (emailVerification.email.value) {
          const available = await checkAvailability({
            field: "email",
            value: emailVerification.email.value
          })
          if (!available) {
            emailVerification.emailServerError.value = "Этот email занят"
            break
          }
          const status = await emailVerification.checkRegistration()
          if (status === "NOT_VERIFIED") {
            verifiedEmails.value.delete(emailVerification.email.value.toLowerCase())
            break
          }
          verifiedEmails.value.add(emailVerification.email.value.toLowerCase())
        }
        if (phoneVerification.phone.value.value) {
          const available = await checkAvailability({
            field: "phone",
            value: phoneVerification.phone.value.value
          })
          if (!available) {
            phoneVerification.phoneServerError.value = "Этот номер телефона занят"
            break
          }
          const status = await phoneVerification.checkRegistration()
          if (status === "NOT_VERIFIED") {
            phoneVerification.codeString.value = ""
            phoneVerification.codeServerError.value = undefined
            phoneVerification.codeSetErrors("")
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
    name, nameClientError, onNameBlur,
    username, usernameClientError, usernameServerError, onUsernameBlur,
    email: emailVerification.email, emailClientError: emailVerification.emailClientError, emailServerError: emailVerification.emailServerError, onEmailBlur: emailVerification.onEmailBlur, isEmailVerified, sendEmailCooldown: emailVerification.sendCooldown,
    phone: phoneVerification.phone, phoneServerError: phoneVerification.phoneServerError,
    onCodeInput: phoneVerification.onCodeInput, codeString: phoneVerification.codeString, onCodeBlur: phoneVerification.onCodeBlur, codeClientError: phoneVerification.codeClientError, codeServerError: phoneVerification.codeServerError, sendTelegramMessageCooldown: phoneVerification.sendCooldown,
    login, loginClientError, loginServerError, onLoginBlur,
    password,
    step, handleSendEmailVerification, handleSendPhoneVerification, goToNextStep, register
  }
}