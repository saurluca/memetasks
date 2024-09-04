<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  imageUrl: string
  altText?: string
}>()

const isOpen = ref(false)

const open = () => {
  isOpen.value = true
}

const close = () => {
  isOpen.value = false
}

defineExpose({ open, close })
</script>


<template>
    <button @click="open" class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300">
      Open
    </button>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
    <div class="relative max-w-3xl w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl">
      <button @click="close" class="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
      <div class="p-4">
        <!-- <img :src="imageUrl" :alt="altText" class="w-full h-auto rounded-lg" /> -->
         hello there
      </div>
    </div>
  </div>
</template>
