<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useMemeGenerator } from '~/composables/memeGenerator'
import { nanoid } from 'nanoid'

const { generateImage } = useMemeGenerator()
const memes = ref<{ id: string; url: string; prompt: string }[]>([])
const isLoading = ref(false)
const containerRef = ref<HTMLElement | null>(null)
const maxDisplayedMemes = ref(6)

// Example prompts - replace these with your list later
// const prompts = [
//   "A cat programming on a computer",
//   "A dog doing yoga",
//   "A penguin wearing a business suit",
//   // You'll add more prompts here
// ]



const prompts = [
    "Reply to emails and clear the inbox.",
  "Schedule a team meeting for next week.",
  "Prepare a presentation for the quarterly review.",
  "Submit the monthly expense report.",
  "Review and approve pending project proposals.",
  "Follow up with a client on their feedback.",
  "Update the team on project progress in the chat.",
  "Complete the training module for new software.",
  "Write documentation for the latest feature release.",
  "Organize the files on the shared drive."
];


const displayedMemes = computed(() => {
  return memes.value.slice(0, maxDisplayedMemes.value)
})

const generateMeme = async (prompt: string) => {
  const blob = await generateImage(prompt)
  if (blob) {
    memes.value.push({
      id: Math.random().toString(36).substring(7),
      url: URL.createObjectURL(blob),
      prompt
    })
  }
}

const loadMoreMemes = async () => {
  if (isLoading.value) return
  isLoading.value = true
  
  const currentIndex = memes.value.length
  const promisesToGenerate = prompts
    .slice(currentIndex, currentIndex + 2)
    .map(prompt => generateMeme(prompt))
    
  await Promise.all(promisesToGenerate)
  isLoading.value = false
}

const { isLoading: isScrollLoading } = useInfiniteScroll(
  containerRef,
  async () => {
    if (maxDisplayedMemes.value < memes.value.length) {
      maxDisplayedMemes.value += 2
    } else {
      await loadMoreMemes()
    }
  },
  { distance: 10 }
)

const downloadMeme = async (meme: { url: string, prompt: string }) => {
  try {
    const response = await fetch(meme.url)
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `meme-${meme.prompt.slice(0, 30)}-${nanoid()}.png`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  } catch (error) {
    console.error('Error downloading meme:', error)
  }
}

onMounted(() => {
  loadMoreMemes()
})
</script>

<template>
  <div class="h-dvh bg-slate-100 dark:bg-slate-700 text- transition-colors duration-300 flex p-1 items-center justify-center">
    <div class="h-full w-full mx-auto flex flex-col max-w-2xl p-2 md:p-7 bg-white dark:bg-slate-800 rounded-lg shadow-md transition-colors duration-300">
      <h1 class="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4">Meme Gallery</h1>
      
      <div 
        ref="containerRef"
        class="h-[calc(100vh-8rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 dark:hover:scrollbar-thumb-gray-500"
      >
        <div class="space-y-4">
          <div v-for="meme in displayedMemes" :key="meme.id" class="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
            <img :src="meme.url" :alt="meme.prompt" class="w-full rounded-lg shadow-md" />
            <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">{{ meme.prompt }}</p>
            <button 
              @click="downloadMeme(meme)" 
              class="mt-2 w-full bg-green-500 text-white flex justify-center text-xl rounded-lg p-2 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
            >
              Download
            </button>
          </div>
          
          <div v-if="isLoading || isScrollLoading" class="flex justify-center py-4">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800 dark:border-slate-200"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>