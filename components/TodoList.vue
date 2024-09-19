<script setup lang="ts">
import {computed, ref} from 'vue'
import type {Todo} from '~/composables/useIndexedDB'
import {getTagColor} from '~/composables/getTagColor'
import {Trash2} from 'lucide-vue-next'
import CheckMark from "assets/svg/CheckMark.vue";

const props = defineProps<{
  todos: Todo[]
  currentTags: string[]
  timeToWait: number
}>()

// Define timeElapsed as a computed property
const timeElapsed = (todo: Todo) => {
  return new Date().getTime() - new Date(todo.createdAt).getTime();
};

const showDeletedTodos = ref(false)

const emit = defineEmits(['toggle-todo', 'delete-todo', 'update-positions'])

const maxDisplayedTasks = ref(10)
const containerRef = ref<HTMLElement | null>(null)

const filteredTodos = computed(() => {
  if (props.currentTags.length === 0) {
    return props.todos;
  }
  return props.todos.filter(todo =>
      todo.tags && todo.tags.some(tag => props.currentTags.includes(tag))
  );
})

const displayedTodos = computed(() => {
  const activeTodos = filteredTodos.value.filter(todo => !todo.deletedAt && !todo.completed);

  if (showDeletedTodos.value) {
    const deletedTodos = filteredTodos.value
        .filter(todo => todo.deletedAt && todo.completed)
        .sort((a, b) => b.position - a.position);

    return [...activeTodos, ...deletedTodos].slice(0, maxDisplayedTasks.value);
  } else {
    return activeTodos.slice(0, maxDisplayedTasks.value)
  }
})

const toggleShowDeletedTodos = () => {
  console.log("toggeling", showDeletedTodos.value)
  showDeletedTodos.value = !showDeletedTodos.value;
  displayedTodos.value;
}

const {isLoading} = useInfiniteScroll(
    containerRef,
    () => {
      if (maxDisplayedTasks.value < filteredTodos.value.length) {
        maxDisplayedTasks.value += 10
      }
    },
    {distance: 10}
)

// Update the checkbox click handler to use timeElapsed
const handleCheckboxClick = (event, todo) => {
  if (todo.completed || timeElapsed(todo) < props.timeToWait) {
    event.preventDefault();
  } else {
    emit('toggle-todo', todo);
  }
}
</script>

<template>
  <div
      ref="containerRef"
      class="max-h-[450px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 dark:hover:scrollbar-thumb-gray-500"
  >
    <ul class="space-y-3">
      <li v-for="todo in displayedTodos" :key="todo.id"
          class="flex flex-col p-4 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm transition-all duration-300">
        <div class="flex items-center justify-between" @click="todo.isExpanded = !todo.isExpanded">
          <div class="flex items-center flex-grow mr-4 min-w-0">
            <label class="flex items-center relative">
              <input
                  type="checkbox"
                  :checked="todo.completed"
                  class="peer h-5 w-5 transition-all appearance-none rounded shadow hover:shadow-md border border-slate-300 checked:bg-green-600 checked:border-green-600"
                  @click="(event) => handleCheckboxClick(event, todo)"
                  :class="{
      'cursor-pointer text-blue-600': !todo.completed && timeElapsed(todo) >= props.timeToWait,
      'cursor-not-allowed text-gray-400 opacity-50': todo.completed || timeElapsed(todo) < props.timeToWait
    }"
                  :disabled="todo.completed || timeElapsed(todo) < props.timeToWait"
              />
              <span
                  class="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              >
    <CheckMark />
  </span>
            </label>

            <span
                class="ml-3"
                :class="['truncate', { 'line-through': todo.completed, 'opacity-50': todo.completed }, 'text-gray-800 dark:text-white']"
                :title="todo.text"
            >
              {{ todo.text.length > 75 ? todo.text.slice(0, todo.text.lastIndexOf(' ', 75)) + '...' : todo.text }}
            </span>
          </div>
          <div class="flex flex-wrap gap-1">
            <span
                v-for="tag in todo.tags"
                :key="tag"
                class="px-2 py-1 rounded-full text-sm transition-colors duration-300 mr-1"
                :class="[
                {
                [`bg-${getTagColor(tag)}-500 text-white dark:bg-${getTagColor(tag)}-600 dark:text-white`]: props.currentTags.includes(tag),
                [`bg-${getTagColor(tag)}-100 text-${getTagColor(tag)}-900 dark:bg-${getTagColor(tag)}-300 dark:text-${getTagColor(tag)}-900`]: !props.currentTags.includes(tag),
                }
              ]"
            >
              {{ tag }}
            </span>
          </div>
        </div>
        <div v-if="todo.isExpanded" class="mt-2" @click="todo.isExpanded = !todo.isExpanded">
          <p v-if="todo.text.length > 75" class="text-gray-700 dark:text-gray-300">
            {{ todo.text.slice(todo.text.lastIndexOf(' ', 75), todo.text.length) }}
          </p>
          <div class="relative flex justify-end mt-1">
            <button @click="emit('delete-todo', todo.id)"
                    class="px-2 py-1.5 text-ml font-medium rounded-full text-red-600 hover:bg-red-200 dark:text-red-400 dark:hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-300 flex items-center">
              <Trash2 class="h-4 w-4 mr-1"/>
              Delete
            </button>
          </div>
        </div>
      </li>
    </ul>
  </div>
  <div>
    <button
        @click="toggleShowDeletedTodos"
        class="mt-4 text-center text-gray-600 dark:text-gray-400 hover:bg-gray-200 rounded-full p-1">
      {{ showDeletedTodos ? 'Hide completed tasks' : 'Show completed tasks' }}
    </button>
  </div>
</template>