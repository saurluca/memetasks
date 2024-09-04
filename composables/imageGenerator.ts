import { ref } from 'vue'

export function useImageGenerator() {
  const imageUrl = ref('')
  const isLoading = ref(false)

  const generateImage = async (prompt: string, useEnhancedPrompt: boolean) => {
    if (prompt) {
      isLoading.value = true
      imageUrl.value = ''
      try {
        let finalPrompt = prompt

        if (useEnhancedPrompt) {
          // Enhance the prompt
          const enhanceResponse = await fetch(`https://promptgen.spuckteller.workers.dev/?prompt=${encodeURIComponent(prompt)}`)

          if (!enhanceResponse.ok) {
            const errorText = await enhanceResponse.text()
            throw new Error(`Failed to enhance prompt: ${errorText}`)
          }

          const responseText = await enhanceResponse.text()

          try {
            const {response} = JSON.parse(responseText)
            const enhancedPrompt = response.response
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

        // Generate the image with the final prompt
        const imageResponse = await fetch(`https://memes.spuckteller.workers.dev/?prompt=${encodeURIComponent(finalPrompt)}`)
        if (!imageResponse.ok) throw new Error('Failed to generate image')
        const blob = await imageResponse.blob()
        imageUrl.value = URL.createObjectURL(blob)
      } catch (error) {
        console.error('Error generating image:', error)
        throw error // Re-throw the error to be handled by the caller
      } finally {
        isLoading.value = false
      }
    }
  }

  return {
    imageUrl,
    isLoading,
    generateImage
  }
}
