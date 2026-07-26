import { ref } from "vue"

export const useAuthWidget = () => {
  const isProcessing = ref<boolean>(false)

  return { isProcessing }
}