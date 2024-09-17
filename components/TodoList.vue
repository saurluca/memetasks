<script setup lang="ts">
import {computed, ref} from 'vue'
import draggable from 'vuedraggable'
import type {Todo} from '~/composables/useIndexedDB'

const props = defineProps<{
  todos: Todo[]
  currentTags: string[]
  timeToWait: number
}>()
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
  console.log("showdeltedTodos", showDeletedTodos)
  const activeTodos = filteredTodos.value.filter(todo => !todo.deletedAt);
  const deletedTodos = filteredTodos.value
      .filter(todo => todo.deletedAt && todo.completed)
      .sort((a, b) => b.position - a.position);
  
  if (showDeletedTodos.value) {
    return [...activeTodos, ...deletedTodos].slice(0, maxDisplayedTasks.value);
  } else {
    return filteredTodos.value
        .filter(todo => !todo.deletedAt)
        .slice(0, maxDisplayedTasks.value)
  }
})

const hiddenTodos = computed(() => {
  return filteredTodos.value
      .filter(todo => todo.deletedAt)
      .slice(0, maxDisplayedTasks.value)
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

const getTagColor = (tagId: string) => {
  const colorIndex = tagId.charCodeAt(0) % 5
  const colors = ['rose', 'blue', 'green', 'orange', 'fuchsia']
  return colors[colorIndex]
}
</script>

<template>
  <div
      ref="containerRef"
      class="max-h-[450px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 dark:hover:scrollbar-thumb-gray-500"
  >
    <draggable
        :list="displayedTodos"
        item-key="id"
        @end="emit('update-positions')"
        class="space-y-3"
    >
      <template #item="{ element: todo }">
        <li class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
          <div class="flex items-center flex-grow mr-4 min-w-0">
            <div class="flex items-center relative mr-3">
              <input
                  type="checkbox"
                  :checked="todo.completed"
                  @click="(event) => {
                  if (new Date().getTime() - new Date(todo.createdAt).getTime() < props.timeToWait) {
                    event.preventDefault();
                  } else {
                    emit('toggle-todo', todo);
                  }
                }"
                  :class="[
                  'form-checkbox h-5 w-5 rounded border-gray-300 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:checked:bg-blue-600 transition-colors duration-300',
                  {
                    'text-blue-600 cursor-pointer': new Date().getTime() - new Date(todo.createdAt).getTime() >= props.timeToWait,
                    'text-gray-400 cursor-not-allowed': new Date().getTime() - new Date(todo.createdAt).getTime() < props.timeToWait
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
          <div class="flex flex-wrap gap-1">
            <span
                v-for="tag in todo.tags"
                :key="tag"
                class="px-2 py-1 rounded-full text-sm transition-colors duration-300"
                :class="[
                `bg-${getTagColor(tag)}-500 text-white`,
                'dark:bg-' + getTagColor(tag) + '-600 dark:text-white'
              ]"
            >
              {{ tag }}
            </span>
          </div>
          <button v-if="!todo.deletedAt"
              @click="emit('delete-todo', todo.id)"
              class="px-3 py-1.5 text-sm font-medium rounded-full text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-300"
          >
            Delete
          </button>
        </li>
      </template>
    </draggable>
  </div>
  <div>
    <button
        @click="toggleShowDeletedTodos"
        class="mt-4 text-center text-gray-600 dark:text-gray-400 hover:bg-gray-200 rounded-full p-1">
      Show completed tasks
    </button>
  </div>
  <!--  <div v-if="filteredTodos.length > maxDisplayedTasks" class="mt-4 text-center text-gray-600 dark:text-gray-400">-->
  <!--    Showing {{ maxDisplayedTasks }} of {{ filteredTodos.length }} tasks-->
  <!--  </div>-->
</template>