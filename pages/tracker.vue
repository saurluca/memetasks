<script setup>
import {reactive, ref} from 'vue';
import {nanoid} from 'nanoid';
import WellbeingChart from '~/components/WellbeingChart.vue';
import {House} from 'lucide-vue-next';

const client = useSupabaseClient()
const user = useSupabaseUser()

// Main Form
const form = reactive({
  id: nanoid(),
  wellbeing: 0,
  meditated: null,
  sleep_time: '',
  did_sport: null,
  gratitude: '',
  insight: null,
  steps: null,
  period: null,
  sweets: null,
  walk: null,
  breadstuff: null,
})

// Validation Errors
const errors = reactive({
  sleep_time: '',
  gratitude: '',
})

// Submission & Dialog States
const submitted = ref(false)
const showSuccessDialog = ref(false)
const showUpdateDialog = ref(false)
const existingEntryId = ref(null)

// Dynamic Field Config
const fields = [
  {title: 'Gratitude Note', slug: 'gratitude', type: 'text', mandatory: true},
  {title: 'Learned or Observed', slug: 'insight', type: 'text', mandatory: false},
  {title: 'Meditated', slug: 'meditated', type: 'bool', mandatory: false},
  {title: 'Sleep Time (hours)', slug: 'sleep_time', type: 'number', mandatory: true},
  {title: 'Steps', slug: 'steps', type: 'number', mandatory: true},
  {title: 'Walk', slug: 'walk', type: 'bool', mandatory: false},
  {title: 'Did Sport?', slug: 'did_sport', type: 'bool', mandatory: false},
  {title: 'Sweets', slug: 'sweets', type: 'bool', mandatory: false},
  {title: 'Period', slug: 'period', type: 'bool', mandatory: false},
  {title: 'Breadstuff', slug: 'breadstuff', type: 'select', mandatory: false, options: ['Bread', 'Buns', 'Both', 'None']},
]

// Convert "yes"/"no" to boolean or null
function parseBoolean(val) {
  if (val === 'yes') return true
  if (val === 'no') return false
  return null
}

// Validate Form Fields
function validateForm() {
  let isValid = true
  const mandatoryFields = ['sleep_time', 'gratitude']

  mandatoryFields.forEach(field => {
    if (!form[field] || form[field].toString().trim() === '') {
      errors[field] = `${field} is required.`
      isValid = false
    } else {
      errors[field] = ''
    }
  })

  return isValid
}

// Prepare Data for Submission
function prepareFormData() {
  return {
    id: form.id,
    wellbeing: Number(form.wellbeing),
    insight: (form.insight ?? '').trim() || null,
    meditated: parseBoolean(form.meditated),
    sleep_time: Number(form.sleep_time),
    did_sport: parseBoolean(form.did_sport),
    gratitude: (form.gratitude ?? '').trim() || null,
    steps: Number(form.steps),
    user_id: user.value?.id || null,
    walk: parseBoolean(form.walk),
    period: parseBoolean(form.period),
    sweets: parseBoolean(form.sweets),
    breadstuff: (form.breadstuff ?? '').trim() || null,
    date: new Date(Date.now() - 6 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
  };
}

// Submit Handler
async function submitForm() {
  if (!validateForm()) return
  const dataToUpload = prepareFormData()
  submitted.value = true

  try {
    // Check if an entry already exists for this user & date
    const {data: existingEntry, error: fetchError} = await client
        .from('tracker')
        .select('id')
        .eq('user_id', user.value?.id)
        .eq('date', dataToUpload.date)
        .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error checking existing entry:', fetchError.message)
      return
    }

    // If entry found, confirm update
    if (existingEntry) {
      existingEntryId.value = existingEntry.id
      showUpdateDialog.value = true
      return
    }

    // Otherwise upsert directly
    await upsertEntry(dataToUpload)
  } catch (err) {
    console.error('Unexpected error during entry check:', err.message)
  } finally {
    submitted.value = false
  }
}

