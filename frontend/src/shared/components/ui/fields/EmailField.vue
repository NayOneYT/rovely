<script setup lang="ts">
import { useEmailField } from "@/shared/composables/fields"
import FieldWithButton from "./FieldWithButton.vue"
import { Mail } from "@lucide/vue"

defineProps<{
  field: ReturnType<typeof useEmailField>
  disabled?: boolean
  cooldown?: string
  isEmailVerified?: boolean
  serverError?: string
}>()

const emit = defineEmits<{
  click: []
}>()
</script>

<template>
  <FieldWithButton
    type="email"
    label="Email"
    id="email"
    placeholder="email@example.com"
    autocomplete="email"
    v-model="field.value.value"
    @click="emit('click')"
    @blur="field.onBlur"
    maxlength="254"
    :disabled
    :buttonDisabled="!!cooldown || isEmailVerified"
    :clientError="field.clientError.value"
    :serverError
  >
    <Mail :class="!!cooldown && !isEmailVerified ? 'size-5 -mb-0.5' : 'size-8 p-1'"/>
    <p v-if="!!cooldown && !isEmailVerified" class="-mb-1">{{ cooldown }}</p>
  </FieldWithButton>
</template>