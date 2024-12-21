<template>
  <d-page>
      <h1 class="text-2xl font-bold mb-4">Daily Habit Tracker</h1>
      <form @submit.prevent="submitForm" class="space-y-4">
        <div>
          <label class="block mb-1">Sleep Time (hours)</label>
          <input v-model="form.sleep" type="number" min="0" class="w-full border p-2 rounded">
        </div>
        <div>
          <label class="block mb-1">Feeling of Wellbeing (1-10)</label>
          <input v-model="form.wellbeing" type="number" min="1" max="10" class="w-full border p-2 rounded">
        </div>
        <div>
          <label class="block mb-1">Did Sport Today?</label>
          <select v-model="form.didSport" class="w-full border p-2 rounded">
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>
        <div>
          <label class="block mb-1">Gratitude Note</label>
          <textarea v-model="form.gratitude" class="w-full border p-2 rounded"></textarea>
        </div>
        <button type="submit" class="w-full bg-blue-500 text-white p-2 rounded">Submit</button>
      </form>
      <div v-if="submitted" class="mt-6 p-4 border rounded bg-green-50">
        <h2 class="font-semibold">Today's Entry:</h2>
        <p><strong>Sleep:</strong> {{ form.sleep }} hours</p>
        <p><strong>Wellbeing:</strong> {{ form.wellbeing }}/10</p>
        <p><strong>Did Sport:</strong> {{ form.didSport }}</p>
        <p><strong>Gratitude:</strong> {{ form.gratitude }}</p>
      </div>
  </d-page>
</template>

<script>
export default {
  data() {
    return {
      form: {
        sleep: '',
        wellbeing: '',
        didSport: 'no',
        gratitude: ''
      },
      submitted: false
    };
  },
  methods: {
    submitForm() {
      this.submitted = true;
    }
  }
}
</script>

<style>
body {
  font-family: Arial, sans-serif;
}
</style>

