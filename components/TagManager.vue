<script setup lang="ts">
import {ref} from 'vue'
import {Plus, Minus} from 'lucide-vue-next'
import {CalendarSearch} from 'lucide-vue-next';
import type {Tag} from "~/plugins/db";

const props = defineProps<{
  tags: Tag[]
  currentTag: string
  todayFilter: boolean
}>()

const emit = defineEmits(['toggle-tag', 'add-tag', 'remove-selected-tags', 'toggle-today-filter'])

const newTagText = ref('')
const showTagPopup = ref(false)
const newTagInput = ref<HTMLInputElement | null>(null)

const toggleTag = (tagText: string) => {
  emit('toggle-tag', tagText)
}

const toggleTagPopup = () => {
  showTagPopup.value = !showTagPopup.value
  if (showTagPopup.value) {
    nextTick(() => {
      newTagInput.value?.focus()
    })
  }
}

const closeTagPopup = () => {
  showTagPopup.value = false
  newTagText.value = ''
}

const addTag = () => {
  if (newTagText.value.trim()) {
    emit('add-tag', newTagText.value.trim())
    closeTagPopup()
  }
}

function buttonClick() {
  emit('toggle-today-filter')
  console.log('button clicked')
}

</script>

<template>
  <div class="mb-4 flex items-center justify-between">
    <div class="flex flex-wrap gap-2 flex-grow">
      <button @click=buttonClick
              class="px-2 border-black rounded-full"
              :class="todayFilter ? 'bg-gray-400' : 'bg-gray-200'">
        <CalendarSearch class="w-5 h-5 text-gray-800 dark:text-gray-400"/>
      </button>
      <span
          v-for="tag in tags"
          :key="tag.text"
          @click="toggleTag(tag.text)"
          class="px-2 py-1 rounded-full text-sm cursor-pointer transition-colors duration-300"
          :class="currentTag == tag.text ? getTagColorActive(tag.text) : getTagColorInactive(tag.text)"
      >
          {{ tag.text }}
        </span>
    </div>
    <div class="flex items-center">
      <div v-if="showTagPopup" class="bg-white dark:bg-gray-800 rounded-xl shadow p-0  mr-2">
        <form @submit.prevent="addTag" class="flex">
          <input
              ref="newTagInput"
              v-model="newTagText"
              placeholder="Add new tag ..."
              class="flex-grow text-black p-1.5 text-sm border bg-white rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors duration-300"
          />
          <button
              type="submit"
              class="px-3 py-1 text-sm bg-green-500 text-white rounded-r-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-300 flex items-center"
          >
            Add
          </button>
        </form>
      </div>
      <div class="flex space-x-2">
        <button
            @click="toggleTagPopup"
            class="p-1 rounded-full bg-green-500 text-white hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-300"
        >
          <Plus class="w-4 h-4"/>
        </button>
        <button
            @click="emit('remove-selected-tags')"
            class="p-1 rounded-full bg-red-500 text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-300"
            :disabled="props.currentTag.length === 0"
            :class="{ 'opacity-50 cursor-not-allowed': props.currentTag.length === 0 }"
        >
          <Minus class="w-4 h-4"/>
        </button>
      </div>
    </div>
  </div>
</template>
