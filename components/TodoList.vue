<script setup lang="ts">
import {computed, ref} from 'vue'
import type {Todo} from '~/composables/useIndexedDB'
import TodoItem from "~/components/TodoItem.vue";

const props = defineProps<{
  todos: Todo[]
  currentTags: string[]
  timeToWait: number
}>()

const showDeletedTodos = ref(false)

const emit = defineEmits(['toggle-todo', 'delete-todo', 'update-positions'])

const maxDisplayedTasks = ref(10)
const containerRef = ref<HTMLElement | null>(null)

const filterOutTags = (todos: Todo[]) => {
  if (props.currentTags.length === 0) {
    return todos
  } else {
    return todos.filter(todo => todo.tags && todo.tags.some(tag => props.currentTags.includes(tag)))
  }
}

const filterForActiveTodos = (todos: Todo[]) => {
  return todos.filter(todo => !todo.deletedAt && !todo.completed)
}

// filter and reverse sort
const filterForDeletedTodos = (todos: Todo[]) => {
  return todos.filter(todo => todo.deletedAt && todo.completed).sort((a, b) => b.position - a.position);
}

const filteredTodos = computed(() => {
  const tagFilteredTodos = filterOutTags(props.todos)
  const activeTodos = filterForActiveTodos(tagFilteredTodos)

  if (showDeletedTodos.value) {
    const deletedTodos = filterForDeletedTodos(tagFilteredTodos)
    return [...activeTodos, ...deletedTodos];
  } else {
    return activeTodos
  }
}, {
  deep: true
});

const displayedTodos = computed(() => {
  return filteredTodos.value.slice(0, maxDisplayedTasks.value)
})

const toggleShowDeletedTodos = () => {
  showDeletedTodos.value = !showDeletedTodos.value;
  displayedTodos.value;
}

const {isLoading} = useInfiniteScroll(
    containerRef,
    () => {
      if (maxDisplayedTasks.value < filteredTodos.value.length) {
        console.log("loading more")
        maxDisplayedTasks.value += 10
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
            :currentTags="props.currentTags"
            @toggle-todo="emit('toggle-todo', $event)"
            @delete-todo="emit('delete-todo', $event)"
        />
      </ul>
    </div>
    <button
        @click="toggleShowDeletedTodos"
        class="mt-4 text-center text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 dark:hover:text-gray-100 rounded-full p-1">
      {{ showDeletedTodos ? 'Hide completed tasks' : 'Show completed tasks' }}
    </button>
  </div>
</template>