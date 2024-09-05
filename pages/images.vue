<script setup lang="ts">
import { ref, watch } from 'vue'
import { LoaderCircle } from 'lucide-vue-next';
import { useImageGenerator } from '~/composables/imageGenerator'

const prompt = ref('')
const useEnhancedPrompt = ref(true)
const displayImageUrl = ref('')

const { isLoading, generateImage } = useImageGenerator()

const handleGenerateImage = async () => {
  if (prompt.value) {
    try {
      const result = await generateImage(prompt.value, useEnhancedPrompt.value)
      if (result.imageBlob) {
        displayImageUrl.value = URL.createObjectURL(result.imageBlob)
      }
    } catch (error) {
      console.error('Failed to generate image:', error)
    }
  }
}

watch(prompt, () => {
  if (prompt.value === '') {
    if (displayImageUrl.value) {
      URL.revokeObjectURL(displayImageUrl.value)
    }
    displayImageUrl.value = ''
  }
})

// Clean up object URL when component is unmounted
onUnmounted(() => {
  if (displayImageUrl.value) {
    URL.revokeObjectURL(displayImageUrl.value)
  }
})
</script>

<template>
  <NuxtPwaManifest />
  <NuxtPage />
  <div class="flex items-center justify-center min-h-screen">
    <div class="max-w-2xl p-6">
      <h1 class="text-2xl font-bold mb-6 text-center">Image Generator</h1>
      <div class="mb-4">
        <button
          @click="useEnhancedPrompt = !useEnhancedPrompt"
          :class="[
            'px-4 py-2 rounded transition',
            useEnhancedPrompt ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
          ]"
        >
          {{ useEnhancedPrompt ? 'Enhance: ON' : 'Enhance: OFF' }}
        </button>
      </div>
      <form @submit.prevent="handleGenerateImage" class="mb-6">
        <div class="flex flex-col space-y-4">
          <input
            v-model="prompt"
            placeholder="Enter your image prompt"
            class="w-full p-2 border rounded"
          />
          <button
            type="submit"
            class="px-4 py-2 bg-blue-500 text-white rounded transition disabled:opacity-50 hover:bg-blue-600"
            :disabled="isLoading"
          >
            {{ isLoading ? 'Generating...' : 'Generate Image' }}
          </button>
        </div>
      </form>
      <div class="h-[512px] w-[512px] flex items-center justify-center bg-gray-100 rounded">
        <div v-if="isLoading" class="flex items-center justify-center">
          <LoaderCircle class="animate-spin h-16 w-16 text-blue-500" />
        </div>
        <img v-else-if="displayImageUrl" :src="displayImageUrl" alt="Generated Image" class="max-w-full max-h-full object-contain rounded shadow-lg"/>
        <p v-else class="text-gray-500">Your generated image will appear here</p>
      </div>
    </div>
  </div>
</template>
