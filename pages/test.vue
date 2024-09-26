<script setup>
import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://vzhyoyderddegkvtwnnq.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6aHlveWRlcmRkZWdrdnR3bm5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjczMzI2NTEsImV4cCI6MjA0MjkwODY1MX0.hfDQaknbn8DWwfYAqFS7jFboqbMFpg2QXKTBcK-Rllo')
const posts = ref([])

async function getPosts() {
  const { data } = await supabase.from('posts').select()
  posts.value = data
}

onMounted(() => {
  getPosts()
})
</script>

<template>
  <div class="text-white bg-black">
    hello world
    <ul class="text-white bg-black">
      <li v-for="post in posts" :key="post.id">{{ post.name }}!</li>
    </ul>
  </div>
</template>