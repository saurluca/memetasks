<script setup lang="ts">
import {computed, onMounted, onUnmounted, ref, watch} from 'vue'
import {nanoid} from 'nanoid'
import type {Tag, Todo} from '~/composables/useIndexedDB'
import {loadDataFromIndexedDB, updateLocalTags, updateLocalTodos} from '~/composables/useIndexedDB'
import ImagePopup from '~/components/ImagePopup.vue'
import TodoInput from '~/components/TodoInput.vue'
import TagManager from '~/components/TagManager.vue'
import TodoList from '~/components/TodoList.vue'
import {Settings} from 'lucide-vue-next';
import SettingsPopup from "~/components/SettingsPopup.vue";
import DPage from "~/components/d-page.vue";


// State variables
const client = useSupabaseClient()
const user = useSupabaseUser()

const todos = ref<Todo[]>([])
const tags = ref<Tag[]>([])
const isDarkMode = ref(false)
const imagePopup = ref<InstanceType<typeof ImagePopup> | null>(null)
const timeToWait = 12
const currentTags = ref<string[]>([])
const profileIsOpen = ref(false)

const numberOfCompletedTodos = computed(() => {
  return todos.value?.filter(todo => todo.completed).length
})

// Lifecycle hooks
onMounted(async () => {
  const {todos: localTodos, tags: localTags} = await loadDataFromIndexedDB()
  todos.value = localTodos
  tags.value = localTags
  isDarkMode.value = localStorage.getItem('darkMode') === 'true'
  applyDarkMode()

  if (user.value) {
    console.log("user", user.value)
    const { data: supabaseTodos } = await client
        .from('todos')
        .select('*')
        .eq('user_id', user.value.id);

    console.log("supabase todos", supabaseTodos)
    // Merge todos (local first, then Supabase)
    const mergedTodos = mergeTodos(todos.value, supabaseTodos);
    todos.value = mergedTodos;

    console.log("merged todos", todos.value)
    // Save updated todos to IndexedDB
    await updateLocalTodos(todos.value);

    // After merging, update Supabase with merged todos
    await syncSupabaseTodos(mergedTodos);

    supabaseTodos.forEach((todo) => {
      if (!localTodos.some((t) => t.id === todo.id) && !todo.deletedAt && !todo.completed) {
        console.log("supabase todo", todo)
        generateTodoImage(todo);
      }
    });
  }

  document.addEventListener('keydown', handleKeyDown)
})

// Merge local todos with Supabase todos
const mergeTodos = (localTodos: Todo[], supabaseTodos: Todo[]) => {
  const todoMap = new Map<string, Todo>();

  // Add local todos to map
  localTodos.forEach((todo) => {
    todoMap.set(todo.id, todo);
  });

  // Merge Supabase todos
  supabaseTodos.forEach((todo) => {
    if (todoMap.has(todo.id)) {
      const localTodo = todoMap.get(todo.id);

      // If either is completed or deleted, prefer the completed/deleted state
      if (localTodo.completed || todo.completed) {
        localTodo.completed = true;
        localTodo.image = null;
        localTodo.completedAt = todo.completedAt;
        localTodo.updatedAt = todo.updatedAt;
      }
      if (localTodo.deletedAt || todo.deletedAt) {
        localTodo.deletedAt = localTodo.deletedAt || todo.deletedAt;
        localTodo.image = null;
      }

      todoMap.set(todo.id, localTodo);
    } else {
      // Add missing Supabase task to local
      todoMap.set(todo.id, todo);
    }
  });

  return Array.from(todoMap.values());
};

// Sync merged todos to Supabase
const syncSupabaseTodos = async (mergedTodos: Todo[]) => {
  // Create an array of todos to upsert
  const todosToUpsert = mergedTodos.map(todo => ({
    id: todo.id,
    user_id: user.value.id,
    text: todo.text,
    completed: todo.completed,
    completed_at: todo.completedAt,
    updated_at: todo.updatedAt,
    deleted_at: todo.deletedAt,
    position: todo.position,
    tags: todo.tags,
  }));

  // Perform bulk upsert
  const { data, error } = await client
      .from('todos')
      .upsert(todosToUpsert, { onConflict: ['id'] }); // 'id' is used to avoid duplicates

  if (error) {
    console.error('Error upserting todos:', error);
  } else {
    console.log('Todos synced successfully:', data);
  }
};

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
})

function arrayBufferToBlob(buffer, type) {
  return new Blob([buffer], { type: type });
}

function blobToArrayBuffer(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('loadend', () => {
      resolve(reader.result);
    });
    reader.addEventListener('error', reject);
    reader.readAsArrayBuffer(blob);
  });
}

