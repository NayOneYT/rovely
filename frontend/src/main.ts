import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from "pinia-plugin-persistedstate"
import { VueQueryPlugin } from '@tanstack/vue-query'
import { queryClient } from './shared/api'
import './style.css'

import App from './App.vue'
import { router } from './router'

const app = createApp(App)
const pinia = createPinia()

pinia.use(piniaPluginPersistedstate)

app.use(pinia)
app.use(router)
app.use(VueQueryPlugin, { queryClient })

app.mount('#app')