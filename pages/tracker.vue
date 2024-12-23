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
  steps: '',
});

// Validation State
const errors = reactive({
  sleep_time: '',
  gratitude: '',
  steps: ''
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
async function submitForm() {
  if (!validateForm()) return;

  const dataToUpload = prepareFormData();
  submitted.value = true;

  try {
    const {error} = await client
        .from('tracker')
        .upsert([dataToUpload], {onConflict: ['id']});
    if (error) {
      console.error('Error upserting tracker data:', error.message);
    } else {
      submitted.value = true;
      showSuccessDialog.value = true; // Show the success dialog
      console.log('Upsert successful:', dataToUpload);
    }
  } catch (err) {
    console.error('Unexpected error during upsert:', err.message);
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
      <div>
        <label class="block mb-1">Gratitude Note</label>
        <textarea
            v-model="form.gratitude"
            class="w-full border p-2 rounded"
            :class="{'border-red-500': errors.gratitude}"
        ></textarea>
        <p v-if="errors.gratitude" class="text-red-500 text-sm">{{ errors.gratitude }}</p>
      </div>
      <div>
        <label class="block mb-1">Meditated</label>
        <select v-model="form.meditated" class="w-full border p-2 rounded">
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
      </div>
      <div>
        <label class="block mb-1">Sleep Time (hours)</label>
        <input
            v-model="form.sleep_time"
            type="number"
            min="0"
            step="0.1"
            class="w-full border p-2 rounded"
            :class="{'border-red-500': errors.sleep_time}"
        />
        <p v-if="errors.sleep_time" class="text-red-500 text-sm">{{ errors.sleep_time }}</p>
      </div>
      <div>
        <label class="block mb-1">Did Sport Today?</label>
        <select v-model="form.did_sport" class="w-full border p-2 rounded">
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
      </div>
      <div>
        <label class="block mb-1">Number of Steps</label>
        <input
            v-model="form.steps"
            type="number"
            min="0"
            class="w-full border p-2 rounded"
            :class="{'border-red-500': errors.steps}"
        />
        <p v-if="errors.steps" class="text-red-500 text-sm">{{ errors.steps }}</p>
      </div>
      <button type="submit" class="w-full bg-blue-500 text-white p-2 rounded">Submit</button>
    </form>
    <div v-if="showSuccessDialog" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div class="bg-white p-6 rounded-lg shadow-lg max-w-md text-center">
        <h2 class="text-2xl font-bold mb-4">Good Job!</h2>
        <p>Your entry has been successfully saved.</p>
        <div class="mt-4 text-left p-4 border rounded bg-green-50">
          <p><strong>Wellbeing:</strong> {{ form.wellbeing }}/10</p>
          <p><strong>Gratitude:</strong> {{ form.gratitude }}</p>
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
  </d-page>
</template>
