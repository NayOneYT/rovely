<script setup lang="ts">
import { useUsernameField } from "@/shared/composables/fields";
import { InputError } from ".."

defineProps<{
  field: ReturnType<typeof useUsernameField>
  disabled?: boolean
  serverError?: string
}>()
</script>

<template>
  <label v-bind="$attrs" for="username" class="text-sm font-medium pb-1 self-start">Имя пользователя</label>
  <input
    type="text"
    autocomplete="username"
    id="username"
    placeholder="username"
    v-model="field.value.value"
    @blur="field.onBlur"
    :disabled
    class="
      w-full placeholder:text-white/40 bg-[#070908] rounded-[13.5px] px-4 py-2.75 border border-[#222a27]
      focus-visible:outline-none focus-visible:border-[#13d373] focus-visible:shadow-[0_0_6px_#13d373] transition-all duration-200
    "
  >
  <InputError :clientError="field.clientError.value" :serverError />
</template>