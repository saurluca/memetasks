<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { nanoid } from 'nanoid'
import draggable from 'vuedraggable'
import { loadTodosFromIndexedDB, updateLocalTodos } from '~/composables/useIndexedDB'

interface Todo {
  id: string
  text: string
  completed: boolean
  completedAt: Date | null
  updatedAt: Date
  deletedAt: Date | null
  position: number
}

const todos = ref<Todo[]>([])
const newTodoText = ref('')
const isDarkMode = ref(false)

onMounted(async () => {
  todos.value = await loadTodosFromIndexedDB()
  isDarkMode.value = localStorage.getItem('darkMode') === 'true'
  applyDarkMode()
})

watch(isDarkMode, () => {
  localStorage.setItem('darkMode', isDarkMode.value.toString())
  applyDarkMode()
})

const applyDarkMode = () => {
  if (isDarkMode.value) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value
}

const addTodo = async () => {
  if (!newTodoText.value.trim()) return

  const newTodo: Todo = {
    id: nanoid(),
    text: newTodoText.value.trim(),
    completed: false,
    completedAt: null,
    updatedAt: new Date(),
    deletedAt: null,
    position: todos.value.length
  }

  todos.value.push(newTodo)
  await updateLocalTodos(todos.value)
  newTodoText.value = ''
}

const updateTodo = async (todo: Todo) => {
  todo.updatedAt = new Date()
  await updateLocalTodos(todos.value)
}

const deleteTodo = async (id: string) => {
  const index = todos.value.findIndex(t => t.id === id)
  if (index !== -1) {
    todos.value[index].deletedAt = new Date()
    todos.value = todos.value.filter(t => t.id !== id)
    await updateLocalTodos(todos.value)
  }
}

const toggleTodo = async (todo: Todo) => {
  todo.completed = !todo.completed
  todo.completedAt = todo.completed ? new Date() : null
  todo.updatedAt = new Date()
  await updateLocalTodos(todos.value)
}

const updateTodoPositions = async () => {
  todos.value.forEach((todo, index) => {
    todo.position = index
    todo.updatedAt = new Date()
  })
  await updateLocalTodos(todos.value)
}
</script>

<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
    <div class="max-w-md mx-auto pt-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md transition-colors duration-300">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800 dark:text-white">Offline-First Todo App</h1>
        <button @click="toggleDarkMode" class="p-2 rounded-full bg-gray-200 dark:bg-gray-600 transition-colors duration-300">
          <span v-if="isDarkMode" class="text-yellow-400">☀️</span>
          <span v-else class="text-gray-800">🌙</span>
        </button>
      </div>
      
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

      <draggable 
        v-model="todos" 
        item-key="id"
        @end="updateTodoPositions"
        class="space-y-3"
      >
        <template #item="{ element: todo }">
          <li class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
            <div class="flex items-center flex-grow mr-4 min-w-0">
              <div class="relative mr-3">
                <input
                  type="checkbox"
                  :checked="todo.completed"
                  @change="toggleTodo(todo)"
                  class="form-checkbox h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:checked:bg-blue-600 transition-colors duration-300"
                />
                <svg class="absolute w-4 h-4 top-0.5 left-0.5 pointer-events-none text-white" viewBox="0 0 20 20" fill="currentColor" style="display: none;">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              </div>
              <span
                :class="['truncate', { 'line-through': todo.completed, 'opacity-50': todo.completed }, 'text-gray-800 dark:text-white']"
                :title="todo.text"
              >
                {{ todo.text }}
              </span>
            </div>
            <button
              @click="deleteTodo(todo.id)"
              class="px-3 py-1.5 text-sm font-medium rounded-full text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-300"
            >
              Delete
            </button>
          </li>
        </template>
      </draggable>
    </div>
  </div>
</template>

