<script setup>
import { reactive, ref } from 'vue';
import WellbeingChart from '~/components/WellbeingChart.vue';

// Reactive state
const form = reactive({
  wellbeing: 0,
  meditated: 'no',
  sleep: '',
  didSport: 'no',
  gratitude: '',
  steps: '',
});

// Validation state
const errors = reactive({
  sleep: '',
  gratitude: '',
  steps: ''
});

// Submission state
const submitted = ref(false);

// Validate form fields
function validateForm() {
  let isValid = true;

  // Validate Sleep
  if (form.sleep === '' || isNaN(form.sleep)) {
    errors.sleep = 'Sleep time is required.';
    isValid = false;
  } else {
    errors.sleep = '';
  }

  // Validate Gratitude
  if (form.gratitude.trim() === '') {
    errors.gratitude = 'Gratitude note is required.';
    isValid = false;
  } else {
    errors.gratitude = '';
  }

  // Validate Steps
  if (form.steps === '' || isNaN(form.steps)) {
    errors.steps = 'Number of steps is required.';
    isValid = false;
  } else {
    errors.steps = '';
  }

  return isValid;
}

// Handle form submission
function submitForm() {
  if (validateForm()) {
    submitted.value = true;
    console.log(form);
  }
}

// Update wellbeing value from chart
function updateWellbeing(value) {
  form.wellbeing = Number(value);
}
</script>


<template>
  <d-page>
    <div class="p-6">
      <h1 class="text-2xl font-bold mb-4">Daily Habit Tracker</h1>
      <form @submit.prevent="submitForm" class="space-y-4">
        <div>
          <label class="block mb-1">Feeling of Wellbeing (0-10)</label>
          <WellbeingChart @pointSelected="updateWellbeing" />
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
              v-model="form.sleep"
              type="number"
              min="0"
              step="0.1"
              class="w-full border p-2 rounded"
              :class="{'border-red-500': errors.sleep}"
          >
          <p v-if="errors.sleep" class="text-red-500 text-sm">{{ errors.sleep }}</p>
        </div>
        <div>
          <label class="block mb-1">Did Sport Today?</label>
          <select v-model="form.didSport" class="w-full border p-2 rounded">
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
          >
          <p v-if="errors.steps" class="text-red-500 text-sm">{{ errors.steps }}</p>
        </div>
        <button type="submit" class="w-full bg-blue-500 text-white p-2 rounded">Submit</button>
      </form>
      <div v-if="submitted" class="mt-6 p-4 border rounded bg-green-50">
        <h2 class="font-semibold">Today's Entry:</h2>
        <p><strong>Wellbeing:</strong> {{ form.wellbeing }}/10</p>
        <p><strong>Gratitude:</strong> {{ form.gratitude }}</p>
        <p><strong>Meditated:</strong> {{ form.meditated }}</p>
        <p><strong>Sleep:</strong> {{ form.sleep }} hours</p>
        <p><strong>Did Sport:</strong> {{ form.didSport }}</p>
        <p><strong>Steps:</strong> {{ form.steps }}</p>
      </div>
    </div>
  </d-page>
</template>

