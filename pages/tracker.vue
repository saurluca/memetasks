<script setup lang="ts">
interface FormField {
  id: number
  name: string
  type: 'text' | 'number' | 'boolean'
  value: string | number | boolean
}

const formFields = ref<FormField[]>([])
const newFieldName = ref('')
const newFieldType = ref<'text' | 'number' | 'boolean'>('text')

const addField = () => {
  if (formFields.value.length >= 8) return
  if (!newFieldName.value.trim()) return
  
  formFields.value.push({
    id: Date.now(),
    name: newFieldName.value,
    type: newFieldType.value,
    value: newFieldType.value === 'number' ? 0 : 
           newFieldType.value === 'boolean' ? false : ''
  })
  
  newFieldName.value = ''
}
</script>

<template>
  <d-page>
    <div class="w-full p-4">
      <h1 class="text-2xl font-bold mb-6">Dynamic Form Builder</h1>
      
      <!-- Add new field controls -->
      <div class="flex gap-2 mb-6 w-full" v-if="formFields.length < 5">
        <input
          v-model="newFieldName"
          placeholder="Field name..."
          class="flex-1 px-3.5 py-2 border rounded-lg"
        />
        <select v-model="newFieldType" class="px-3.5 py-2 border rounded-lg">
          <option value="text">Text</option>
          <option value="number">Number</option>
          <option value="boolean">Checkbox</option>
        </select>
        <button
          @click="addField"
          class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Add Field
        </button>
      </div>

      <!-- Form fields -->
      <form @submit.prevent class="w-full">
        <template v-for="field in formFields" :key="field.id">
          <d-tracker-input
            v-if="field.type !== 'boolean'"
            v-model="field.value"
            :name="field.name"
            :type="field.type"
            :placeholder="`Enter ${field.name}...`"
          />
          <div v-else class="mb-4 w-full px-3.5 py-2 border rounded-lg bg-slate-50 dark:bg-gray-700 dark:border-gray-600">
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                v-model="field.value"
                class="w-4 h-4 text-blue-500 rounded focus:ring-blue-500"
              />
              <span class="text-sm font-medium">{{ field.name }}</span>
            </label>
          </div>
        </template>
      </form>
    </div>
  </d-page>
</template>

<style scoped>

</style>