import { ref, computed } from "vue"
import { useRoute } from "vue-router"
import LoginForm from "../components/LoginForm.vue"
import LoginWithPhoneForm from "../components/LoginWithPhoneForm.vue"
import RegistrationForm from "../components/RegistrationForm.vue"
import PasswordRecoveryForm from "../components/PasswordRecoveryForm.vue"

const formsMap = {
  Login: LoginForm,
  LoginWithPhone: LoginWithPhoneForm,
  Registration: RegistrationForm,
  PasswordRecovery: PasswordRecoveryForm
}

type FormMapKey = keyof typeof formsMap

export const useAuthWidget = () => {
  const isProcessing = ref<boolean>(false)
  const route = useRoute()
  const currentForm = computed(() => formsMap[route.name as FormMapKey])

  return { isProcessing, currentForm }
}