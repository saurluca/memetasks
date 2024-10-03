<script setup lang="ts">
import {nanoid} from 'nanoid'
import {Settings} from 'lucide-vue-next';
import {useDark, useStorage, useToggle} from '@vueuse/core'
import SettingsPopup from "~/components/SettingsPopup.vue";

// State variables
const {$db} = useNuxtApp()
const client = useSupabaseClient()
const user = useSupabaseUser()

const lastPull = useStorage('last-pull', null)
const lastPush = useStorage('last-push', null)
const todos = ref<Todo[]>([])
const tags = ref<Tag[]>([])
const showDeletedTodos = ref(false)
const imagePopup = ref<InstanceType<typeof ImagePopup> | null>(null)
const currentTag = ref("")
const profileIsOpen = ref(false)
const isDarkMode = useDark()
const toggleDarkMode = useToggle(isDarkMode)


// Lifecycle hooks
onMounted(async () => {
  await load()
  await pull()
  document.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
})

function arrayBufferToBlob(buffer, type) {
  return new Blob([buffer], {type: type});
}

async function blobToArrayBuffer(blob) {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('loadend', () => {
      resolve(reader.result);
    });
    reader.addEventListener('error', reject);
    reader.readAsArrayBuffer(blob);
  });
}

async function load() {
  if (!$db) return console.error("No DB")
  todos.value = await $db.getAll('todos')
  const fetchedTags = await $db.getAll('tags')
  tags.value = fetchedTags.filter(tag => !tag.deleted_at)
}

async function pull() {
  if (!user.value) return  // if user is not logged in, don't pull
  let query = client
      .from('todos')
      .select('*')
      .eq('user_id', user.value.id)
      .order('created_at')

  if (lastPull.value) {
    query = query.gte('updated_at', new Date(lastPull.value).toISOString())
  }

  try {
    const { data: todos, error } = await query
    if (error) {
      console.error('Error pulling todos:', error)
      return
    }

    let queue = []

    for (const todo of todos) {
      if (!todo.completed) {
        const localTodo = await $db.get('todos', todo.id)
        if (localTodo) {
          todo.image = localTodo.image
        } else {
          queue.push(generateTodoImage(todo))
        }
      }
      await $db.put('todos', todo)
    }
    await load()
    await Promise.all(queue)

    lastPull.value = new Date().toISOString()
  } catch (err) {
    console.error('Unexpected error:', err.message);
  }
}

async function push() {
  console.log("push")
  if (!user.value) return  // if user is not logged in, don't push
  const dbTodos = await $db.getAll('todos')
  if (!dbTodos) return
  const newTodos = dbTodos.filter(todo => new Date(todo.updated_at) > new Date(lastPush.value))
  if (newTodos.length === 0) return
  // add user id and remove image column
  const todosWithUserId = newTodos.map(({ image, ...todo }) => ({
    ...todo,
    tags: (!todo.tags || todo.tags === "[]") ? "" : todo.tags,
    user_id: user.value.id,
  }));
  // const todoWithTags = todosWithUserId.filter(todo => todo.tags)

  try {
    const {error } = await client.from('todos').upsert(todosWithUserId, { onConflict: ['id'] });
    if (error) {
      console.error('Error upserting todos:', error.message);
    } else {
      console.log('Upsert successful');
      lastPush.value = new Date()
    }
  } catch (err) {
    console.error('Unexpected error:', err.message);
  }
}

// Methods
const addTodo = async (text: string) => {
  const newTodo: Todo = {
    id: nanoid(),
    text: text,
    created_at: new Date(),
    completed: false,
    completed_at: null,
    updated_at: new Date(),
    deleted_at: null,
    position: todos.value.length + 1,
    image: null,
    tags: currentTag.value ? currentTag.value : null,
  }
  console.log("newTodo", newTodo)
  await $db.put('todos', newTodo)
  await load()
  await push()

  await generateTodoImage(newTodo)
}

const deleteTodo = async (id: string) => {
  let todo = await $db.get('todos', id)
  if (!todo) return
  todo.deleted_at = new Date()
  todo.updated_at = new Date()
  await $db.put('todos', todo)
  await load()
  await push()
}

const completeTodo = async (id: string) => {
  let todo = await $db.get('todos', id)
  if (!todo || todo.completed) return
  const image = todo.image

  todo.completed = true
  todo.completed_at = new Date()
  todo.updated_at = new Date()
  todo.image = null // delete image, no longer needed

  await $db.put('todos', todo)
  await load()
  await push()

  imagePopup.value?.resetImageBlob()
  if (image) {
    const imageBlob = arrayBufferToBlob(image, 'image/png')
    imagePopup.value?.setError("There is an image")
    imagePopup.value?.setImageBlob(imageBlob)
  } else {
    imagePopup.value?.setError("There was no image")
  }
  imagePopup.value?.open()

}

