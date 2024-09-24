<script setup lang="ts">
import {computed, ref} from 'vue'
import type {Todo} from '~/composables/useIndexedDB'
import TodoItem from "~/components/TodoItem.vue";

const props = defineProps<{
  todos: Todo[]
  currentTags: string[]
  timeToWait: number
}>()

const checkCheckOfTime = (todo: Todo) => {
  console.log("check of todo", todo)
  const timeDif = new Date().getTime() - todo.updatedAt.getTime()
  const bools = timeDif < 5000
  console.log("time dif", timeDif)
  console.log("bools", bools)
  return bools
}

const showDeletedTodos = ref(false)

const emit = defineEmits(['toggle-todo', 'delete-todo', 'update-positions'])

const maxDisplayedTasks = ref(10)
const containerRef = ref<HTMLElement | null>(null)

const displayedTodos = computed(() => {
  let filteredTodos = props.todos;

  // Filter todos based on current tags
  if (props.currentTags.length > 0) {
    filteredTodos = filteredTodos.filter(todo =>
        todo.tags && todo.tags.some(tag => props.currentTags.includes(tag))
    );
  }

  // show todos that either have not been check of yet or just checked of recently
  // const activeTodos = filteredTodos.value.filter(x => !x.deletedAt && (checkCheckOfTime(x) ||  !x.completed));
  const activeTodos = filteredTodos.filter(todo => !todo.deletedAt && !todo.completed);

  if (showDeletedTodos.value) {
    const deletedTodos = filteredTodos
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
      if (maxDisplayedTasks.value < displayedTodos.value.length) {
        maxDisplayedTasks.value += 10
      }
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