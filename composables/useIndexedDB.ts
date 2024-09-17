import { openDB } from 'idb'
import type { DBSchema } from 'idb'
import { toRaw } from 'vue'
import { nanoid } from 'nanoid'

export interface Tag {
  id: string
  text: string
  createdAt: Date
  deletedAt: Date | null
}

export interface Todo {
  id: string
  text: string
  createdAt: Date
  completed: boolean
  completedAt: Date | null
  updatedAt: Date
  deletedAt: Date | null
  position: number
  image: Blob | null
  tags: string[]
}

interface TodoDB extends DBSchema {
  todos: {
    key: string
    value: Todo
    indexes: { 'by-position': number }
  }
  tags: {
    key: string
    value: Tag
  }
}

const dbPromise = openDB<TodoDB>('todo-app-db', 3, {
  upgrade(db, oldVersion, newVersion, transaction) {
    if (oldVersion < 1) {
      const todoStore = db.createObjectStore('todos', { keyPath: 'id' })
      todoStore.createIndex('by-position', 'position')
    }
    if (oldVersion < 2) {
      if (!db.objectStoreNames.contains('tags')) {
        const tagStore = db.createObjectStore('tags', { keyPath: 'id' })
        
        // Add default tags
        const now = new Date()
        tagStore.add({
          id: nanoid(),
          text: 'general',
          createdAt: now,
          deletedAt: null
        })
        tagStore.add({
          id: nanoid(),
          text: 'work',
          createdAt: now,
          deletedAt: null
        })
      }
    }
    if (oldVersion < 3) {
      if (!db.objectStoreNames.contains('todos')) {
        const todoStore = db.createObjectStore('todos', { keyPath: 'id' })

        const now = new Date()
        todoStore.add({
          id: nanoid(),
          text: "Create your first todo and check out your first meme!",
          createdAt: now,
          completed: false,
          completedAt: null,
          updatedAt: now,
          deletedAt: null,
          position: 0,
          image: null,
          tags: [],
        })

        todoStore.add({
          id: nanoid(),
          text: "Create your first tag by click on the +, select it and create another task!",
          createdAt: now,
          completed: false,
          completedAt: null,
          updatedAt: now,
          deletedAt: null,
          position: 1,
          image: null,
          tags: [],
        })

        todoStore.add({
          id: nanoid(),
          text: "Psychology shows, that only sometimes getting a reward feels more rewarding. So there won't be a meme every time!",
          createdAt: now,
          completed: false,
          completedAt: null,
          updatedAt: now,
          deletedAt: null,
          position: 2,
          image: null,
          tags: [],
        })
      }
    }
  },
})

export async function loadDataFromIndexedDB(): Promise<{ todos: Todo[], tags: Tag[], completedTodos: number }> {
  const db = await dbPromise
  const todos = await db.getAllFromIndex('todos', 'by-position')
  const allTags = await db.getAll('tags')
  
  return {
    todos: todos
      .sort((a, b) => a.position - b.position)
      .map((todo, index) => ({
        ...todo,
        position: index,
        completedAt: todo.completedAt ? new Date(todo.completedAt) : null,
        updatedAt: new Date(todo.updatedAt),
        deletedAt: todo.deletedAt ? new Date(todo.deletedAt) : null
      })),
    tags: allTags.filter(tag => !tag.deletedAt),
    completedTodos: todos.filter(todo => todo.completed).length
  }
}


export async function updateLocalTodos(todos: Todo[]): Promise<void> {
  const db = await dbPromise
  const tx = db.transaction('todos', 'readwrite')
  const store = tx.objectStore('todos')

  // Clear existing todos
  await store.clear()

  // Add updated todos
  for (const todo of todos) {
    const cloneableTodo = {
      id: todo.id,
      text: todo.text,
      completed: todo.completed,
      completedAt: todo.completedAt ? new Date(todo.completedAt) : null,
      updatedAt: new Date(todo.updatedAt),
      deletedAt: todo.deletedAt ? new Date(todo.deletedAt) : null,
      position: todo.position,
      image: todo.image ? todo.image : null,
      createdAt: new Date(todo.createdAt),
      tags: Array.isArray(todo.tags) ? toRaw(todo.tags) : [],
    }
    await store.put(cloneableTodo)
  }

  await tx.done
}

export async function updateLocalTags(tags: Tag[]): Promise<void> {
  const db = await dbPromise
  const tx = db.transaction('tags', 'readwrite')
  const store = tx.objectStore('tags')

  // Clear existing tags
  await store.clear()

  // Add updated tags
  for (const tag of tags) {
    const cloneableTag = {
      ...tag,
      createdAt: new Date(tag.createdAt),
      deletedAt: tag.deletedAt ? new Date(tag.deletedAt) : null
    }
    await store.put(cloneableTag)
  }

  await tx.done
}