const generateTodoImage = async (todo: Todo) => {
  const {generateImage} = useMemeGenerator();
  try {
    console.log(`generate image for ${todo.text}`)
    const result = await generateImage(todo.text)
    if (!result) return
    console.log("image received for", todo.text)
    todo.image = await blobToArrayBuffer(result)
    await $db.put('todos', todo)
    await load()
    // await uploadImage(result)
  } catch (error) {
    console.error('Error generating image:', error)
  }
}

const numberOfCompletedTodos = computed(() => {
  return todos.value?.filter(todo => todo.completed).length
})

const filterOutTags = (todos: Todo[]) => {
  if (!currentTag.value) {
    return todos
  } else {
    return todos.filter(todo => todo.tags && currentTag.value == todo.tags)
  }
}

// filter and reverse sort active todos based on created_at
const filterForActiveTodos = (todos: Todo[]) => {
  return todos.filter(todo => !todo.deleted_at && !todo.completed).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
}

// filter and reverse sort deleted todos based on completed_at
const filterForCompletedTodos = (todos: Todo[]) => {
  return todos.filter(todo => !todo.deleted_at && todo.completed).sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime())
}

const filterOutDeletedTodos = (todos: Todo[]) => {
  return todos.filter(todo => !todo.deleted_at)
}

const filteredTodos = computed(() => {
  const realTodos = filterOutDeletedTodos(todos.value)
  const tagFilteredTodos = filterOutTags(realTodos)
  const activeTodos = filterForActiveTodos(tagFilteredTodos)
  if (showDeletedTodos.value) {
    const deletedTodos = filterForCompletedTodos(tagFilteredTodos)
    return [...activeTodos, ...deletedTodos];
  } else {
    return activeTodos
  }
}, {
  deep: true
});

const addTag = async (text: string) => {
  const newTag: Tag = {
    id: nanoid(),
    text: text,
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: null,
  }
  tags.value.push(newTag)
  await $db.put('tags', newTag)
  await load()
}

const toggleTag = (tagText: string) => {
  if (currentTag.value == tagText) {
    currentTag.value = ""
  } else {
    currentTag.value = tagText
  }
}

const removeSelectedTags = async () => {
  // remove currentTag from tags
  const selectedTag = tags.value.find(tag => tag.text == currentTag.value)
  if (!selectedTag) return

  selectedTag.deleted_at = new Date().toISOString()
  console.log("selectedTag", selectedTag)
  await $db.put('tags', {...selectedTag})

  // remove currentTag from currentTag
  currentTag.value = ""
  await load()
}

// Event handlers
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    imagePopup.value?.close()
    closeProfile();
  }
}

//helper methods
const openProfile = () => {  profileIsOpen.value = true }

const closeProfile = () => { profileIsOpen.value = false }

const toggleShowDeletedTodos = () => { showDeletedTodos.value = !showDeletedTodos.value }

useSeoMeta({
  title: 'Memetasks',
  ogTitle: 'Memetasks',
  description: 'Memetasks is a simple, fun and rewarding todo app with personal memes for you!',
  ogDescription: 'Memetasks is a simple, fun and rewarding todo app with personal memes for you!',
  //Todo add image
})

</script>

<template>
  <d-page>
    <div class="flex justify-between items-center mb-4">
      <div class="flex items-center">
        <div
            class="bg-amber-300 text-black rounded-full p-0.5 font-bold text-xl text-center shadow-lg border-2 border-amber-500 w-{{Math.max(1, numberOfCompletedTodos / 10) + 8 }} h-{{ Math.max(1, numberOfCompletedTodos / 10) + 4 }} flex items-center justify-center mr-2">
          {{ numberOfCompletedTodos }}
        </div>
        <h1 class="text-2xl font-bold text-slate-800 dark:text-slate-200">Meme your tasks!</h1>
      </div>

      <button class="dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-full p-1" @click="openProfile">
        <Settings class="text-black dark:text-slate-200 h-7 w-7"/>
      </button>
    </div>

    <TodoInput @add-todo="addTodo"/>
    <TagManager
        :tags="tags"
        :currentTag="currentTag"
        @toggle-tag="toggleTag"
        @add-tag="addTag"
        @remove-selected-tags="removeSelectedTags"
    />
    <TodoList
        :filteredTodos="filteredTodos"
        :currentTag="currentTag"
        :showDeletedTodos="showDeletedTodos"
        @toggle-show-deleted-todos="toggleShowDeletedTodos"
        @toggle-todo="completeTodo"
        @delete-todo="deleteTodo"
    />
    <SettingsPopup
        :profile-is-open="profileIsOpen"
        @close-profile="closeProfile"
        @toggle-dark-mode="toggleDarkMode"
        :is-dark-mode="isDarkMode"
    />
  </d-page>
  <ImagePopup ref="imagePopup"/>
</template>
