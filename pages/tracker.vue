<script setup>
import {reactive, ref} from 'vue';
import {nanoid} from 'nanoid';
import WellbeingChart from '~/components/WellbeingChart.vue';
import {House} from 'lucide-vue-next';

// Initialize Supabase
const client = useSupabaseClient();
const user = useSupabaseUser();

// Reactive Form State
const form = reactive({
  id: nanoid(),
  wellbeing: 0,
  meditated: 'no',
  sleep_time: '',
  did_sport: 'no',
  gratitude: '',
  insight: '',
  steps: '',
  period: '',
  bread: '',
  buns: '',
  sweets: '',
  walk: '',
});

// Validation State
const errors = reactive({
  sleep_time: '',
  gratitude: '',
  steps: '',
  insight: '',
});

// Submission State
const submitted = ref(false);
const showSuccessDialog = ref(false);

// Validate Form Fields
function validateForm() {
  let isValid = true;

  if (form.sleep_time === '' || isNaN(form.sleep_time)) {
    errors.sleep_time = 'Sleep time is required.';
    isValid = false;
  } else {
    errors.sleep_time = '';
  }

  if (form.gratitude.trim() === '') {
    errors.gratitude = 'Gratitude note is required.';
    isValid = false;
  } else {
    errors.gratitude = '';
  }

  if (form.steps === '' || isNaN(form.steps)) {
    errors.steps = 'Number of steps is required.';
    isValid = false;
  } else {
    errors.steps = '';
  }

  return isValid;
}

// Prepare Data for Submission
function prepareFormData() {
  return {
    id: form.id,
    wellbeing: Number(form.wellbeing),
    insight: form.insight.trim(),
    meditated: form.meditated === 'yes',
    sleep_time: Number(form.sleep_time),
    did_sport: form.did_sport === 'yes',
    gratitude: form.gratitude.trim(),
    steps: Number(form.steps),
    user_id: user.value?.id || null,
    // Date -4 hours to adjust for doing entry at night
    date: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString().split('T')[0],
  };
}

// Handle Form Submission
const showUpdateDialog = ref(false);
const existingEntryId = ref(null);

async function submitForm() {
  if (!validateForm()) return;

  const dataToUpload = prepareFormData();
  submitted.value = true;

  try {
    // Check if an entry already exists for today
    const {data: existingEntry, error: fetchError} = await client
        .from('tracker')
        .select('id')
        .eq('user_id', user.value?.id)
        .eq('date', dataToUpload.date)
        .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error checking existing entry:', fetchError.message);
      return;
    }

    if (existingEntry) {
      // Store existing entry ID and show confirmation dialog
      existingEntryId.value = existingEntry.id;
      showUpdateDialog.value = true;
      return; // Stop execution and wait for user response
    }

    await upsertEntry(dataToUpload);
  } catch (err) {
    console.error('Unexpected error during entry check:', err.message);
  } finally {
    submitted.value = false;
  }
}

async function upsertEntry(dataToUpload) {
  if (existingEntryId.value) {
    dataToUpload.id = existingEntryId.value; // Use existing entry ID for update
  }

  try {
    const {error} = await client
        .from('tracker')
        .upsert([dataToUpload], {onConflict: ['user_id', 'date']});

    if (error) {
      console.error('Error upserting tracker data:', error.message);
    } else {
      showSuccessDialog.value = true;
      console.log('Entry successfully saved:', dataToUpload);
    }
  } catch (err) {
    console.error('Unexpected error during upsert:', err.message);
  } finally {
    showUpdateDialog.value = false;
    existingEntryId.value = null;
  }
}


// Update Wellbeing Value from Chart
function updateWellbeing(value) {
  form.wellbeing = Number(value);
}

function closeDialog() {
  showSuccessDialog.value = false;
}
</script>

