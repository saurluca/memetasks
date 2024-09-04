<script setup lang="ts">
import { ref, onMounted } from 'vue'
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

onMounted(async () => {
  todos.value = await loadTodosFromIndexedDB()
})

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
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900">
    <div class="max-w-md mx-auto pt-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h1 class="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Offline-First Todo App</h1>
      
      <form @submit.prevent="addTodo" class="mb-4">
        <div class="flex">
          <input
            v-model="newTodoText"
            placeholder="Add a new todo"
            class="flex-grow px-4 py-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <button
            type="submit"
            class="px-4 py-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Add
          </button>
        </div>
      </form>

      <draggable 
        v-model="todos" 
        item-key="id"
        @end="updateTodoPositions"
        class="space-y-2"
      >
        <template #item="{ element: todo }">
          <li class="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <div class="flex items-center flex-grow mr-2 min-w-0">
              <input
                type="checkbox"
                :checked="todo.completed"
                @change="toggleTodo(todo)"
                class="mr-3 form-checkbox h-5 w-5 text-blue-600"
              />
              <span
                :class="['truncate', { 'line-through': todo.completed, 'text-gray-500 dark:text-gray-400': todo.completed }]"
                :title="todo.text"
              >
                {{ todo.text }}
              </span>
            </div>
            <button
              @click="deleteTodo(todo.id)"
              class="px-2 py-1 text-sm text-red-600 hover:bg-red-100 rounded dark:text-red-400 dark:hover:bg-red-900"
            >
              Delete
            </button>
          </li>
        </template>
      </draggable>
    </div>
  </div>
</template>

