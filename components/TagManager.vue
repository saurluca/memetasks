<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus, Minus } from 'lucide-vue-next'
import type { Tag } from '~/composables/useIndexedDB'

const props = defineProps<{
  tags: Tag[]
  currentTags: string[]
}>()

const emit = defineEmits(['toggle-tag', 'add-tag', 'remove-selected-tags'])

const newTagText = ref('')
const showTagPopup = ref(false)
const newTagInput = ref<HTMLInputElement | null>(null)

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

const getTagColor = (tagId: string) => {
  const colorIndex = tagId.charCodeAt(0) % 5
  const colors = ['rose', 'blue', 'green', 'orange', 'fuchsia']
  return colors[colorIndex]
}
</script>

<template>
  <div class="mb-4">
    <div class="flex items-center justify-between">
      <div class="flex flex-wrap gap-2 flex-grow">
        <span
          v-for="tag in tags"
          :key="tag.id"
          @click="emit('toggle-tag', tag.text)"
          class="px-2 py-1 rounded-full text-sm cursor-pointer transition-colors duration-300"
          :class="[
            {
              [`bg-${getTagColor(tag.id)}-500 text-white dark:bg-${getTagColor(tag.id)}-600 dark:text-white`]: props.currentTags.includes(tag.text),
              [`bg-${getTagColor(tag.id)}-100 text-${getTagColor(tag.id)}-900 dark:bg-${getTagColor(tag.id)}-300 dark:text-${getTagColor(tag.id)}-900`]: !props.currentTags.includes(tag.text),
            }
          ]"
        >
          {{ tag.text }}
        </span>
      </div>
      <div class="relative ml-2">
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
            :disabled="props.currentTags.length === 0"
            :class="{ 'opacity-50 cursor-not-allowed': props.currentTags.length === 0 }"
          >
            <Minus class="w-4 h-4"/>
          </button>
        </div>
        <div v-if="showTagPopup" class="absolute right-0 z-10 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2">
          <form @submit.prevent="addTag" class="flex">
            <input
              ref="newTagInput"
              v-model="newTagText"
              placeholder="New tag"
              class="flex-grow px-3 py-1 text-sm border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors duration-300"
            />
            <button
              type="submit"
              class="px-3 py-1 text-sm bg-green-500 text-white rounded-r-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-300 flex items-center"
            >
              <Plus class="w-4 h-4 mr-1"/>
              Add
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>