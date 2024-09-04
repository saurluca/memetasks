<script setup lang="ts">
import {ref, onMounted, watch} from 'vue'
import {nanoid} from 'nanoid'
import draggable from 'vuedraggable'
import {loadTodosFromIndexedDB, updateLocalTodos} from '~/composables/useIndexedDB'
import type { Todo, Tag } from '~/composables/useIndexedDB'
import ImagePopup from '~/components/imagePopup.vue'
import { Wifi, WifiOff } from 'lucide-vue-next'
import { Plus } from 'lucide-vue-next'

const todos = ref<Todo[]>([])
const tags = ref<Tag[]>([])
const newTodoText = ref('')
const isDarkMode = ref(false)
const imagePopup = ref<InstanceType<typeof ImagePopup> | null>(null)
const timeToWait = 12000
const isOnline = ref(navigator.onLine)
const newTagText = ref('')
const showTagPopup = ref(false)
const currentTags = ref<string[]>([])

onMounted(async () => {
  todos.value = await loadTodosFromIndexedDB()
  isDarkMode.value = localStorage.getItem('darkMode') === 'true'
  applyDarkMode()

  window.addEventListener('online', () => isOnline.value = true)
  window.addEventListener('offline', () => isOnline.value = false)
})

watch(isDarkMode, () => {
  localStorage.setItem('darkMode', isDarkMode.value.toString())
  applyDarkMode()
})

onUnmounted(() => {
  window.removeEventListener('online', () => isOnline.value = true)
  window.removeEventListener('offline', () => isOnline.value = false)
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
    image: null,
    tags: null,
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
      if (todoIndex !== -1) {
        todos.value[todoIndex].image = result.imageBlob
        await updateLocalTodos(todos.value)
      } else {
        console.warn('Todo not found after image generation')
      }
    } else {
      console.warn('Generated image is not a Blob')
    }
  } catch (error) {
    console.error('Error generating image:', error)
  }
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
  // Check if set minutes have passed since the todo was created
  if (new Date().getTime() - new Date(todo.createdAt).getTime() < timeToWait) {
    return; 
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

const addTag = () => {
  if (!newTagText.value.trim()) return

  const newTag: Tag = {
    id: nanoid(),
    text: newTagText.value.trim(),
    createdAt: new Date(),
    deletedAt: null,
  }

  tags.value.push(newTag)
  newTagText.value = ''
  // You might want to add a function to save tags to IndexedDB
  
}

const toggleTag = (tagId: string) => {
  const index = currentTags.value.indexOf(tagId)
  if (index === -1) {
    currentTags.value.push(tagId)
  } else {
    currentTags.value.splice(index, 1)
  }
}

const toggleTagPopup = () => {
  showTagPopup.value = !showTagPopup.value
}
</script>

<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300 flex items-center justify-center">
    <div class="w-full max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md transition-colors duration-300">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800 dark:text-white">Todo App</h1>

        <div class="flex items-center">
          <div class="mr-2">
            <span v-if="isOnline" class="text-green-500" title="Online">
              <Wifi />
            </span>
            <span v-else class="text-red-500" title="Offline">
              <WifiOff/>
            </span>
          </div>

          <button @click="toggleDarkMode" class="p-2 rounded-full bg-gray-200 dark:bg-gray-600 transition-colors duration-300">
            <span v-if="isDarkMode" class="text-yellow-400">☀️</span>
            <span v-else class="text-gray-800">🌙</span>
          </button>
        </div>
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

      <div class="mb-4">
        <div class="flex items-center justify-between">
          <div class="flex flex-wrap gap-2 flex-grow">
            <span
              v-for="tag in tags"
              :key="tag.id"
              @click="toggleTag(tag.id)"
              class="px-2 py-1 rounded-full text-sm cursor-pointer transition-colors duration-300"
              :class="{
                'bg-blue-500 text-white dark:bg-blue-300 dark:text-blue-900': currentTags.includes(tag.id),
                'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100': !currentTags.includes(tag.id)
              }"
            >
              {{ tag.text }}
            </span>
          </div>
          <div class="relative ml-2">
            <button
              @click="toggleTagPopup"
              class="p-1 rounded-full bg-green-500 text-white hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-300"
            >
              <Plus class="w-4 h-4" />
            </button>
            <div v-if="showTagPopup" class="absolute right-0 z-10 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2">
              <form @submit.prevent="addTag" class="flex">
                <input
                  v-model="newTagText"
                  placeholder="New tag"
                  class="flex-grow px-3 py-1 text-sm border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors duration-300"
                  @keyup.enter="addTag"
                  @keyup.esc="showTagPopup = false"
                />
                <button
                  type="submit"
                  class="px-3 py-1 text-sm bg-green-500 text-white rounded-r-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-300 flex items-center"
                >
                  <Plus class="w-4 h-4 mr-1" />
                  Add
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

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

