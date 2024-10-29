<script lang="ts" setup>
const router = useRouter();
const client = useSupabaseClient();

const email = ref("");
const password = ref("");
const errorMsg = ref("");

async function login() {
  try {
    const {error} = await client.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    });
    if (error) {
      throw error;
    }
    await router.push("/");
  } catch (error) {
    errorMsg.value = error.message;
  }
}
</script>

<template>
  <d-auth-page>
    <div class="flex justify-between items-center mb-4">
      <div class="flex items-center">
        <h1 class="text-2xl font-bold text-slate-800 dark:text-slate-200">Login</h1>
      </div>

    </div>
    <form @submit.prevent="login">
      <div class="mb-4">
        <input id="email" v-model="email" autocomplete="username" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500 block w-full  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
               placeholder="Enter your email"
               type="email">
      </div>
      <div class="mb-6">
        <input id="password" v-model="password" autocomplete="current-password" class="bg-gray-50 border border-gray-30>0 text-gray-900 text-sm rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500 block w-full  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
               placeholder="Enter your password"
               type="password">
      </div>
      <div class="mb-4 flex justify-center text-red-500">
        {{ errorMsg }}
      </div>
      <button class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              type="submit">
        Login
      </button>
    </form>


    <div class="flex mt-2 justify-center text-slate-500 text-sm">
      <div class="text">
        <nuxt-link to="/sign_up">No account yet? Sign up</nuxt-link>
      </div>
    </div>
  </d-auth-page>
</template>

<style scoped>

</style>