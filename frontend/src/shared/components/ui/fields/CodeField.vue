<script setup lang="ts">
import { useCodeField } from "@/shared/composables/fields"
import FieldWithButton from "./FieldWithButton.vue"
import { TelegramIcon } from "../../icons"

defineProps<{
  field: ReturnType<typeof useCodeField>
  cooldown?: string
  disabled?: boolean
  serverError?: string
}>()

const emit = defineEmits<{
  click: []
}>()
</script>

<template>
  <FieldWithButton
    label="Код подтверждения"
    id="code"
    v-model="field.value.value"
    @click="emit('click')"
    @input="field.onInput"
    @blur="field.onBlur"
    maxlength="6"
    :disabled
    :buttonDisabled="!!cooldown"
    :clientError="field.clientError.value"
    :serverError
  >
    <TelegramIcon :class="!!cooldown ? 'size-6 -mb-1' : 'p-1.25'"/>
    <p v-if="!!cooldown" class="-mb-0.5">
      {{ cooldown }}
    </p>
  </FieldWithButton>
</template>