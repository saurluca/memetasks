<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)

// References
let chart: any = null
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

// Fetch from Supabase
async function fetchData() {
  if (!user.value) return
  const { data, error } = await client
      .from('tracker')
      .select()
      .eq('user_id', user.value?.id)

  if (error) {
    console.error(error)
    return
  }

  if (data) {
    trackerData.value = data
    // Fallback to 0 if null
    wellbeingData.value = data.map(e => e.wellbeing ?? 0)
    sleepData.value = data.map(e => e.sleep_time ?? 0)
    stepsData.value = data.map(e => e.steps ?? 0)
  }
}

// Median helper
function median(arr) {
  const filtered = arr.filter(x => typeof x === 'number')
  const sorted = [...filtered].sort((a, b) => a - b)
  if (!sorted.length) return 0
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2
      ? sorted[mid]
      : (sorted[mid - 1] + sorted[mid]) / 2
}

// Normalize around 5
function normalize(arr, med, scaleFactor) {
  return arr.map(x => 5 + (x - med) / scaleFactor)
}

// Render combined chart
function renderChart() {
  if (!trackerData.value.length) return

  // Calculate medians
  const medSleep = median(sleepData.value)    // e.g. ~8
  const medSteps = median(stepsData.value)    // e.g. ~12000

  // Choose scale factors so typical data stays ~0–10
  // Adjust to your dataset
  const sleepScale = 2         // e.g. if median is ~8, (8 - 8)/2 => 0 => 5
  const stepsScale = 2000      // e.g. if median is ~12000, (12000 - 12000)/2000 => 0 => 5

  // Normalize
  const sleepNorm = normalize(sleepData.value, medSleep, sleepScale)
  const stepsNorm = normalize(stepsData.value, medSteps, stepsScale)

  const ctx = document.querySelector('#unifiedChart').getContext('2d')
  if (chart) chart.destroy() // Destroy old chart if re-rendering

  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: trackerData.value.map(e => e.date), // or day indices, etc.
      datasets: [
        {
          label: 'Wellbeing (0–10)',
          data: wellbeingData.value,
          borderColor: 'blue',
          fill: false,
          tension: 0.3,
          pointRadius: 3
        },
        {
          label: 'Sleep (Normalized)',
          data: sleepNorm,
          borderColor: 'green',
          fill: false,
          tension: 0.3,
          pointRadius: 3
        },
        {
          label: 'Steps (Normalized)',
          data: stepsNorm,
          borderColor: 'orange',
          fill: false,
          tension: 0.3,
          pointRadius: 3
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          min: 0,
          max: 10, // Always show 0–10
          title: {
            display: true,
            text: 'All Data Normalized (0–10)'
          },
          ticks: {
            stepSize: 1,
            // Custom label at the midpoint (5) to show absolute medians
            callback: function (value) {
              if (value === 0) return '0'
              if (value === 5) {
                return `5 (~${medSleep}h / ~${medSteps} steps)`
              }
              if (value === 10) return '10'
              return value
            }
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
    <h1>Combined Life Chart (0–10 scale)</h1>
    <canvas id="unifiedChart"></canvas>
  </d-page>
</template>
