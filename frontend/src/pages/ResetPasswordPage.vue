<script setup lang="ts">
import MinimalLayout from "@/shared/layouts/MinimalLayout.vue"
import { AppLogo } from "../shared/components/ui"
import ResetPasswordForm from "../features/auth/components/ResetPasswordForm.vue"
</script>

<template>
  <MinimalLayout class="h-screen">
    <AppLogo class="text-5xl relative w-full flex justify-center -mt-2" />
    <ResetPasswordForm class="mt-4" />
  </MinimalLayout>
</template>