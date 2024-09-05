<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits(['add-todo'])
const newTodoText = ref('')

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
      <input
        v-model="newTodoText"
        placeholder="Add a new todo"
        class="flex-grow px-4 py-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors duration-300"
      />
      <button
        type="submit"
        class="px-4 py-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300"
      >
        Add
      </button>
    </div>
  </form>
</template>