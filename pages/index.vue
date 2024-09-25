<script setup lang="ts">
import {onMounted, onUnmounted, ref, computed, watch} from 'vue'
import {nanoid} from 'nanoid'
import type {Tag, Todo} from '~/composables/useIndexedDB'
import {loadDataFromIndexedDB, updateLocalTags, updateLocalTodos} from '~/composables/useIndexedDB'
import ImagePopup from '~/components/ImagePopup.vue'
import TodoInput from '~/components/TodoInput.vue'
import TagManager from '~/components/TagManager.vue'
import TodoList from '~/components/TodoList.vue'
import {Settings} from 'lucide-vue-next';
import SettingsPopup from "~/components/SettingsPopup.vue";

// State variables
const todos = ref<Todo[]>([])
const tags = ref<Tag[]>([])
const isDarkMode = ref(false)
const imagePopup = ref<InstanceType<typeof ImagePopup> | null>(null)
const timeToWait = 12000
const currentTags = ref<string[]>([])
const profileIsOpen = ref(false)

const numberOfCompletedTodos = computed(() => {
  return todos.value?.filter(todo => todo.completed).length
})

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
  if (!todo.completed) {
    todo.completed = true
    todo.completedAt = new Date()
    todo.updatedAt = new Date()

    if (todo.image instanceof Blob) {
      imagePopup.value?.open()
      console.log("todo image", todo.image)
      imagePopup.value?.setImageBlob(todo.image)
    }

    await updateLocalTodos(todos.value);
  }
}

const generateTodoImage = async (newTodo: Todo) => {
  const {generateImage} = useMemeGenerator() ;

  try {
    const result = await generateImage(newTodo.text)
    console.log("image generation finished result", result)
    if (result) {
      console.log("image received for", newTodo.text)
      const todoIndex = todos.value.findIndex(todo => todo.id === newTodo.id)
      if (todoIndex !== -1) {
        todos.value[todoIndex].image = result
        await updateLocalTodos(todos.value)
      }
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
    closeProfile();
  }
}

// Watchers
watch(isDarkMode, () => {
  localStorage.setItem('darkMode', isDarkMode.value.toString())
  applyDarkMode()
})

// Methods
const openProfile = () => {
  profileIsOpen.value = true;
}

const closeProfile = () => {
  profileIsOpen.value = false;
}

useSeoMeta({
  title: 'Memetasks',
  ogTitle: 'Memetasks',
  description: 'Memetasks is a simple, fun and rewarding todo app with personal memes for you!',
  ogDescription: 'Memetasks is a simple, fun and rewarding todo app with personal memes for you!',
})
</script>1

<template>
  <div class="h-dvh bg-slate-100 dark:bg-slate-700 transition-colors duration-300 flex p-1 items-center justify-center">
    <div class="h-full max-h-[618px] w-full mx-auto flex flex-col max-w-2xl p-5 bg-white dark:bg-slate-800 rounded-lg shadow-md transition-colors duration-300">
      <div class="flex justify-between items-center mb-4">
        <div class="flex items-center">
          <div
              class="bg-amber-300 text-black rounded-full p-0.5 font-bold text-xl text-center shadow-lg border-2 border-amber-500 w-{{Math.max(1, numberOfCompletedTodos / 10) + 8 }} h-{{ Math.max(1, numberOfCompletedTodos / 10) + 4 }} flex items-center justify-center mr-2">
            {{ numberOfCompletedTodos }}
          </div>
          <h1 class="text-2xl font-bold text-slate-800 dark:text-slate-200">Meme your tasks!</h1>
        </div>

        <button class="dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-full p-1" @click="openProfile">
          <Settings class="text-black dark:text-slate-200 h-7 w-7"/>
        </button>
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
      />

      <SettingsPopup
          :profile-is-open="profileIsOpen"
          @close-profile="closeProfile"
          @toggle-dark-mode="toggleDarkMode"
          :is-dark-mode="isDarkMode"
      />
    </div>
    <ImagePopup ref="imagePopup"/>
  </div>
</template>
