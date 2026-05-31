import { useForm, useField } from "vee-validate"
import { toTypedSchema } from "@vee-validate/zod"
import { registrationSchema } from "../schema"
import { ref, watch } from "vue"
import api from "../api"
import { AxiosError } from "axios"
import { parsePhoneNumberFromString, AsYouType } from "libphonenumber-js"
import { useMutation } from "@tanstack/vue-query"
import { useRouter } from "vue-router"
import { useEmailVerification } from "@/features/verification/email/composables/useEmailVerification"
import { usePhoneVerification } from "@/features/verification/phone/usePhoneVerification"
import type { ResponseErrorDto } from "@/interface"

export const useRegistrationForm = () => {
  const step = ref(1)
  const verifiedEmails = new Set<string>()
  const isEmailVerified = ref(false)

  const router = useRouter()

  const { handleSubmit } = useForm({
    validationSchema: toTypedSchema(registrationSchema)
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
    value: email,
    errorMessage: emailClientError,
    validate: emailValidate,
    meta: emailMeta,
    handleBlur: emailHandleBlur
  } = useField<string>("email", undefined, {
    validateOnValueUpdate: false
  })

  const {
    value: phone,
    errorMessage: phoneClientError,
    validate: phoneValidate,
    meta: phoneMeta,
    handleBlur: phoneHandleBlur,
    handleChange: phoneHandleChange
  } = useField<string>("phone")

  const phoneString = ref("")
  const onPhoneInput = (event: Event) => {
    const input = event.target as HTMLInputElement
    let raw = input.value.replace(/[^\d+]/g, '').replace(/(?!^)\+/g, '')
    if (raw && !raw.startsWith('+')) raw = '+' + raw
    const formatted = new AsYouType().input(raw)
    input.value = formatted
    phoneString.value = formatted
    phoneHandleChange(formatted, false)
  }

  const {
    value: login,
    errorMessage: loginClientError,
    validate: loginValidate,
    meta: loginMeta,
    handleBlur: loginHandleBlur
  } = useField<string>("login", undefined, {
    validateOnValueUpdate: false
  })

  const {
    value: password,
    errorMessage: passwordClientError,
    validate: passwordValidate,
    meta: passwordMeta,
    handleBlur: passwordHandleBlur
  } = useField("password", undefined, {
    validateOnValueUpdate: false
  })

  const {
    emailHandleChange, emailServerError: emailVerificationServerError, sendVerificationEmailCooldown,
    checkRegistrationEmailVerification, sendVerificationEmail
  } = useEmailVerification(name)

  const {
    onCodeInput, codeString, onCodeBlur, codeClientError, codeServerError, codeSetErrors, sendCodeCooldown,
    phoneHandleChange: verificationPhoneHandleChange,
    verifyPhone, checkRegistrationPhoneVerification, sendVerificationCode
  } = usePhoneVerification(name)

  const usernameServerError = ref<undefined | string>(undefined)
  const emailServerError = ref<undefined | string>(undefined)
  const phoneServerError = ref<undefined | string>(undefined)
  const loginServerError = ref<undefined | string>(undefined)

  watch(name, () => {
    if (nameMeta.touched) nameValidate()
  })

  watch(username, () => {
    usernameServerError.value = undefined
    if (usernameMeta.touched) usernameValidate()
  })

  watch(email, () => {
    emailHandleChange(email.value, false)
    emailServerError.value = undefined
    if (emailMeta.touched) {
      emailValidate()
    }
    isEmailVerified.value = verifiedEmails.has(email.value.toLowerCase())
  })

  watch(emailVerificationServerError, () => {
    emailServerError.value = emailVerificationServerError.value
  })

  watch(phone, () => {
    verificationPhoneHandleChange(phone.value, false)
    phoneServerError.value = undefined
    if (phoneMeta.touched) phoneValidate()
  })

  watch(login, () => {
    loginServerError.value = undefined
    if (loginMeta.touched) loginValidate()
  })

  watch(password, () => {
    if (passwordMeta.touched) passwordValidate()
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

  const onEmailBlur = () => {
    if (emailMeta.dirty) {
      emailHandleBlur()
      emailValidate()
    }
  }

  const onPhoneBlur = () => {
    if (phoneMeta.dirty) {
      phoneHandleBlur()
      phoneValidate()
    }
  }

  const onLoginBlur = () => {
    if (loginMeta.dirty) {
      loginHandleBlur()
      loginValidate()
    }
  }

  const onPasswordBlur = () => {
    if (passwordMeta.dirty) {
      passwordHandleBlur()
      passwordValidate()
    }
  }

  const handleSendVerificationEmail = async () => {
    const emailResult = await emailValidate()
    if (!emailResult.valid || !email.value) return
    const verified = await checkRegistrationEmailVerification()
    if (verified) {
      isEmailVerified.value = true
      verifiedEmails.add(email.value.toLowerCase())
      return
    }
    sendVerificationEmail()
  }

  const handleSendVerificationCode = async () => {
    const verified = await checkRegistrationPhoneVerification()
    if (verified) {
      goToNextStep()
      return
    }
    sendVerificationCode()
  }

  const goToNextStep = async () => {
    switch (step.value) {
      case 1:
        const [nameResult, usernameResult] = await Promise.all([
          nameValidate(),
          usernameValidate()
        ])
        if (!nameResult.valid || !usernameResult.valid) return
        if (username.value) {
          try {
            await api.check("username", username.value)
          } catch (error) {
            if (error instanceof AxiosError) {
              const data = error.response?.data as ResponseErrorDto
              if (data.errors) {
                usernameServerError.value = data.errors.username
                return
              }
              alert(data.message ?? "Произошла ошибка сервера, попробуйте позже")
            }
          }
        }
        usernameServerError.value = undefined
        step.value = 2
        break
      case 2:
        if (!email.value && !phone.value) {
          alert("Укажите email или номер телефона")
          return
        }
        const [emailResult, phoneResult] = await Promise.all([
          emailValidate(),
          phoneValidate()
        ])
        if (!emailResult.valid || !phoneResult.valid) return
        if (email.value) {
          try {
            const [, verified] = await Promise.all([
              api.check("email", email.value),
              checkRegistrationEmailVerification()
            ])
            if (!verified) {
              alert("Сначала подтвердите email")
              verifiedEmails.delete(email.value.toLowerCase())
              isEmailVerified.value = false
              return
            }
            isEmailVerified.value = true
            verifiedEmails.add(email.value.toLowerCase())
          } catch (error) {
            if (error instanceof AxiosError) {
              const data = error.response?.data as ResponseErrorDto
              if (data.errors) {
                emailServerError.value = data.errors.email
                return
              }
              alert(data.message ?? "Произошла ошибка сервера, попробуйте позже")
              return
            }
          }
        }
        if (phone.value) {
          try {
            const [, verified] = await Promise.all([
              api.check("phone", parsePhoneNumberFromString(phone.value)?.number as string),
              checkRegistrationPhoneVerification()
            ])
            if (verified) step.value = 3
            else {
              codeString.value = ""
              codeServerError.value = undefined
              codeSetErrors("")
              step.value = 2.5
            }
            return
          } catch (error) {
            if (error instanceof AxiosError) {
              const data = error.response?.data as ResponseErrorDto
              if (data.errors) {
                phoneServerError.value = data.errors.phone
                return
              }
              alert(data.message ?? "Произошла ошибка сервера, попробуйте позже")
              return
            }
          }
        }
        emailServerError.value = undefined
        step.value = 3
        break
      case 2.5:
        const result = await verifyPhone()
        if (result) {
          step.value = 3
        }
    }
  }

  const registerMutation = useMutation({
    mutationFn: api.register,
    onSuccess: () => {
      alert("Аккаунт успешно создан")
      router.push({ name: "login" })
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        const data = error.response?.data as ResponseErrorDto
        if (data.errors) {
          usernameServerError.value = data.errors.username
          emailServerError.value = data.errors.email
          phoneServerError.value = data.errors.phone
          codeServerError.value = data.errors.code
          loginServerError.value = data.errors.login
          if (usernameServerError.value) step.value = 1
          else if (emailServerError.value) {
            verifiedEmails.delete(email.value.toLowerCase())
            isEmailVerified.value = false
            step.value = 2
          }
          else if (phoneServerError.value) step.value = 2
          else if (codeServerError.value) step.value = 2.5
          return
        }
        alert(data.message ?? "Произошла ошибка сервера, попробуйте позже")
      }
    }
  })

  const register = handleSubmit(async (values) => {
    try {
      await api.check("login", values.login)
    } catch (error) {
      if (error instanceof AxiosError) {
        const data = error.response?.data as ResponseErrorDto
        if (data.errors) {
          loginServerError.value = data.errors.login
          return
        }
        alert(data.message ?? "Произошла ошибка сервера, попробуйте позже")
      }
    }
    registerMutation.mutate(values)
  })

  return {
    name, nameClientError, onNameBlur,
    username, usernameClientError, usernameServerError, onUsernameBlur,
    email, emailClientError, emailServerError, onEmailBlur, isEmailVerified, sendVerificationEmailCooldown,
    onPhoneInput, phoneString, onPhoneBlur, phoneClientError, phoneServerError,
    onCodeInput, codeString, onCodeBlur, codeClientError, codeServerError, sendCodeCooldown,
    login, loginClientError, loginServerError, onLoginBlur,
    password, passwordClientError, onPasswordBlur,
    step, handleSendVerificationEmail, handleSendVerificationCode, goToNextStep, register
  }
}