<script setup lang="ts">
import { defineProps } from 'vue'

interface FormProps {
  form: Record<string, any>
  title: string
  slug: string
  type: 'bool' | 'number' | 'text' | 'select'
  options?: string[]
}

const props = defineProps<FormProps>()
</script>

<template>
  <!-- Boolean Field -->
  <div v-if="type === 'bool'">
    <label class="tracker-title-input">{{ title }}</label>
    <select v-model="form[slug]" class="w-full border p-2 rounded">
      <option :value="null"> - </option>
      <option value="yes">Yes</option>
      <option value="no">No</option>
    </select>
  </div>

  <!-- Number Field -->
  <div v-else-if="type === 'number'">
    <label class="tracker-title-input">{{ title }}</label>
    <input
        v-model="form[slug]"
        type="number"
        min="0"
        class="w-full border p-2 rounded"
    />
  </div>

  <!-- Text Field -->
  <div v-else-if="type === 'text'">
    <label class="tracker-title-input">{{ title }}</label>
    <textarea
        v-model="form[slug]"
        class="w-full border p-2 rounded"
    ></textarea>
  </div>

  <div v-else-if="type === 'select'">
    <label class="tracker-title-input">{{ title }}</label>
    <select v-model="form[slug]" class="w-full border p-2 rounded">
      <option :value="null"> - </option>
      <option
          v-for="opt in options"
          :key="opt"
          :value="opt"
      >
        {{ opt }}
      </option>
    </select>
  </div>
</template>
