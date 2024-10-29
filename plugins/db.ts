import { defineNuxtPlugin } from '#app'
import type {DBSchema} from 'idb'
import {openDB} from 'idb'
import {nanoid} from 'nanoid'

export interface Tag {
    id: string
    text: string
    created_at: Date
    updated_at: Date
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
    due_at: Date | null
    position: number
    image: Blob | ArrayBuffer | null
    tags: string | null
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

export default defineNuxtPlugin(async (nuxtApp) => {
    // Initialize the IndexedDB database
    const db = await openDB<TodoDB>('todo-app-db', 3, {
        upgrade(db, oldVersion, newVersion, transaction) {
            if (oldVersion < 1) {
                if (!db.objectStoreNames.contains('todos')) {
                    db.createObjectStore('todos', {keyPath: 'id'})
                }
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
                        updated_at: now,
                        deleted_at: null
                    })
                    tagStore.add({
                        id: nanoid(),
                        text: 'work',
                        created_at: now,
                        updated_at: now,
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
                    due_at: null,
                    position: 0,
                    image: null,
                    tags: "",
                })

                todoStore.add({
                    id: nanoid(),
                    text: "Create your first tag by clicking on the +, select it and create another task!",
                    created_at: now,
                    completed: false,
                    completed_at: null,
                    updated_at: now,
                    deleted_at: null,
                    due_at: null,
                    position: 1,
                    image: null,
                    tags: "",
                })

                todoStore.add({
                    id: nanoid(),
                    text: "Click to expand: Psychology shows that only sometimes getting a reward feels more rewarding. So there won't be a meme every time!",
                    created_at: now,
                    completed: false,
                    completed_at: null,
                    updated_at: now,
                    deleted_at: null,
                    due_at: null,
                    position: 2,
                    image: null,
                    tags: ""
                })
            }
        },
    })

    // Inject the `db` instance globally into the Nuxt app
    nuxtApp.provide('db', db)
})
