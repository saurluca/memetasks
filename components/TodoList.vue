<script setup lang="ts">
const props = defineProps<{
  filteredTodos: Todo[]
  currentTag: string
  showDeletedTodos: boolean
}>()

const emit = defineEmits(['toggle-todo', 'delete-todo', 'toggle-show-deleted-todos'])

const maxDisplayedTasks = ref(12)
const containerRef = ref<HTMLElement | null>(null)

const displayedTodos = computed(() => {
  return props.filteredTodos.slice(0, maxDisplayedTasks.value)
})

const {isLoading} = useInfiniteScroll(
    containerRef,
    () => {
      if (maxDisplayedTasks.value < props.filteredTodos.length) {
        maxDisplayedTasks.value += 12
      }
      displayedTodos.value
    },
    {distance: 10}
)
</script>

<template>
  <div class="h-full flex flex-col overflow-hidden">
    <div
        ref="containerRef"
        class="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 dark:hover:scrollbar-thumb-gray-500"
    >
      <ul class="space-y-3">
        <TodoItem
            v-for="todo in displayedTodos"
            :key="todo.id"
            :todo="todo"
            :currentTag="props.currentTag"
            @toggle-todo="emit('toggle-todo', $event)"
            @delete-todo="emit('delete-todo', $event)"
        />
      </ul>
    </div>
    <button
        @click="emit('toggle-show-deleted-todos')"
        class="mt-2 text-center text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 dark:hover:text-gray-100 rounded-full p-1">
      {{ showDeletedTodos ? 'Hide completed tasks' : 'Show completed tasks' }}
    </button>
  </div>
</template>