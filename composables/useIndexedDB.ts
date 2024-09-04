import { openDB } from 'idb'
import type { DBSchema } from 'idb'

interface Todo {
  id: string
  text: string
  completed: boolean
  completedAt: Date | null
  updatedAt: Date
  deletedAt: Date | null
  position: number
}

interface TodoDB extends DBSchema {
  todos: {
    key: string
    value: Todo
    indexes: { 'by-position': number }
  }
}

const dbPromise = openDB<TodoDB>('todo-app-db', 1, {
  upgrade(db) {
    const todoStore = db.createObjectStore('todos', { keyPath: 'id' })
    todoStore.createIndex('by-position', 'position')
  },
})

export async function loadTodosFromIndexedDB(): Promise<Todo[]> {
  const db = await dbPromise
  const todos = await db.getAllFromIndex('todos', 'by-position')
  return todos
    .filter(todo => !todo.deletedAt)
    .sort((a, b) => a.position - b.position)
    .map((todo, index) => ({
      ...todo,
      position: index,
      completedAt: todo.completedAt ? new Date(todo.completedAt) : null,
      updatedAt: new Date(todo.updatedAt),
      deletedAt: todo.deletedAt ? new Date(todo.deletedAt) : null
    }))
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
      completedAt: todo.completedAt ? new Date(todo.completedAt).toISOString() : null,
      updatedAt: new Date(todo.updatedAt).toISOString(),
      deletedAt: todo.deletedAt ? new Date(todo.deletedAt).toISOString() : null,
      position: todo.position
    }
    await store.put(cloneableTodo)
  }

  await tx.done
}
