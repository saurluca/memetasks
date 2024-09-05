<script setup lang="ts">
import { ref } from 'vue'

const isOpen = ref(false)
const imageBlob = ref<Blob | null>(null)
const imageUrl = ref('')

onMounted(() => {
  if (imageBlob.value) {
    imageUrl.value = URL.createObjectURL(imageBlob.value)
  }
})

onUnmounted(() => {
  if (imageUrl.value) {
    URL.revokeObjectURL(imageUrl.value)
  }
})

const open = () => {
  isOpen.value = true
}

const close = () => {
  isOpen.value = false
}

const setImageBlob = (blob: Blob) => {
  if (imageUrl.value) {
    URL.revokeObjectURL(imageUrl.value)
  }
  imageBlob.value = blob
  imageUrl.value = URL.createObjectURL(blob)
}

const hasImage = computed(() => !!imageBlob.value)

defineExpose({ open, close, setImageBlob })
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
    <div class="relative max-w-3xl w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl">
      <button @click="close" class="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
      <div class="p-4">
        <img v-if="imageUrl" :src="imageUrl" alt="Todo image" class="w-full h-auto rounded-lg" />
        <p v-else-if="!imageBlob" class="text-gray-500">No image provided</p>
        <p v-else class="text-gray-500">Loading image...</p>
      </div>
    </div>
  </div>
</template>
