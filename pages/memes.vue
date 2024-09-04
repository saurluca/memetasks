<script setup lang="ts">
import { ref, watch } from 'vue'

const prompt = ref('')
const imageUrl = ref('')
const isLoading = ref(false)
const useEnhancedPrompt = ref(false)

const generateMeme = async () => {
  if (prompt.value) {
    isLoading.value = true
    imageUrl.value = ''
    try {
      let finalPrompt = prompt.value

      if (useEnhancedPrompt.value) {
        // Enhance the prompt
        const enhanceResponse = await fetch(`https://promptgen.spuckteller.workers.dev/?prompt=${encodeURIComponent(prompt.value)}`)
        
        if (!enhanceResponse.ok) {
          const errorText = await enhanceResponse.text()
          throw new Error(`Failed to enhance prompt: ${errorText}`)
        }
        
        const responseText = await enhanceResponse.text()
        console.log("Response Text:", responseText)
        
        try {
          const { response } = JSON.parse(responseText)
          const enhancedPrompt = response.response
          console.log("Parsed enhancedPrompt:", enhancedPrompt)
          if (enhancedPrompt) {
            finalPrompt = enhancedPrompt.replace(/^"|"$/g, '') // Remove surrounding quotes
          } else {
            console.warn("enhancedPrompt is undefined in the response")
          }
        } catch (parseError) {
          console.error("Error parsing JSON:", parseError)
          throw new Error("Failed to parse enhanced prompt response")
        }
      }

      console.log("Final Prompt:", finalPrompt)
      // Generate the image with the final prompt
      const imageResponse = await fetch(`https://memes.spuckteller.workers.dev/?prompt=${encodeURIComponent(finalPrompt)}`)
      if (!imageResponse.ok) throw new Error('Failed to generate meme')
      const blob = await imageResponse.blob()
      imageUrl.value = URL.createObjectURL(blob)
    } catch (error) {
      console.error('Error generating meme:', error)
      // You might want to add user-facing error handling here
    } finally {
      isLoading.value = false
    }
  }
}

watch(prompt, () => {
  if (prompt.value === '') {
    imageUrl.value = ''
  }
})
</script>

<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
    <div class="max-w-2xl mx-auto pt-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md transition-colors duration-300">
      <h1 class="text-2xl font-bold text-gray-800 dark:text-white mb-6">Meme Generator</h1>
      
      <form @submit.prevent="generateMeme" class="mb-6">
        <div class="flex flex-col space-y-4">
          <input
            v-model="prompt"
            placeholder="Enter your meme prompt"
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors duration-300"
          />
          <div class="flex items-center justify-between">
            <label class="flex items-center cursor-pointer">
              <div class="relative">
                <input type="checkbox" v-model="useEnhancedPrompt" class="sr-only">
                <div class="block bg-gray-600 w-14 h-8 rounded-full"></div>
                <div class="dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition" :class="{ 'transform translate-x-6': useEnhancedPrompt }"></div>
              </div>
              <span class="ml-3 text-gray-700 dark:text-gray-300">ENHANCE</span>
            </label>
            <button
              type="submit"
              class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300"
              :disabled="isLoading"
            >
              {{ isLoading ? 'Generating...' : 'Generate' }}
            </button>
          </div>
        </div>
      </form>

      <div class="mt-6 relative" style="height: 512px;">
        <div v-if="isLoading" class="absolute inset-0 flex items-center justify-center">
          <div class="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
        </div>

        <img v-else-if="imageUrl" :src="imageUrl" alt="Generated Meme" class="w-full h-full object-contain rounded-lg shadow-md" />
      </div>
    </div>
  </div>
</template>
