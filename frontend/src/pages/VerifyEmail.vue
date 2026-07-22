<script setup lang="ts">
import { useRoute } from 'vue-router'
import { onMounted, ref } from 'vue'
import { AxiosError } from 'axios'
import api from '../features/verification/email/api'
import SiteLogo from '../shared/components/icons/SiteLogo.vue'
import SvgLoading from '../shared/components/icons/SvgLoading.vue'
import type { ResponseErrorDto } from "../shared/types"

const route = useRoute()
const message = ref<string | undefined>("")
const isLoading = ref(true)
const isError = ref(false)

onMounted(async () => {
  try {
    const token = route.params.token as string
    const result = await api.verify(token)
    message.value = result.message
  } catch (error) {
    if (error instanceof AxiosError) {
      isError.value = true
      const data = error.response?.data as ResponseErrorDto
      if (data.errors) {
        message.value = data.errors.token
        return
      }
      message.value = data.message ?? "Произошла ошибка сервера, попробуйте позже"
    }
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <main class="relative h-screen flex flex-col items-center overflow-hidden bg-[#060e0b] text-white">
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_50%,rgb(0,0,0)_100%)]" />
    <SiteLogo class="text-5xl pt-80 relative" />
    <section class="group rounded-4xl border border-[#1c2e28] bg-[#111b18]/50 p-10 backdrop-blur-xs text-xl mt-4 transition-all">
      <p v-if="isLoading">
        <SvgLoading class="size-10" />
      </p>
      <p v-else :class="isError ? 'text-red-400' : ''">
        {{ message }}
      </p>
    </section>
  </main>
</template>