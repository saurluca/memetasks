<script setup lang="ts">
import { ref, computed } from 'vue'
import { CalendarPlus } from 'lucide-vue-next'

const props = defineProps<{
  selectedDate: string
}>()

const emit = defineEmits(['add-todo', 'toggle-date-picker'])

const newTodoText = ref('')

const formattedDate = computed(() => {
  if (!props.selectedDate) return ''
  const date = new Date(props.selectedDate)
  const weekday = date.toLocaleDateString('en-US', { weekday: 'short' })
  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  return `${weekday} ${day}.${month}`
})

const addTodo = () => {
  if (newTodoText.value.trim()) {
    emit('add-todo', newTodoText.value.trim())
    newTodoText.value = ''
  }
}

</script>

<template>
  <form @submit.prevent="addTodo" class="mb-4">
    <div class="flex">
      <div class="relative flex-grow">
        <input
          v-model="newTodoText"
          placeholder="Add new task..."
          class="w-full px-3.5 py-2 border bg-slate-50 text-black rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors duration-300"
        />
        <div class="absolute right-8 top-1/2 -translate-y-1/2 mr-1 mt-0.5 text-gray-500 dark:text-gray-400">
          {{ formattedDate }}
        </div>
        <button
          type="button"
          @click="emit('toggle-date-picker')"
          class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <CalendarPlus class="w-5 h-5" />
        </button>
      </div>
      <button
        type="submit"
        class="px-4 text-slate-100 py-2 bg-blue-500 dark:text-slate-200 rounded-r-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300"
      >
        Add
      </button>
    </div>
  </form>
</template>