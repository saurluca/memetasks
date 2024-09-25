<script lang="ts">
import { defineComponent } from 'vue';
import { X } from 'lucide-vue-next';

export default defineComponent({
  name: 'SettingsPopup',
  props: {
    profileIsOpen: {
      type: Boolean,
      required: true
    },
    isDarkMode: {
      type: Boolean,
      required: true
    }
  },
  emits: ['close-profile', 'toggle-dark-mode'],
  setup(props, { emit }) {
    const closeProfile = () => {
      emit('close-profile');
    };

    const toggleDarkMode = () => {
      emit('toggle-dark-mode');
    };

    return {
      closeProfile,
      toggleDarkMode
    };
  }
});
</script>

<template>
  <div v-if="profileIsOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
    <div class="relative max-w-2xl w-full bg-slate-100 dark:bg-slate-700 rounded-lg shadow-xl min-h-[300px] p-2 flex-col flex">
      <div class="flex justify-between ">
        <div class="text-black dark:text-slate-200 text-3xl p-3 underline">
          Settings
        </div>

        <div class="flex items-center p-4">
          <button @click="toggleDarkMode"
                  class="p-2 rounded-full bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-gray-500 transition-colors duration-300 text-xl">
            <span v-if="isDarkMode" class="text-yellow-400">Lightmode ☀️</span>
            <span v-else class="text-gray-800">Darkmode  🌙</span>
          </button>
        </div>
      </div>
      <button
          @click="closeProfile "
          class="absolute -top-4 h-10 w-10 p-2 -right-4 bg-gray-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-gray-400 dark:hover:bg-slate-600 rounded-full transition-colors duration-200"
          aria-label="Close"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
      </button>

      <p class="p-4 mt-auto text-black dark:text-slate-200 text-xl">
        For feedback, support and questions contact:
        <br/>

        mail@memetasks.com
      </p>
    </div>
  </div>
</template>

<style scoped>

</style>