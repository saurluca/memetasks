<script setup>
import {reactive, ref} from 'vue'
import {nanoid} from 'nanoid'
import WellbeingChart from '~/components/WellbeingChart.vue'
import {House} from 'lucide-vue-next'

// Initialize Supabase
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

// Dialog and Submission States
const submitted = ref(false)
const showSuccessDialog = ref(false)
const showUpdateDialog = ref(false)
const showErrorDialog = ref(false)
const errorMessage = ref('')
const existingEntryId = ref(null)

// Field Config
const fields = [
  {title: 'Gratitude Note', slug: 'gratitude', type: 'text'},
  {title: 'Learned or Observed', slug: 'insight', type: 'text'},
  {title: 'Sleep Time (hours)', slug: 'sleep_time', type: 'number'},
  {title: 'Steps taken', slug: 'steps', type: 'number'},
  {title: 'Bread eaten', slug: 'breadstuff', type: 'select', options: ['Bread', 'Buns', 'Both', 'None']},
  {title: 'Meditated', slug: 'meditated', type: 'bool'},
  {title: 'Went for a walk', slug: 'walk', type: 'bool'},
  {title: 'Did Sport', slug: 'did_sport', type: 'bool'},
  {title: 'Ate Sweets', slug: 'sweets', type: 'bool'},
  {title: 'Period', slug: 'period', type: 'bool'},

]

// Convert "yes"/"no" to boolean or null
function parseBoolean(val) {
  if (val === 'yes') return true
  if (val === 'no') return false
  return null
}

// Prepare Data
function prepareFormData() {
  return {
    id: form.id,
    wellbeing: Number(form.wellbeing),
    insight: (form.insight ?? '').trim() || null,
    meditated: parseBoolean(form.meditated),
    sleep_time: (form.sleep_time == null || form.sleep_time === '') ? null : Number(form.sleep_time),
    did_sport: parseBoolean(form.did_sport),
    gratitude: (form.gratitude ?? '').trim() || null,
    steps: (form.steps == null || form.steps === '') ? null : Number(form.steps),
    user_id: user.value?.id || null,
    walk: parseBoolean(form.walk),
    period: parseBoolean(form.period),
    sweets: parseBoolean(form.sweets),
    breadstuff: (form.breadstuff ?? '').trim() || null,
    date: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString().split('T')[0],
  }
}

// Submit Handler
async function submitForm() {
  // Example check: if user is not logged in, show error
  if (!user.value) {
    showErrorDialog.value = true
    errorMessage.value = 'You must be logged in to submit.'
    return
  }

  const dataToUpload = prepareFormData()
  submitted.value = true

  try {
    // Check existing entry
    const { data: existingEntry, error: fetchError } = await client
        .from('tracker')
        .select('id')
        .eq('user_id', user.value?.id)
        .eq('date', dataToUpload.date)
        .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw new Error('Error checking existing entry: ' + fetchError.message)
    }

    if (existingEntry) {
      existingEntryId.value = existingEntry.id
      showUpdateDialog.value = true
      return
    }

    await upsertEntry(dataToUpload)
  } catch (err) {
    console.error('Unexpected error:', err.message)
    errorMessage.value = err.message
    showErrorDialog.value = true
  } finally {
    submitted.value = false
  }
}

// Upsert Entry
async function upsertEntry(dataToUpload) {
  if (existingEntryId.value) dataToUpload.id = existingEntryId.value

  try {
    const { error } = await client
        .from('tracker')
        .upsert([dataToUpload], { onConflict: ['user_id', 'date'] })

    if (error) throw new Error('Error upserting tracker data: ' + error.message)

    showSuccessDialog.value = true
    console.log('Entry successfully saved:', dataToUpload)
  } catch (err) {
    console.error('Unexpected error during upsert:', err.message)
    errorMessage.value = err.message
    showErrorDialog.value = true
  } finally {
    showUpdateDialog.value = false
    existingEntryId.value = null
  }
}

