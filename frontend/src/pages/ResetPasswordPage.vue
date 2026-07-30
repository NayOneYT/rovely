<script setup lang="ts">
import MinimalLayout from "@/shared/layouts/MinimalLayout.vue"
import { SiteLogo } from "../shared/components/ui"
import ResetPasswordForm from "../features/auth/components/ResetPasswordForm.vue"
</script>

<template>
  <MinimalLayout>
    <SiteLogo class="text-5xl relative w-full flex justify-center -mt-12" />
    <ResetPasswordForm />
  </MinimalLayout>
</template>