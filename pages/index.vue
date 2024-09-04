<script setup lang="ts">
import {ref, onMounted, watch} from 'vue'
import {nanoid} from 'nanoid'
import draggable from 'vuedraggable'
import {loadTodosFromIndexedDB, updateLocalTodos} from '~/composables/useIndexedDB'
import ImagePopup from '~/components/imagePopup'

interface Todo {
  id: string
  text: string
  createdAt: Date
  completed: boolean
  completedAt: Date | null
  updatedAt: Date
  deletedAt: Date | null
  position: number
  image: Blob | null
}

const todos = ref<Todo[]>([])
const newTodoText = ref('')
const isDarkMode = ref(false)
const imagePopup = ref<InstanceType<typeof ImagePopup> | null>(null)
const timeToWait = 12000

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
    createdAt: new Date(),
    completed: false,
    completedAt: null,
    updatedAt: new Date(),
    deletedAt: null,
    position: todos.value.length,
    image: null
  }
  console.log('newTodo', newTodo)
  todos.value.push(newTodo)
  await updateLocalTodos(todos.value)
  newTodoText.value = ''

  // Generate and add the image after creating the to do
  const {generateImage} = useImageGenerator()
  try {
    const result = await generateImage(newTodo.text, true)
    if (result.imageBlob instanceof Blob) {
      const todoIndex = todos.value.findIndex(todo => todo.id === newTodo.id)
      console.log('todoIndex', todoIndex)
      if (todoIndex !== -1) {
        todos.value[todoIndex].image = result.imageBlob
        await updateLocalTodos(todos.value)
        console.log('Todo updated with image:', todos.value[todoIndex])
      } else {
        console.warn('Todo not found after image generation')
      }
    } else {
      console.warn('Generated image is not a Blob')
      console.log('Type of result:', typeof result);
      console.log('Type of result.imageBlob:', result.imageBlob ? typeof result.imageBlob : 'undefined');
    }
  } catch (error) {
    console.error('Error generating image:', error)
  }
}

const updateTodo = async (todo: Todo) => {
  todo.updatedAt = new Date()
  await updateLocalTodos(todos.value)
}

const deleteTodo = async (id: string) => {
  const index = todos.value.findIndex(t => t.id === id)
  if (index !== -1) {
    // todos.value[index].deletedAt = new Date()
    // todos.value[index].image = null
    // Mark the todo as deleted
    todos.value.splice(index, 1)
    // Update positions of remaining todos
    todos.value.forEach((todo, i) => {
      todo.position = i
    })
    await updateLocalTodos(todos.value)
  }
}

const toggleTodo = async (todo: Todo) => {
  // Check if 1 minutes have passed since the todo was created
  console.log('new Date().getTime()', new Date().getTime())
  console.log('new Date(todo.createdAt).getTime()', new Date(todo.createdAt).getTime())
  if (new Date().getTime() - new Date(todo.createdAt).getTime() < timeToWait) {
    return; // Exit the function if less than 1 minutes have passed
  }

  todo.completed = !todo.completed;
  todo.completedAt = todo.completed ? new Date() : null;
  todo.updatedAt = new Date();
  await updateLocalTodos(todos.value);
  if (todo.completed && todo.image instanceof Blob && imagePopup.value) {
    imagePopup.value.open();
    imagePopup.value.setImageBlob(todo.image);
  } else if (todo.completed) {
    console.warn('Todo completed but image is missing or invalid');
  }
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
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300 flex items-center justify-center">
    <div class="w-full max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md transition-colors duration-300">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800 dark:text-white">Todo App</h1>
        <button @click="toggleDarkMode" class="p-2 rounded-full bg-gray-200 dark:bg-gray-600 transition-colors duration-300">
          <span v-if="isDarkMode" class="text-yellow-400">☀️</span>
          <span v-else class="text-gray-800">🌙</span>
        </button>
      </div>
      <ImagePopup ref="imagePopup"/>
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
                    @click="(event) => {
                      if (new Date().getTime() - new Date(todo.createdAt).getTime() < timeToWait) {
                        event.preventDefault();
                      } else {
                        toggleTodo(todo);
                      }
                    }"
                    :class="[
                        'form-checkbox h-5 w-5 rounded border-gray-300 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:checked:bg-blue-600 transition-colors duration-300',
                        {
                            'text-blue-600 cursor-pointer': new Date().getTime() - new Date(todo.createdAt).getTime() >= timeToWait,
                            'text-gray-400 cursor-not-allowed': new Date().getTime() - new Date(todo.createdAt).getTime() < timeToWait
                        }
                    ]"
                />
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

