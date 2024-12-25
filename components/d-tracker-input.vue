<script setup lang="ts">
import { defineProps } from 'vue'

interface FormProps {
  form: Record<string, any>
  title: string
  slug: string
  type: 'bool' | 'number' | 'text'
  mandatory?: boolean
  errors: Record<string, string>
}

const props = defineProps<FormProps>()
</script>

<template>
  <!-- Boolean Field -->
  <div v-if="type === 'bool'">
    <label class="block mb-1">{{ title }}</label>
    <select v-model="form[slug]" class="w-full border p-2 rounded">
      <option :value="null"> - </option>
      <option value="yes">Yes</option>
      <option value="no">No</option>
    </select>
    <p v-if="errors[slug] && mandatory" class="text-red-500 text-sm">
      {{ errors[slug] }}
    </p>
  </div>

  <!-- Number Field -->
  <div v-else-if="type === 'number'">
    <label class="block mb-1">{{ title }}</label>
    <input
        v-model="form[slug]"
        type="number"
        min="0"
        class="w-full border p-2 rounded"
    />
    <p v-if="errors[slug] && mandatory" class="text-red-500 text-sm">
      {{ errors[slug] }}
    </p>
  </div>

  <!-- Text Field -->
  <div v-else-if="type === 'text'">
    <label class="block mb-1">{{ title }}</label>
    <textarea
        v-model="form[slug]"
        class="w-full border p-2 rounded"
        :class="{ 'border-red-500': mandatory && errors[slug] }"
    ></textarea>
    <p v-if="errors[slug] && mandatory" class="text-red-500 text-sm">
      {{ errors[slug] }}
    </p>
  </div>
</template>

<style scoped>
/* Add component-specific styles if needed */
</style>
