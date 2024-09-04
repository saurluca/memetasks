import { ref } from 'vue'

export function useImageGenerator() {
  const imageUrl = ref('')
  const imageBlob = ref<Blob | null>(null)
  const isLoading = ref(false)

  const generateImage = async (prompt: string, useEnhancedPrompt: boolean) => {
    console.log('generateImage called with prompt:', prompt, 'and useEnhancedPrompt:', useEnhancedPrompt)
    if (prompt) {
      isLoading.value = true
      imageUrl.value = ''
      imageBlob.value = null
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
        console.log('imageResponse', imageResponse)
        if (!imageResponse.ok) throw new Error('Failed to generate image')
        const blob = await imageResponse.blob()
        imageBlob.value = blob
        console.log('imageBlob', imageBlob.value)
        imageUrl.value = URL.createObjectURL(blob)

        // Return the imageBlob and imageUrl
        return { imageBlob: imageBlob.value, imageUrl: imageUrl.value }
      } catch (error) {
        console.error('Error generating image:', error)
        throw error // Re-throw the error to be handled by the caller
      } finally {
        isLoading.value = false
      }
    }
    // Return null if no prompt was provided
    return { imageBlob: null, imageUrl: '' }
  }

  return {
    imageUrl,
    imageBlob,
    isLoading,
    generateImage
  }
}
