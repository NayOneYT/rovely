<script setup lang="ts">
import MinimalLayout from "@/shared/layouts/MinimalLayout.vue"
import { AppLogo } from "../shared/components/ui"
import ResetPasswordForm from "../features/auth/components/ResetPasswordForm.vue"
</script>

<template>
  <MinimalLayout>
    <AppLogo class="text-5xl relative w-full flex justify-center -mt-12" />
    <ResetPasswordForm />
  </MinimalLayout>
</template>