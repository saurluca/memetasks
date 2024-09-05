<script setup lang="ts">
import {ref, onMounted, watch, computed, nextTick, onUnmounted, shallowRef} from 'vue'
import {nanoid} from 'nanoid'
import draggable from 'vuedraggable'
import {loadDataFromIndexedDB, updateLocalTodos} from '~/composables/useIndexedDB'
import type {Todo, Tag} from '~/composables/useIndexedDB'
import ImagePopup from '~/components/imagePopup.vue'
import {Wifi, WifiOff} from 'lucide-vue-next'
import {Plus, Minus} from 'lucide-vue-next'
import {useOnline, useDebounceFn, useInfiniteScroll} from '@vueuse/core'

// State variables
const todos = ref<Todo[]>([])
const tags = ref<Tag[]>([])
const newTodoText = ref('')
const isDarkMode = ref(false)
const imagePopup = ref<InstanceType<typeof ImagePopup> | null>(null)
const timeToWait = 12000
const isOnline = useOnline()
const newTagText = ref('')
const showTagPopup = ref(false)
const currentTags = ref<string[]>([])
const newTagInput = ref<HTMLInputElement | null>(null)
const maxDisplayedTasks = ref(10) // New state variable for max tasks
const containerRef = ref<HTMLElement | null>(null)

// Computed properties
const filteredTodos = computed(() => {
  if (currentTags.value.length === 0) {
    return todos.value;
  }
  return todos.value.filter(todo =>
    todo.tags && todo.tags.some(tag => currentTags.value.includes(tag))
  );
})

const displayedTodos = computed(() => {
  return filteredTodos.value.slice(0, maxDisplayedTasks.value)
})

// Infinite scroll
const { isLoading } = useInfiniteScroll(
  containerRef,
  () => {
    if (maxDisplayedTasks.value < filteredTodos.value.length) {
      maxDisplayedTasks.value += 10
    }
  },
  { distance: 10 }
)

// Lifecycle hooks
onMounted(async () => {
  const {todos: loadedTodos, tags: loadedTags} = await loadDataFromIndexedDB()
  todos.value = loadedTodos
  tags.value = loadedTags
  isDarkMode.value = localStorage.getItem('darkMode') === 'true'
  applyDarkMode()

  document.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
})

// Core todo functionality
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
    tags: currentTags.value.length > 0 ? [...currentTags.value] : [],
  }

  console.log('newTodo', newTodo)
  todos.value.push(newTodo)
  await updateLocalTodos(todos.value)
  newTodoText.value = ''

  await generateTodoImage(newTodo)
}

const deleteTodo = async (id: string) => {
  const index = todos.value.findIndex(t => t.id === id)
  if (index !== -1) {
    // soft delete
    // todos.value[index].deletedAt = new Date()
    // todos.value[index].image = null

    // hard delete
    todos.value.splice(index, 1)

    // Update positions of remaining todos
    todos.value.forEach((todo, i) => {
      todo.position = i
    })
    await updateLocalTodos(todos.value)
  }
}

const toggleTodo = async (todo: Todo) => {
  const currentTime = new Date().getTime()
  if (currentTime - new Date(todo.createdAt).getTime() < timeToWait) {
    return;
  }

  todo.completed = !todo.completed;
  todo.completedAt = todo.completed ? new Date() : null;
  todo.updatedAt = new Date();
  await updateLocalTodos(todos.value);

  if (todo.completed && todo.image instanceof Blob) {
    imagePopup.value?.open();
    imagePopup.value?.setImageBlob(todo.image);
  }
}

const updateTodoPositions = useDebounceFn(async () => {
  todos.value.forEach((todo, index) => {
    todo.position = index
    todo.updatedAt = new Date()
  })
  await updateLocalTodos(todos.value)
}, 300)

// Image generation
const generateTodoImage = async (newTodo: Todo) => {
  // this method generates and adds an image to a newTodo
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

// Tag functionality
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
  
  // Save tags to IndexedDB
  updateLocalTags(tags.value)
      .then(() => {
        console.log('Tags saved successfully')
      })
      .catch((error) => {
        console.error('Error saving tags:', error)
      })
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
  if (showTagPopup.value) {
    nextTick(() => {
      newTagInput.value?.focus()
    })
  }
}

const closeTagPopup = () => {
  showTagPopup.value = false
  newTagText.value = '' // Clear the input when closing
}

const removeSelectedTags = async () => {
  // Remove all currently selected tags
  for (const tagName of currentTags.value) {
    console.log('tagName', tagName)
    // Mark the tag as deleted in the tags array
    const index = tags.value.findIndex(tag => tag.text === tagName)
    if (index !== -1) {
      tags.value[index].deletedAt = new Date()
    } else {
      console.warn(`Tag with name ${tagName} not found`)
    }
  }
  
  // Filter out the deleted tags
  tags.value = tags.value.filter(tag => !tag.deletedAt)

  // Clear the currentTags array
  currentTags.value = []

  // Update tags in IndexedDB
  try {
    await updateLocalTags(tags.value)
  } catch (error) {
    console.error('Error removing and marking selected tags as deleted:', error)
  }
}

