import type { DBSchema, IDBPDatabase } from 'idb'

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

let dbPromise: Promise<IDBPDatabase<TodoDB>> | null = null

async function getDB() {
  if (!dbPromise) {
    const { openDB } = await import('idb')
    dbPromise = openDB<TodoDB>('todo-app-db', 1, {
      upgrade(db) {
        const todoStore = db.createObjectStore('todos', { keyPath: 'id' })
        todoStore.createIndex('by-position', 'position')
      },
    })
  }
  return dbPromise
}

export async function loadTodosFromIndexedDB(): Promise<Todo[]> {
  const db = await getDB()
  const todos = await db.getAllFromIndex('todos', 'by-position')
  return todos.filter(todo => !todo.deletedAt).sort((a, b) => a.position - b.position)
}

export async function updateLocalTodos(todos: Todo[]): Promise<void> {
  const db = await getDB()
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
