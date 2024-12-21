<script lang="ts" setup>
import {House} from "lucide-vue-next";

const client = useSupabaseClient();
const email = ref("");
const password = ref("");
const errorMsg = ref("");
const successMsg = ref("");

async function sign_up() {
  console.log("sign_up called")
  try {
    const {data, error} = await client.auth.signUp({
      email: email.value,
      password: password.value,
    });
    if (error) {
      throw error;
    } else {
      errorMsg.value = ""
    }
    successMsg.value = "Check your email to confirm your account";
  } catch (error) {
    errorMsg.value = error.message;
  }
}

</script>

<template>
  <d-auth-page>
    <div class="flex justify-between items-center mb-4">
      <div class="flex items-center">
        <h1 class="text-2xl font-bold text-slate-800 dark:text-slate-200">Sign up</h1>
      </div>

      <router-link to="/">
        <button class="dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-full p-1.5">
          <House class="text-black dark:text-slate-200 h-6 w-6"/>
        </button>
      </router-link>

    </div>
    <form class="flex flex-col " @submit.prevent="sign_up">
      <div class="mb-4">
        <input id="email" v-model="email" autocomplete="username"
               class="bg-gray-50 border text-slate-900  rounded-lg text-sm  block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white  "
               placeholder="Enter your email"
               type="email">
      </div>
      <div class="mb-6">
        <input id="password" v-model="password" autocomplete="new-password"
               class="bg-gray-50 border text-gray-900  rounded-lg text-sm block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
               placeholder="Enter your password"
               type="password">
      </div>

      <div class="mb-4 flex justify-center text-sm">
        <div class=" text-red-500">
          {{ errorMsg }}
        </div>
        <div class="text-green-500">
          {{ successMsg }}
        </div>
      </div>
      <button
          class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          type="submit">
        Sign up
      </button>
    </form>

    <div class="flex mt-2 justify-center text-slate-500 text-sm">
      <div class="text">
        <nuxt-link to="/login">Already have an account? Login</nuxt-link>
      </div>
    </div>
  </d-auth-page>
</template>

<style scoped>

</style>