// Dark mode functionality
const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value
}

const applyDarkMode = () => {
  if (isDarkMode.value) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

// Event handlers
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && showTagPopup.value) {
    closeTagPopup()
  }
}

// Watchers
watch(isDarkMode, () => {
  localStorage.setItem('darkMode', isDarkMode.value.toString())
  applyDarkMode()
})

// awd
</script>

<template>
  <NuxtPwaManifest />
  <NuxtPage />
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300 flex items-center justify-center">
    <div class="w-full max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md transition-colors duration-300">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800 dark:text-white">Todo App</h1>

        <div class="flex items-center">
          <div class="mr-2">
            <span v-if="isOnline" class="text-green-500" title="Online">
              <Wifi/>
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
                @click="toggleTag(tag.text)"
                class="px-2 py-1 rounded-full text-sm cursor-pointer transition-colors duration-300"
                :class="[
                  {
                    'bg-rose-500 text-white dark:bg-rose-600 dark:text-white': currentTags.includes(tag.text) && tag.id.charCodeAt(0) % 5 === 0,
                    'bg-rose-100 text-rose-900 dark:bg-rose-300 dark:text-rose-900': !currentTags.includes(tag.text) && tag.id.charCodeAt(0) % 5 === 0,
                    'bg-blue-500 text-white dark:bg-blue-600 dark:text-white': currentTags.includes(tag.text) && tag.id.charCodeAt(0) % 5 === 1,
                    'bg-blue-100 text-blue-900 dark:bg-blue-300 dark:text-blue-900': !currentTags.includes(tag.text) && tag.id.charCodeAt(0) % 5 === 1,
                    'bg-green-500 text-white dark:bg-green-600 dark:text-white': currentTags.includes(tag.text) && tag.id.charCodeAt(0) % 5 === 2,
                    'bg-green-100 text-green-900 dark:bg-green-300 dark:text-green-900': !currentTags.includes(tag.text) && tag.id.charCodeAt(0) % 5 === 2,
                    'bg-orange-500 text-white dark:bg-orange-600 dark:text-white': currentTags.includes(tag.text) && tag.id.charCodeAt(0) % 5 === 3,
                    'bg-orange-100 text-orange-900 dark:bg-orange-300 dark:text-orange-900': !currentTags.includes(tag.text) && tag.id.charCodeAt(0) % 5 === 3,
                    'bg-fuchsia-500 text-white dark:bg-fuchsia-600 dark:text-white': currentTags.includes(tag.text) && tag.id.charCodeAt(0) % 5 === 4,
                    'bg-fuchsia-100 text-fuchsia-900 dark:bg-fuchsia-300 dark:text-fuchsia-900': !currentTags.includes(tag.text) && tag.id.charCodeAt(0) % 5 === 4,
                  }
                ]"
            >
              {{ tag.text }}
            </span>
          </div>
          <div class="relative ml-2">
            <div class="flex space-x-2">
              <button
                  @click="toggleTagPopup"
                  class="p-1 rounded-full bg-green-500 text-white hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-300"
              >
                <Plus class="w-4 h-4"/>
              </button>
              <button
                  @click="removeSelectedTags"
                  class="p-1 rounded-full bg-red-500 text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-300"
                  :disabled="currentTags.length === 0"
                  :class="{ 'opacity-50 cursor-not-allowed': currentTags.length === 0 }"
              >
                <Minus class="w-4 h-4"/>
              </button>
            </div>
            <div v-if="showTagPopup" class="absolute right-0 z-10 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2">
              <form @submit.prevent="addTag(); closeTagPopup()" class="flex">
                <input
                    ref="newTagInput"
                    v-model="newTagText"
                    placeholder="New tag"
                    class="flex-grow px-3 py-1 text-sm border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors duration-300"
                    @keyup.enter="addTag(); closeTagPopup()"
                />
                <button
                    type="submit"
                    class="px-3 py-1 text-sm bg-green-500 text-white rounded-r-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-300 flex items-center"
                >
                  <Plus class="w-4 h-4 mr-1"/>
                  Add
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div 
        ref="containerRef"
        class="max-h-[450px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 dark:hover:scrollbar-thumb-gray-500"
      >
        <draggable
            v-model="displayedTodos"
            item-key="id"
            @end="updateTodoPositions"
            class="space-y-3"
        >
          <template #item="{ element: todo }">
            <li class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
              <div class="flex items-center flex-grow mr-4 min-w-0">
                <div class="flex items-center relatil mr-3">
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
      <div v-if="filteredTodos.length > maxDisplayedTasks" class="mt-4 text-center text-gray-600 dark:text-gray-400">
        Showing {{ maxDisplayedTasks }} of {{ filteredTodos.length }} tasks
      </div>
    </div>
    <ImagePopup ref="imagePopup"/>
  </div>
</template>
