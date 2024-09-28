<script setup lang="ts">
import {Check, Trash2} from 'lucide-vue-next';

const props = defineProps<{
  todo: Todo,
  currentTag: string
}>();

const emit = defineEmits(['toggle-todo', 'delete-todo']);

const handleCheckboxClick = (event, todo) => {
  if (!todo.completed) {
    emit('toggle-todo', todo.id);
  } else {
    event.preventDefault();
  }
};
</script>

<template>
  <li :key="todo.id" class="flex flex-col p-3 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm transition-all duration-300">
    <div class="flex items-center justify-between" @click="todo.isExpanded = !todo.isExpanded">
      <div class="flex items-center flex-grow mr-4 min-w-0">
        <label class="flex items-center relative p-1">
          <input
              type="checkbox"
              :checked="todo.completed"
              class="peer h-5 w-5 transition-all appearance-none rounded shadow hover:shadow-md border border-slate-300 checked:bg-green-600 checked:border-green-600"
              @click="(event) => handleCheckboxClick(event, todo)"
          />
          <span class="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <Check class="w-5 h-5"/>
          </span>
        </label>
        <span class="ml-3 truncate text-gray-800 dark:text-slate-200" :class="{ 'line-through': todo.completed, 'opacity-50': todo.completed }"
              :title="todo.text">
          {{ todo.text.length > 75 ? todo.text.slice(0, todo.text.lastIndexOf(' ', 75)) + '...' : todo.text }}
        </span>
      </div>
      <div class="flex flex-wrap gap-1 px-2 py-1 rounded-full text-sm transition-colors duration-300 mr-1"
           :class="todo.tags && currentTag == todo.tags ? getTagColorActive(todo.tags) : getTagColorInactive(todo.tags)">
        {{ todo.tags }}
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
</template>

<style scoped>

</style>