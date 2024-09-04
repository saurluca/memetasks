<script setup lang="ts">
import {ref, watch} from 'vue'

const prompt = ref('')
const imageUrl = ref('')
const isLoading = ref(false)
const useEnhancedPrompt = ref(true)

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
          const {response} = JSON.parse(responseText)
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
  <div class="flex items-center justify-center min-h-screen">
    <div class="max-w-2xl p-6">
      <h1 class="text-2xl font-bold mb-6 text-center">Meme Generator</h1>
      <div class="mb-4">
        <button
          @click="useEnhancedPrompt = !useEnhancedPrompt"
          :class="[
            'px-4 py-2 rounded transition',
            useEnhancedPrompt ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
          ]"
        >
          {{ useEnhancedPrompt ? 'ENHANCE: ON' : 'ENHANCE: OFF' }}
        </button>
      </div>
      <form @submit.prevent="generateMeme" class="mb-6">
        <div class="flex flex-col space-y-4">
          <input
            v-model="prompt"
            placeholder="Enter your meme prompt"
            class="w-full p-2 border rounded"
          />
          <button
            type="submit"
            class="px-4 py-2 bg-blue-500 text-white rounded transition disabled:opacity-50 hover:bg-blue-600"
            :disabled="isLoading"
          >
            {{ isLoading ? 'Generating...' : 'Generate Meme' }}
          </button>
        </div>
      </form>
      <div class="h-[512px] flex items-center justify-center bg-gray-100 rounded">
        <div v-if="isLoading" class="flex items-center justify-center">
          <Loader2Icon class="animate-spin h-8 w-8 text-blue-500" />
        </div>
        <img v-else-if="imageUrl" :src="imageUrl" alt="Generated Meme" class="max-w-full max-h-full object-contain rounded shadow-lg"/>
        <p v-else class="text-gray-500">Your generated meme will appear here</p>
      </div>
    </div>
  </div>
</template>
