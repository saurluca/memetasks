// juckt nicht
const db: any = null
function ref(any: any): any { }

// Seiten aufruf
const todos = ref([])

async function load() {
    const data = await db.getAll("todos")
    todos.value = data
}

await load()

async function pull() {
    const { data: todos, error } = await client.from('todos').select('*')
    if (error) return
    for (const todo of todos) {
        await db.put("todos", todo)
    }
}

// call pull either 
await pull()

// push
async function push() {
    const todos = await db.getAll("todos")
    await client.from('todos').upsert(todos)
}

// Create todo
const newTodo = ref("")

async function create() {
    if (!newTodo.value) return
    await db.put("todos", newTodo.value)
    // in background, call supabase to sync
    await load()
}

async function markDone(id: string, done) {
    // fetch from db
    const todo = await db.get("todos", id)
    if (!todo) return

    todo.done = done
    await db.put("todos", todo)
    await load()
}

const client: any = false

// Supabase sync
async function realtimeSyncTodo(todo: any) {
    // Update the todo in the database
    await db.put("todos", todo)
    await load()
}

let realtimeChannel: any = null

onMounted(() => {
    // Real time listener for new workouts
    realtimeChannel = client.channel('boi').on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'todos' },
        async (data) => await realtimeSyncTodo(data)
    )

    realtimeChannel.subscribe()
})

// Don't forget to unsubscribe when user left the page
onUnmounted(() => {
    client.removeChannel(realtimeChannel)
})