<template>
  <d-page>
    <div class="flex flex-row justify-between">
      <h1 class="text-2xl font-bold mb-4">Daily Habit Tracker</h1>
      <router-link to="/">
        <button class="dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-full p-1.5">
          <House class="text-black dark:text-slate-200 h-6 w-6"/>
        </button>
      </router-link>
    </div>
    <form @submit.prevent="submitForm"
          class="space-y-4 h-full overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 dark:hover:scrollbar-thumb-gray-500"
    >
      <div>
        <label class="block mb-1">Feeling of Wellbeing (0-10)</label>
        <WellbeingChart @pointSelected="updateWellbeing"/>
      </div>
      <d-tracker-input
          form="form"
          title="Gratitude Note"
          slug="gratitude"
          type="text"
          mandatory
          :errors="errors"
      />
      <d-tracker-input
          form="form"
          title="Learned or observed"
          slug="insight"
          type="text"
          :errors="errors"
      />
      <d-tracker-input
          form="form"
          title="Meditated"
          slug="meditated"
          type="bool"
          :errors="errors"
      />
      <d-tracker-input
          form="form"
          title="Sleep Time (hours)"
          slug="sleep_time"
          type="number"
          :errors="errors"
      />
      <d-tracker-input
          form="form"
          title="Steps"
          slug="steps"
          type="number"
          :errors="errors"
      />
      <d-tracker-input
          form="form"
          title="Did Sport Today?"
          slug="did_sport"
          type="bool"
          :errors="errors"
      />
      <d-tracker-input
          form="form"
          title="Walk"
          slug="walk"
          type="bool"
          :errors="errors"
      />
      <d-tracker-input
          form="form"
          title="Period"
          slug="period"
          type="bool"
          :errors="errors"
      />
      <d-tracker-input
          form="form"
          title="Sweets"
          slug="sweets"
          type="bool"
          :errors="errors"
      />
      <d-tracker-input
          form="form"
          title="Bread"
          slug="bread"
          type="bool"
          :errors="errors"
      />
      <d-tracker-input
          form="form"
          title="Buns"
          slug="buns"
          type="bool"
          :errors="errors"
      />
      <button type="submit" class="w-full bg-blue-500 text-white p-2 rounded">Submit</button>
    </form>

    <div v-if="showSuccessDialog" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div class="bg-white p-6 rounded-lg shadow-lg max-w-md text-center">
        <h2 class="text-2xl font-bold mb-4">Good Job!</h2>
        <p>Your entry has been successfully saved.</p>
        <div class="mt-4 text-left p-4 border rounded bg-green-50">
          <p><strong>Wellbeing:</strong> {{ form.wellbeing }}/10</p>
          <p><strong>Gratitude:</strong> {{ form.gratitude }}</p>
          <p><strong>Insight:</strong> {{ form.insight }}</p>
          <p><strong>Meditated:</strong> {{ form.meditated }}</p>
          <p><strong>Sleep:</strong> {{ form.sleep_time }} hours</p>
          <p><strong>Did Sport:</strong> {{ form.did_sport }}</p>
          <p><strong>Steps:</strong> {{ form.steps }}</p>
        </div>
        <router-link to="/">
          <button class="bg-blue-500 text-white p-2 mt-4 rounded w-full">
            Home
          </button>
        </router-link>
      </div>
    </div>
    <div v-if="showUpdateDialog" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div class="bg-white p-6 rounded-lg shadow-lg max-w-md text-center">
        <h2 class="text-xl font-bold mb-0">Entry Already Exists</h2>
        <p>Do you want to update it?</p>
        <div class="flex justify-around mt-4">
          <button @click="upsertEntry(prepareFormData())"
                  class="bg-blue-500 text-white px-2 py-1 mr-4 rounded">
            Yes, Update
          </button>
          <button @click="showUpdateDialog = false"
                  class="bg-gray-300 text-black px-2 py-1 rounded">
            Cancel
          </button>
        </div>
      </div>
    </div>
  </d-page>
</template>
