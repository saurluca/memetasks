<script lang="ts">
import {defineComponent} from 'vue'

export default defineComponent({
  name: "d-auth-page"
})
</script>

<template>

  <div class="h-dvh bg-slate-100 dark:bg-slate-700 transition-colors duration-300 flex p-1 items-center justify-center">
    <div
        class=" max-h-[618px] w-full mx-auto flex flex-col max-w-lg p-5 bg-white dark:bg-slate-800 rounded-lg shadow-md transition-colors duration-300">
      <slot/>
    </div>
  </div>
</template>

<style scoped>

</style>