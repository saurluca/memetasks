import type {DBSchema} from 'idb'
import {openDB} from 'idb'
import {toRaw} from 'vue'
import {nanoid} from 'nanoid'

export interface Tag {
    id: string
    text: string
    created_at: Date
    deleted_at: Date | null
}

export interface Todo {
    id: string
    text: string
    created_at: Date
    completed: boolean
    completed_at: Date | null
    updated_at: Date
    deleted_at: Date | null
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
            const todoStore = db.createObjectStore('todos', {keyPath: 'id'})
            todoStore.createIndex('by-position', 'position')
        }
        if (oldVersion < 2) {
            if (!db.objectStoreNames.contains('tags')) {
                const tagStore = db.createObjectStore('tags', {keyPath: 'id'})

                // Add default tags
                const now = new Date()
                tagStore.add({
                    id: nanoid(),
                    text: 'general',
                    created_at: now,
                    deleted_at: null
                })
                tagStore.add({
                    id: nanoid(),
                    text: 'work',
                    created_at: now,
                    deleted_at: null
                })
            }
        }
        if (oldVersion < 3) {
            // Reference already existing todoStore from version 1
            const todoStore = transaction.objectStore('todos');

            const now = new Date()
            todoStore.add({
                id: nanoid(),
                text: "Create your first todo and check out your first meme!",
                created_at: now,
                completed: false,
                completed_at: null,
                updated_at: now,
                deleted_at: null,
                position: 0,
                image: null,
                tags: [],
            })

            todoStore.add({
                id: nanoid(),
                text: "Create your first tag by clicking on the +, select it and create another task!",
                created_at: now,
                completed: false,
                completed_at: null,
                updated_at: now,
                deleted_at: null,
                position: 1,
                image: null,
                tags: [],
            })

            todoStore.add({
                id: nanoid(),
                text: "Click to expand: Psychology shows that only sometimes getting a reward feels more rewarding. So there won't be a meme every time!",
                created_at: now,
                completed: false,
                completed_at: null,
                updated_at: now,
                deleted_at: null,
                position: 2,
                image: null,
                tags: [],
            })
        }
    },
})

export async function loadDataFromIndexedDB(): Promise<{ todos: Todo[], tags: Tag[]}> {
    const db = await dbPromise
    const todos = await db.getAllFromIndex('todos', 'by-position')
    const allTags = await db.getAll('tags')

    return {
        todos: todos
            .sort((a, b) => a.position - b.position)
            .map((todo, index) => ({
                ...todo,
                position: index,
                completed_at: todo.completed_at ? new Date(todo.completed_at) : null,
                updated_at: new Date(todo.updated_at),
                deleted_at: todo.deleted_at ? new Date(todo.deleted_at) : null
            })),
        tags: allTags.filter(tag => !tag.deleted_at),
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
            completed_at: todo.completed_at ? new Date(todo.completed_at) : null,
            updated_at: new Date(todo.updated_at),
            deleted_at: todo.deleted_at ? new Date(todo.deleted_at) : null,
            position: todo.position,
            image: todo.image ? todo.image : null,
            created_at: new Date(todo.created_at),
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
            created_at: new Date(tag.created_at),
            deleted_at: tag.deleted_at ? new Date(tag.deleted_at) : null
        }
        await store.put(cloneableTag)
    }

    await tx.done
}
