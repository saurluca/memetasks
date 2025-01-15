<script setup lang="ts">

</script>


<template>
  <div class="h-dvh bg-slate-100 dark:bg-slate-700 text- transition-colors duration-300 flex p-1 items-center justify-center">
    <div class="h-full max-h-[618px] w-full mx-auto flex flex-col max-w-2xl p-2 md:p-7 bg-white dark:bg-slate-800 rounded-lg shadow-md transition-colors duration-300 ">
      <slot/>
    </div>
  </div>
</template>

<style scoped>

</style>