// Upsert Entry
async function upsertEntry(dataToUpload) {
  if (existingEntryId.value) {
    dataToUpload.id = existingEntryId.value
  }

  try {
    const {error} = await client
        .from('tracker')
        .upsert([dataToUpload], {onConflict: ['user_id', 'date']})

    if (error) {
      console.error('Error upserting tracker data:', error.message)
    } else {
      showSuccessDialog.value = true
      console.log('Entry successfully saved:', dataToUpload)
    }
  } catch (err) {
    console.error('Unexpected error during upsert:', err.message)
  } finally {
    showUpdateDialog.value = false
    existingEntryId.value = null
  }
}

// Update Wellbeing from Chart
function updateWellbeing(value) {
  form.wellbeing = Number(value)
}
</script>


<template>
  <d-page>
    <div class="flex flex-row justify-between">
      <h1 class="text-2xl font-bold mb-4">Daily Habit Tracker</h1>
      <router-link to="/">
        <button
            class="dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-full p-1.5"
        >
          <House class="text-black dark:text-slate-200 h-6 w-6"/>
        </button>
      </router-link>
    </div>

    <form
        @submit.prevent="submitForm"
        class="space-y-4 h-full overflow-y-auto pr-2
             scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent
             hover:scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600
             dark:hover:scrollbar-thumb-gray-500"
    >
      <div>
        <label class="block mb-1">Feeling of Wellbeing (0-10)</label>
        <WellbeingChart @pointSelected="updateWellbeing"/>
      </div>

      <d-tracker-input
          v-for="item in fields"
          :key="item.slug"
          :form="form"
          :title="item.title"
          :slug="item.slug"
          :type="item.type"
          :options="item.options"
          :mandatory="item.mandatory"
          :errors="errors"
      />

      <button type="submit" class="w-full bg-blue-500 text-white p-2 rounded">
        Submit
      </button>
    </form>

    <div
        v-if="showSuccessDialog"
        class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div class="bg-white p-6 rounded-lg shadow-lg max-w-md text-center">
        <h2 class="text-2xl font-bold mb-4">Good Job!</h2>
        <p>Your entry has been successfully saved.</p>
        <div class="mt-4 text-left p-4 border rounded bg-green-50">
          <p><strong>Wellbeing:</strong> {{ form.wellbeing }}/10</p>
          <p><strong>Gratitude:</strong> {{ form.gratitude }}</p>
          <p><strong>Insight:</strong> {{ form.insight }}</p>
          <p><strong>Meditated:</strong> {{ form.meditated }}</p>
          <p><strong>Sleep:</strong> {{ form.sleep_time }} hours</p>
          <p><strong>Steps:</strong> {{ form.steps }}</p>
          <p><strong>Did Sport:</strong> {{ form.did_sport }}</p>
          <p><strong>Walk:</strong> {{ form.walk }}</p>
          <p><strong>Period:</strong> {{ form.period }}</p>
          <p><strong>Sweets:</strong> {{ form.sweets }}</p>
          <p><strong>Breadstuff:</strong> {{ form.breadstuff }}</p>
        </div>
        <router-link to="/">
          <button class="bg-blue-500 text-white p-2 mt-4 rounded w-full">
            Home
          </button>
        </router-link>
      </div>
    </div>

    <div
        v-if="showUpdateDialog"
        class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div class="bg-white p-6 rounded-lg shadow-lg max-w-md text-center">
        <h2 class="text-xl font-bold mb-0">Entry Already Exists</h2>
        <p>Do you want to update it?</p>
        <div class="flex justify-around mt-4">
          <button
              @click="upsertEntry(prepareFormData())"
              class="bg-blue-500 text-white px-2 py-1 mr-4 rounded"
          >
            Yes, Update
          </button>
          <button
              @click="showUpdateDialog = false"
              class="bg-gray-300 text-black px-2 py-1 rounded"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </d-page>
</template>
