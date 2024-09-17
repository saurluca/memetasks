<script setup lang="ts">
import {onMounted, onUnmounted, ref} from 'vue'
import {nanoid} from 'nanoid'
import type {Tag, Todo} from '~/composables/useIndexedDB'
import {loadDataFromIndexedDB, updateLocalTags, updateLocalTodos} from '~/composables/useIndexedDB'
import ImagePopup from '~/components/ImagePopup.vue'
import {useDebounceFn} from '@vueuse/core'
import TodoInput from '~/components/TodoInput.vue'
import TagManager from '~/components/TagManager.vue'
import TodoList from '~/components/TodoList.vue'

// State variables
const todos = ref<Todo[]>([])
const tags = ref<Tag[]>([])
const isDarkMode = ref(false)
const imagePopup = ref<InstanceType<typeof ImagePopup> | null>(null)
const timeToWait = 1
const currentTags = ref<string[]>([])
const memeMode = ref(true)

const numberOfCompletedTodos = computed(() => {
  return todos.value?.filter(todo => todo.completed).length
})

// Lifecycle hooks
onMounted(async () => {
  console.log("mount")
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

// Methods
const addTodo = async (text: string) => {
  const newTodo: Todo = {
    id: nanoid(),
    text: text,
    createdAt: new Date(),
    completed: false,
    completedAt: null,
    updatedAt: new Date(),
    deletedAt: null,
    position: todos.value.length,
    image: null,
    tags: currentTags.value.length > 0 ? [...currentTags.value] : [],
  }

  todos.value.push(newTodo)
  await updateLocalTodos(todos.value)

  await generateTodoImage(newTodo)
}

const deleteTodo = async (id: string) => {
  const index = todos.value.findIndex(t => t.id === id)
  if (index !== -1) {
    // Soft delete by setting deletedAt to the current date
    todos.value[index].deletedAt = new Date()
    await updateLocalTodos(todos.value)
  }
}

const toggleTodo = async (todo: Todo) => {
  console.log("toggeling todo", todo.completed)
  if (!todo.completed) {
    todo.completed = true
    todo.completedAt = new Date()
    todo.updatedAt = new Date()
    todo.deletedAt = new Date()

    if (todo.image instanceof Blob) {
      imagePopup.value?.open()
      console.log("todo image", todo.image)
      imagePopup.value?.setImageBlob(todo.image)
    }

    await updateLocalTodos(todos.value);
  }
}

const updateTodoPositions = useDebounceFn(async () => {
  todos.value.forEach((todo, index) => {
    todo.position = index
    todo.updatedAt = new Date()
  })
  await updateLocalTodos(todos.value)
}, 300)

const generateTodoImage = async (newTodo: Todo) => {
  const {generateImage} = memeMode.value ? useMemeGenerator() : useImageGenerator();

  try {
    const result = await generateImage(newTodo.text)
    console.log("image received")
    if (result.imageBlob) {
      const todoIndex = todos.value.findIndex(todo => todo.id === newTodo.id)
      if (todoIndex !== -1) {
        todos.value[todoIndex].image = result.imageBlob
        await updateLocalTodos(todos.value)
      }
      console.log("image generated")
    }
  } catch (error) {
    console.error('Error generating image:', error)
  }
}

const addTag = async (text: string) => {
  const newTag: Tag = {
    id: nanoid(),
    text: text,
    createdAt: new Date(),
    deletedAt: null,
  }

  tags.value.push(newTag)
  await updateLocalTags(tags.value)
}

const toggleTag = (tagText: string) => {
  if (currentTags.value.includes(tagText)) {
    currentTags.value = []
  } else {
    // Deselect all tags first
    currentTags.value = []
    // Select the new tag
    currentTags.value.push(tagText)
  }
}

const removeSelectedTags = async () => {
  tags.value = tags.value.filter(tag => !currentTags.value.includes(tag.text))
  currentTags.value = []
  await updateLocalTags(tags.value)
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
  if (event.key === 'Escape') {
    imagePopup.value?.close()
  }
}

// Watchers
watch(isDarkMode, () => {
  localStorage.setItem('darkMode', isDarkMode.value.toString())
  applyDarkMode()
})

</script>

<template>
  <NuxtPwaManifest/>
  <NuxtPage/>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300 flex items-center justify-center">
    <div class="w-full max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md transition-colors duration-300">
      <div class="flex justify-between items-center mb-6">
        <div class="flex items-center">
          <div
              class="bg-amber-300 rounded-full font-bold text-xl p-0.5 text-center shadow-lg border-2 border-amber-500 w-{{Math.max(1, numberOfCompletedTodos / 10) + 8 }} h-{{ Math.max(1, numberOfCompletedTodos / 10) + 4 }} flex items-center justify-center mr-2">
            {{ numberOfCompletedTodos }}
          </div>
          <h1 class="text-2xl font-bold text-gray-800 dark:text-white">Dodo it!</h1>
        </div>

        <div class="flex items-center">
          <div class="mr-2 flex items-center">
            <button
                @click="memeMode = !memeMode"
                class="px-3 py-1 mr-2 text-xs font-medium rounded-full transition-colors duration-300"
                :class="memeMode ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'"
            >
              {{ memeMode ? 'Meme: ON' : 'Meme: OFF' }}
            </button>
          </div>

          <button @click="toggleDarkMode" class="p-2 rounded-full bg-gray-200 dark:bg-gray-600 transition-colors duration-300">
            <span v-if="isDarkMode" class="text-yellow-400">☀️</span>
            <span v-else class="text-gray-800">🌙</span>
          </button>
        </div>
      </div>

      <TodoInput @add-todo="addTodo"/>
      <TagManager
          :tags="tags"
          :current-tags="currentTags"
          @toggle-tag="toggleTag"
          @add-tag="addTag"
          @remove-selected-tags="removeSelectedTags"
      />
      <TodoList
          :todos="todos"
          :current-tags="currentTags"
          :time-to-wait="timeToWait"
          @toggle-todo="toggleTodo"
          @delete-todo="deleteTodo"
          @update-positions="updateTodoPositions"
      />
    </div>
    <ImagePopup ref="imagePopup"/>
  </div>
</template>