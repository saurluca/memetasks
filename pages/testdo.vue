<script setup lang="ts">
import {nanoid} from 'nanoid'
const client = useSupabaseClient()
const user = useSupabaseUser()

const loading = ref(false)
const newTodo = ref('')

const { data: todos } = await useAsyncData('todos', async () => {
  console.log("loading")
  const { data } = await client.from('todos').select('*')
  console.log("loaded")
  return data
})

async function addTodo() {
  if (newTodo.value.trim().length === 0) return

  loading.value = true

  const { data } = await client.from('todos')
      .upsert({
        id: nanoid(),
        user_id: user.value.id,
        text: newTodo.value,
        completed: false,
      })
      .select('id, text, completed')
      .single()

  todos.value.push(data)
  newTodo.value = ''
  loading.value = false
}

const filteredTodos = computed(() => {
  return todos.value.filter(todo => !todo.completed)
})


const completeTodo = async (todo: Todo) => {
  await client.from('todos').update({ completed: todo.completed }).match({ id: todo.id })
}

const removeTodo = async (todo: Todo) => {
  todos.value = todos.value.filter(t => t.id !== todo.id)
  await client.from('todos').delete().match({ id: todo.id })
}
</script>

<template>
  <d-page>
    <div class="flex justify-between items-center mb-4">
      <div class="flex items-center">
        <h1 class="text-2xl font-bold text-slate-800 dark:text-slate-200">Todos</h1>
      </div>

    </div>
    <div class="flex flex-col space-y-4">
      <div class="flex items-center space-x-4">
        <input v-model="newTodo" placeholder="What needs to be done?" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500 block w-full  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
        <button @click="addTodo" class="bg-blue-500 text-white rounded-lg p-2 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700">Add</button>
      </div>
      <div class="flex flex-col space-y-4">
        <div v-for="todo in filteredTodos" :key="todo.id" class="flex items-center space-x-4">
          <input type="checkbox" :checked="todo.completed" @change="completeTodo(todo)" class="w-4 h-4 text-blue-600 bg-gray-100 rounded border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600">
          <div class="flex-grow">
            <label class="block text-sm font-medium text-gray-900 dark:text-white">{{ todo.text }}</label>
          </div>
          <button @click="removeTodo(todo)" class="bg-red-500 text-white rounded-lg p-2 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700">Remove</button>
        </div>
      </div>
    </div>

  </d-page>
</template>

<style scoped>

</style>