// Methods
const addTodo = async (text: string) => {
  const newTodo: Todo = {
    id: nanoid(),
    text: text,
    createdAt: new Date(),
    completed: false,
    completedAt: null,
    updatedAt: new Date(),
    deletedAt: null,
    position: todos.value.length,
    image: null,
    tags: currentTags.value.length > 0 ? [...currentTags.value] : [],
  }

  todos.value.push(newTodo)
  await updateLocalTodos(todos.value)

  // add task to supabase
  if (user.value) {
    await client.from('todos').insert({
      id: newTodo.id,
      user_id: user.value.id,
      text: newTodo.text,
      completed: false,
      tags: currentTags.value.length == 0 ? currentTags.value : "",
    })
    console.log("added task to supabase")
  }

  await generateTodoImage(newTodo)
}

const deleteTodo = async (id: string) => {
  const index = todos.value.findIndex(t => t.id === id)
  if (index !== -1) {
    // Soft delete by setting deletedAt to the current date
    todos.value[index].deletedAt = new Date()
    await updateLocalTodos(todos.value)

    // delete task from supabase
    if (user.value) {
      await client.from('todos').delete().match({ id: id })
      console.log("deleted task from supabase")
    }
  }
}

const toggleTodo = async (todo: Todo) => {
  if (!todo.completed) {
    todo.completed = true
    todo.completedAt = new Date()
    todo.updatedAt = new Date()

    imagePopup.value?.resetImageBlob()
    if (todo.image) {
      const imageBlob = arrayBufferToBlob(todo.image, 'image/png')
      imagePopup.value?.setError("There is an image")
      imagePopup.value?.setImageBlob(imageBlob)
    } else {
      imagePopup.value?.setError("There was no image")
    }

    imagePopup.value?.open()

    await updateLocalTodos(todos.value);

    // update task in supabase
    if (user.value) {
      await client.from('todos').update({
        completed: todo.completed,
        completed_at: todo.completed ? todo.completedAt : null,
        updated_at: todo.updatedAt,
      }).match({ id: todo.id })
      console.log("updated task in supabase")
    }
  }
}

const generateTodoImage = async (newTodo: Todo) => {
  const {generateImage} = useMemeGenerator() ;

  try {
    const result = await generateImage(newTodo.text)
    if (result) {
      console.log("image received for", newTodo.text)
      const todoIndex = todos.value.findIndex(todo => todo.id === newTodo.id)
      if (todoIndex !== -1) {
        todos.value[todoIndex].image = await blobToArrayBuffer(result)
        await updateLocalTodos(todos.value)
      }
    }
  } catch (error) {
    console.error('Error generating image:', error)
  }
}

const addTag = async (text: string) => {
  const newTag: Tag = {
    id: nanoid(),
    text: text,
    createdAt: new Date(),
    deletedAt: null,
  }

  tags.value.push(newTag)
  await updateLocalTags(tags.value)

  if (user.value) {
    await client.from('tags').insert({
      id: newTag.id,
      user_id: user.value.id,
      text: newTag.text,
    })
  }
}

const toggleTag = (tagText: string) => {
  if (currentTags.value.includes(tagText)) {
    currentTags.value = []
  } else {
    // Deselect all tags first
    currentTags.value = []
    // Select the new tag
    currentTags.value.push(tagText)
  }
}

const removeSelectedTags = async () => {
  tags.value = tags.value.filter(tag => !currentTags.value.includes(tag.text))
  currentTags.value = []
  await updateLocalTags(tags.value)

  if (user.value) {
    await client.from('tags').delete().match({ id: currentTags.value })
  }
}

// Dark mode functionality
const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value
}

const applyDarkMode = () => {
  if (isDarkMode.value) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

// Event handlers
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    imagePopup.value?.close()
    closeProfile();
  }
}

// Watchers
watch(isDarkMode, () => {
  localStorage.setItem('darkMode', isDarkMode.value.toString())
  applyDarkMode()
})

// Methods
const openProfile = () => {
  profileIsOpen.value = true;
}

const closeProfile = () => {
  profileIsOpen.value = false;
}

useSeoMeta({
  title: 'Memetasks',
  ogTitle: 'Memetasks',
  description: 'Memetasks is a simple, fun and rewarding todo app with personal memes for you!',
  ogDescription: 'Memetasks is a simple, fun and rewarding todo app with personal memes for you!',
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
          :current-tags="currentTags"
          @toggle-tag="toggleTag"
          @add-tag="addTag"
          @remove-selected-tags="removeSelectedTags"
      />
      <TodoList
          :todos="todos"
          :current-tags="currentTags"
          :time-to-wait="timeToWait"
          @toggle-todo="toggleTodo"
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
