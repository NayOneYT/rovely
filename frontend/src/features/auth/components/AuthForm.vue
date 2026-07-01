<script setup>
import { computed } from 'vue'
import LoginForm from './LoginForm.vue'
import RegistrationForm from './RegistrationForm.vue'
import { useRoute, useRouter } from "vue-router"

const features = [
  { key: "login", label: "Вход" },
  { key: "registration", label: "Регистрация" }
]

const route = useRoute()

const isLogin = computed(() => route.name === "login")
</script>

<template>
  <section class="bg-[#111b18] w-full border border-[#1c2e28] rounded-4xl p-10">
    <div class="relative flex bg-[#060e0b] rounded-4xl select-none mb-6">
      <div 
        class="absolute top-0 bottom-0 w-1/2 bg-[#13d373] rounded-4xl transition-all duration-200"
        :style="{ transform: isLogin ? 'translateX(0)' : 'translateX(100%)' }"
      />
      <router-link
        v-for="feature in features"
        :key="feature.key"
        :to="`${feature.key}`"
        class="relative w-full text-center text-[18px] p-3 rounded-4xl transition-all duration-200 focus-visible:outline-none" 
        :class="(feature.key === 'login' && isLogin) || (feature.key === 'registration' && !isLogin)
          ? 'text-[#060e0b] font-semibold' 
          : 'cursor-pointer text-white/60 hover:text-white focus-visible:text-white'"
      >
        {{ feature.label }}
      </router-link>
    </div>
    <component :is="isLogin ? LoginForm : RegistrationForm" />
  </section>
</template>