// Update Wellbeing
function updateWellbeing(value) {
  form.wellbeing = Number(value)
}

//Update table fields
const toggleStates = ['no', 'yes', ' ']

function handleClick(item){
  let currentValue = form[item.slug]
  let index = toggleStates.indexOf(currentValue)
  let nextIndex = (index + 1) % toggleStates.length
  let nextState = toggleStates[nextIndex]
  form[item.slug] = nextState

}


</script>

<template>
  <d-page>
    <!-- Header -->
    <div class="flex flex-row justify-between">
      <h1 class="text-2xl font-bold mb-4">Daily Wellbeing Tracker</h1>
      <router-link to="/">
        <button class="dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-full p-1.5">
          <House class="text-black dark:text-slate-200 h-6 w-6"/>
        </button>
      </router-link>
    </div>

    <!-- Form -->
    <form
        @submit.prevent="submitForm"
        class="space-y-4 h-full overflow-y-auto pr-2
             scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent
             hover:scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600
             dark:hover:scrollbar-thumb-gray-500"
    >
      <!-- Wellbeing -->
      <div>
        <label class="tracker-title-input">Feeling of Wellbeing (0-10)</label>
        <WellbeingChart @pointSelected="updateWellbeing"/>
      </div>

      <!-- Initial Dynamic Fields (First portion of the form) -->
      <d-tracker-input
          v-for="item in fields.slice(0, fields.length - 5)"
          :key="item.slug"
          :form="form"
          :title="item.title"
          :slug="item.slug"
          :type="item.type"
          :options="item.options"
      />

      <!-- Table for the Last Five Items -->
      <table class="min-w-full border-collapse border border-gray-200 mt-4">
        <tbody>
        <tr v-for="item in fields.slice(-5)"
            :key="item.slug"
            :form="form"
            :title="item.title"
            :slug="item.slug"
            :type="item.type"
            :options="item.options">
          <td class="font-bold border border-gray-300 p-2 w-1/4">{{ item.title }}</td>
          <td
              class="border border-gray-300 p-2 cursor-pointer hover:bg-gray-100"
              @click="handleClick(item)"
          >
            {{form[item.slug]}}
          </td>
        </tr>
        </tbody>
      </table>

      <button type="submit" class="w-full bg-blue-500 text-white p-2 rounded">
        Submit
      </button>
    </form>

    <!-- Success Dialog -->
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
          <p><strong>Sleep:</strong> {{ form.sleep_time }} hours</p>
          <p><strong>Steps:</strong> {{ form.steps }}</p>
          <p><strong>Breadstuff:</strong> {{ form.breadstuff }}</p>
          <p><strong>Meditated:</strong> {{ form.meditated }}</p>
          <p><strong>Walk:</strong> {{ form.walk }}</p>
          <p><strong>Did Sport:</strong> {{ form.did_sport }}</p>
          <p><strong>Sweets:</strong> {{ form.sweets }}</p>

          <p><strong>Period:</strong> {{ form.period }}</p>
        </div>
        <router-link to="/">
          <button class="bg-blue-500 text-white p-2 mt-4 rounded w-full">
            Home
          </button>
        </router-link>
      </div>
    </div>

    <!-- Update Confirmation Dialog -->
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

    <!-- Error Dialog -->
    <div
        v-if="showErrorDialog"
        class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div class="bg-white p-6 rounded-lg shadow-lg max-w-md text-center">
        <h2 class="text-xl font-bold mb-4">Something Went Wrong</h2>
        <p class="mb-4">{{ errorMessage }}</p>
        <p>Please try again later.</p>
        <br/>
        <p>If the problem persists, please contact mail@memetasks.com</p>
        <button
            class="bg-red-500 text-white p-2 mt-4 rounded w-full"
            @click="showErrorDialog = false"
        >
          Close
        </button>
      </div>
    </div>
  </d-page>
</template>
