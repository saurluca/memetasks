<script setup lang="ts">
import {Check, Trash2} from 'lucide-vue-next';

const props = defineProps<{
  todo: Todo,
  currentTag: string
}>();

const expandedText = ref(false)

const handleExpandClick = () => {
  expandedText.value = !expandedText.value
}

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
  <li :key="todo.id" class="bg-slate-50 p-2 rounded-lg shadow-sm cursor-default hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600" @click="handleExpandClick">
    <div class="flex flex-row gap-2 justify-between">
      <div class="flex gap-2 ml-1" >
        <div class="mt-2.5 mr-1">
          <input type="checkbox" class="size-5 bg-green-500" :checked="todo.completed" @click="(event) => handleCheckboxClick(event, todo)"/>
        </div>
        <div class="text-slate-800 pt-2 dark:text-slate-300" :class="{ 'line-through': todo.completed, 'opacity-50': todo.completed, 'line-clamp-1': !expandedText }">
          {{ todo.text }}
        </div>
      </div>
      <div class="flex flex-col items-center gap-2 text-sm justify-between pt-1.5 pr-0.5">
        <div v-if="todo.tags" class="px-2 py-1 rounded-full whitespace-nowrap shadow-sm" :class="todo.tags && currentTag == todo.tags ? getTagColorActive(todo.tags) : getTagColorInactive(todo.tags)">
          {{ todo.tags }}
        </div>
        <button class="text-red-700 bg-red-300 dark:hover:bg-red-500 rounded-full shadow-sm mb-0.5 p-1.5 ml-auto mt-auto hover:bg-red-500 hover:text-white" v-if="expandedText" @click="emit('delete-todo', todo.id)">
          delete
        </button>
      </div>
    </div>
  </li>

</template>

<!--<template>-->
<!--  <li :key="todo.id" class="flex flex-col p-3 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm cursor-default transition-all duration-300">-->
<!--    <div class="flex items-center justify-between" @click="handleExpandClick">-->
<!--      <div class="flex items-center flex-grow mr-4 min-w-0">-->
<!--        <label class="flex items-center relative p-1">-->
<!--          <input-->
<!--              type="checkbox"-->
<!--              :checked="todo.completed"-->
<!--              class="peer h-5 w-5 transition-all appearance-none rounded shadow hover:shadow-md border border-slate-300 checked:bg-green-600 checked:border-green-600"-->
<!--              @click="(event) => handleCheckboxClick(event, todo)"-->
<!--          />-->
<!--          <span class="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">-->
<!--            <Check class="w-5 h-5"/>-->
<!--          </span>-->
<!--        </label>-->
<!--        <span class="ml-3 truncate text-gray-800 dark:text-slate-200" :class="{ 'line-through': todo.completed, 'opacity-50': todo.completed, 'line-clamp-1': todo.isExpanded }"-->
<!--              :title="todo.text">-->
<!--          {{ todo.text }}-->
<!--        </span>-->
<!--      </div>-->
<!--      <div class="flex flex-wrap gap-1 px-2 py-1 rounded-full text-sm transition-colors duration-300 mr-1"-->
<!--           :class="todo.tags && currentTag == todo.tags ? getTagColorActive(todo.tags) : getTagColorInactive(todo.tags)">-->
<!--        {{ todo.tags  }}-->
<!--      </div>-->
<!--      <div v-if="todo.isExpanded" class="mt-2" @click="todo.isExpanded = !todo.isExpanded">-->
<!--        <div class="relative flex justify-end mt-1">-->
<!--          <button @click="emit('delete-todo', todo.id)"-->
<!--                  class="px-2 py-1.5 text-ml font-medium rounded-full text-red-600 hover:bg-red-200 dark:text-red-400 dark:hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-300 flex items-center">-->
<!--            <Trash2 class="h-4 w-4 mr-1"/>-->
<!--            Delete-->
<!--          </button>-->
<!--        </div>-->
<!--      </div>-->
<!--    </div>-->
<!--  </li>-->
<!--</template>-->

<style scoped>

</style>