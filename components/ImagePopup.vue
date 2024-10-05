<script setup lang="ts">

import {nanoid} from "nanoid";

const props = defineProps<{
  todoText: string
  isOpen: boolean
  errorMessage: string
  imageBlob: Blob | null
  imageUrl: string
}>()

const emit = defineEmits(['close-image-popup'])

const downloadImage = () => {
  if (props.imageBlob && props.imageUrl) {
    const uniqueId = nanoid(6); // Generate a unique ID with a length of 6 characters
    const sanitizedTodoText = props.todoText.replaceAll(' ', '-');
    const filename = `memetasks-${sanitizedTodoText}-${uniqueId}.png`;

    const link = document.createElement('a')
    link.href = props.imageUrl
    link.download = filename
    link.click()
  }
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
    <div class="relative max-w-2xl w-full bg-slate-100 dark:bg-gray-500 rounded-lg shadow-xl">
      <button 
        @click="emit('close-image-popup')"
        class="absolute -top-3 -right-3 bg-gray-200 dark:bg-black text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-full p-2 transition-colors duration-200"
        aria-label="Close"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
      <div class="p-3">
        <img v-if="imageUrl" :src="imageUrl" alt="Todo image" class="w-full h-auto rounded-lg" />
        <p v-else-if="!imageBlob" class="max-w-xl h-auto rounded-lg text-gray-500 dark:text-slate-200">
          {{errorMessage}}
           <br/>
          Either you don't give the memes enough time to mature, have no internet or there was an error.
        </p>
        <p v-else class="text-gray-500">Loading image...</p>
      </div>
      <div v-if="imageBlob" class="flex w-full p-2">
        <button @click="downloadImage" class="bg-green-500 text-white flex w-full justify-center text-xl rounded-lg p-2 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700">
          Download
        </button>
      </div>
    </div>
  </div>
</template>
