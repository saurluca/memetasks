<script setup lang="ts">
interface Props {
  type?: 'text' | 'number'
  name: string
  placeholder?: string
  modelValue: string | number
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  placeholder: '',
})

const emit = defineEmits(['update:modelValue'])

const updateValue = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <div class="mb-4">
    <label class="block text-sm font-medium mb-2">{{ name }}</label>
    <input
      :type="type"
      :value="modelValue"
      @input="updateValue"
      :placeholder="placeholder"
      class="w-full px-3.5 py-2 border bg-slate-50 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors duration-300"
    />
  </div>
</template>

<style scoped>

</style>