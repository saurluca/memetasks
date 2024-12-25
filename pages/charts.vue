<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)

let chart = null
const client = useSupabaseClient()
const user = useSupabaseUser()

const trackerData = ref([])
const wellbeingData = ref([])
const sleepData = ref([])
const stepsData = ref([])

onMounted(async () => {
  await fetchData()
  renderChart()
})

async function fetchData() {
  if (!user.value) return
  const { data } = await client.from('tracker').select().eq('user_id', user.value?.id)

  if (data) {
    trackerData.value = data
    wellbeingData.value = data.map(e => e.wellbeing ?? 0)
    sleepData.value = data.map(e => e.sleep_time ?? 0)
    stepsData.value = data.map(e => e.steps ?? 0)
  }
}

// Median helper
function median(arr) {
  const filtered = arr.filter(x => x > 0) // only consider positive values for log
  const sorted = [...filtered].sort((a, b) => a - b)
  if (!sorted.length) return 0.1 // fallback if no valid data
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2
      ? sorted[mid]
      : (sorted[mid - 1] + sorted[mid]) / 2
}

// Logarithmic normalization
// formula: y = 5 + (log10(x) - log10(median)) / scaleFactor
function normalizeLog(arr, med, scaleFactor) {
  return arr.map(x => {
    if (x <= 0) x = 0.1 // avoid log of zero or negative
    return 5 + (Math.log10(x) - Math.log10(med)) / scaleFactor
  })
}

// Keep steps on linear normalization for contrast
function normalizeLinear(arr, med, scaleFactor) {
  return arr.map(x => 5 + (x - med) / scaleFactor)
}

function renderChart() {
  if (!trackerData.value.length) return

  // Calculate medians
  const medSleep = median(sleepData.value)   // e.g. ~8
  const medSteps = median(stepsData.value)   // e.g. ~12000
  const medWellbeing = median(wellbeingData.value) // Might be around 6-7

  // Adjust scale factors so typical data stays within 0–10
  // For Sleep: use a small scaleFactor if you want small hour changes to be noticeable
  const sleepScale = 0.08
  // For Steps: keep the old linear approach
  const stepsScale = 2000

  // Normalize
  const sleepNorm = normalizeLog(sleepData.value, medSleep, sleepScale)
  const stepsNorm = normalizeLinear(stepsData.value, medSteps, stepsScale)

  const ctx = document.querySelector('#combinedChart').getContext('2d')
  if (chart) chart.destroy()

  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: trackerData.value.map(e => e.date),
      datasets: [
        {
          label: 'Wellbeing (0–10)',
          data: wellbeingData.value,
          borderColor: 'green',
          tension: 0.3,
          pointRadius: 0
        },
        {
          label: 'Sleep h (Log Scale)',
          data: sleepNorm,
          borderColor: 'blue',
          tension: 0.3,
          pointRadius: 0
        },
        {
          label: 'Steps (Normalized)',
          data: stepsNorm,
          borderColor: 'orange',
          tension: 0.3,
          pointRadius: 0
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          // Force the axis to range 0–10
          min: 0,
          max: 10,
          // Show custom ticks at 0, 5, 10
          ticks: {
            callback: (value) => {
              // Display a custom label at value 5
              if (value === 5) {
                return `${medSleep}h / ${medSteps}st`;
              }
              // Display labels for even values
              if (value % 2 === 0) {
                return value;
              }
              // Hide labels for other values
              return null;
            },
            autoSkip: false, // Ensure all specified ticks are considered
          }
        },
        x: {
          title: {
            display: true,
            text: 'Date'
          }
        }
      }
    }
  })
}
</script>

<template>
  <d-page>
    <h1 class="page-title">Combined Wellbeing Chart</h1>
    <canvas id="combinedChart" class="mt-2"></canvas>
  </d-page>
</template>
