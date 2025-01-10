<script setup lang="ts">
import {Check, Trash2} from 'lucide-vue-next';
import {computed} from "vue";

const props = defineProps<{
  todo: Todo,
  currentTag: string
}>();

const expandedText = ref(false)

const handleExpandClick = () => {
  expandedText.value = !expandedText.value
}

const formattedDate = computed(() => {
  if (!props.todo?.due_at) return ''
  const date = new Date(props.todo.due_at)
  const weekday = date.toLocaleDateString('en-US', {weekday: 'short'})
  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  return `${weekday} ${day}.${month}`
})


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
  <li :key="todo.id" class="bg-slate-50 p-2 rounded-lg shadow-sm cursor-default hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600"
      @click="handleExpandClick">
    <div class="flex flex-row gap-2">
      <div class="flex gap-2 ml-1 flex-1 min-w-0"> <!-- Changed to flex-1 to take available space but allow shrinking -->
        <div class="flex gap-2 min-w-0 flex-1"> <!-- Added flex-1 to allow text to take remaining space -->
          <div class="mt-2.5 mr-1 flex-shrink-0">
            <input type="checkbox" class="size-5 bg-green-500" :checked="todo.completed" @click="(event) => handleCheckboxClick(event, todo)"/>
          </div>
          <div class="text-slate-800 pt-2 dark:text-slate-300 overflow-hidden min-w-0"
               :class="{ 'line-through': todo.completed, 'opacity-50': todo.completed, 'truncate': !expandedText }">
            {{ todo.text }}
          </div>
        </div>
        <div class="hidden md:inline-block text-slate-500 pt-2 dark:text-slate-300 whitespace-nowrap flex-shrink-0"
             :class="{ 'line-through': todo.completed, 'opacity-50': todo.completed }">
          {{ formattedDate }}
        </div>
      </div>
      <div class="flex flex-col items-end gap-2 text-sm justify-between pt-1.5 pr-0.5 flex-shrink-0">
        <div v-if="todo.tags" class="px-2 py-1 rounded-full whitespace-nowrap shadow-sm"
             :class="todo.tags && currentTag == todo.tags ? getTagColorActive(todo.tags) : getTagColorInactive(todo.tags)">
          {{ todo.tags }}
        </div>
        <div v-if="expandedText" class="inline-block md:hidden text-slate-500 pt-2 dark:text-slate-300 whitespace-nowrap flex-shrink-0"
             :class="{ 'line-through': todo.completed, 'opacity-50': todo.completed }">
          {{ formattedDate }}
        </div>
        <button class="text-red-700 bg-red-300 dark:hover:bg-red-500 rounded-full shadow-sm mb-0.5 p-1.5 hover:bg-red-500 hover:text-white"
                v-if="expandedText" @click="emit('delete-todo', todo.id)">
          delete
        </button>
      </div>
    </div>
  </li>

</template>

<style scoped>

</style>