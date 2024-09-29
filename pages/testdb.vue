<script setup lang="ts">
import {useNuxtApp} from '#app'
import {nanoid} from 'nanoid'

const {$db} = useNuxtApp()
const client = useSupabaseClient()
const user = useSupabaseUser()

const todos = ref([])
const newTodoText = ref('')

const filteredTodos = computed(() => {
  return todos.value.filter(todo => !todo.deleted_at && !todo.completed)
})

async function loadTodos() {
  todos.value = await $db.getAll('todos')
  todos.value = todos.value.filter(todo => !todo.deleted_at && !todo.completed)
}

await loadTodos()

async function addTodo() {
  const newTodo = {
    id: nanoid(),
    text: newTodoText.value,
    created_at: new Date(),
    completed: false,
    completed_at: null,
    updated_at: new Date(),
    deleted_at: null,
    position: todos.value.length,
    image: null,
    tags: "general",
  }
  console.log("new todo", newTodo)
  // await $db.put('todos', newTodo)
  // await loadTodos()
  todos.value.push(newTodo)
  await push()
  // sync supabase TODO why should i use push?
  // if (user.value) {
  //   await client.from('todos').insert({
  //     id: newTodo.id,
  //     user_id: user.value.id,
  //     text: newTodo.text,
  //     completed: false,
  //     updated_at: newTodo.updated_at,
  //     position: newTodo.position,
  //     tags: currentTags.value.length == 0 ? currentTags.value : "",
  //   })
  // }
}

async function completeTodo(id: string) {
  let todo = await $db.get('todos', id)
  if (!todo || !todo.completed) return

  todo.completed = true
  todo.completed_at = new Date()
  todo.updated_at = new Date()
  todo.image = null

  await $db.put('todos', todo)
  await loadTodos()
  await push()
}

async function removeTodo(id: string) {
  let todo = await $db.get('todos', id)
  if (!todo) return
  todo.deleted_at = new Date()
  await $db.put('todos', todo)
  await loadTodos()
  await push()
  // sync supabase
  // if (user.value) {
  //   await client.from('todos').delete().match({ id: todo.id })
  // }
}

// Todo does it run in the background fine?
async function push() {
  // const todos = $db.getAll('todos')
  const todosWithUserId = todos.value.map(todo => ({
    ...todo,
    user_id: user.value.id,
    image: null,
  }))
  await client.from('todos').upsert(todosWithUserId, {onConflict: ['id']})
}

async function pull() {
  const {data: todos, error} = await client.from('todos').select('*').eq('user_id', user.value.id)
  if (error) return
  for (const todo of todos) {
    await $db.put('todos', todo)
  }
  await loadTodos()
}

onMounted(async () => {
  await pull()
})
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
        <input v-model="newTodoText" placeholder="What needs to be done?"
               class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500 block w-full  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
        <button @click="addTodo" class="bg-blue-500 text-white rounded-lg p-2 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700">Add</button>
      </div>
      <div class="flex flex-col space-y-4">
        <div v-for="todo in filteredTodos" :key="todo.id" class="flex items-center space-x-4">
          <input type="checkbox" :checked="todo.completed" @change="completeTodo(todo.id)"
                 class="w-4 h-4 text-blue-600 bg-gray-100 rounded border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600">
          <div class="flex-grow">
            <label class="block text-sm font-medium text-gray-900 dark:text-white">{{ todo.text }}</label>
          </div>
          <button @click="removeTodo(todo.id)" class="bg-red-500 text-white rounded-lg p-2 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700">
            Remove
          </button>
        </div>
      </div>
    </div>

  </d-page>
</template>

<style scoped>

</style>