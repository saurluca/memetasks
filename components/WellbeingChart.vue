<script setup>
import { ref, onMounted } from 'vue';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

// Define emits
const emit = defineEmits(['pointSelected']);

// Reactive State
const selectedPoint = ref(0);
let chart = null;

// Render the Chart
function renderChart() {
  const ctx = document.querySelector('#wellbeingChart').getContext('2d');
  const gradient = ctx.createLinearGradient(0, 0, ctx.canvas.width, 0);
  gradient.addColorStop(0, 'blue');
  gradient.addColorStop(1, 'green');

  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: Array.from({ length: 100 }, (_, i) => i + 1),
      datasets: [{
        label: 'Wellbeing Levels',
        data: generateBellCurve(100, 50, 18),
        borderColor: gradient,
        fill: false,
        tension: 1,
        pointRadius: 0,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
      },
      scales: {
        x: { display: false },
        y: { display: false },
      },
    }
  });
}

// Handle Slider Change
function onSliderChange() {
  if (chart) {
    chart.data.datasets[0].pointBackgroundColor = Array.from(
        { length: 100 },
        (_, i) => (i + 1 === Number(selectedPoint.value) ? 'red' : 'blue')
    );
    chart.update();
  }
  emit('pointSelected', selectedPoint.value);
}

// Generate Bell Curve Data
function generateBellCurve(points, mean, stdDev) {
  return Array.from({ length: points }, (_, i) => {
    const x = i + 1;
    return (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - mean) / stdDev, 2));
  });
}

// Lifecycle Hook
onMounted(() => {
  renderChart();
});
</script>

<template>
  <div class="w-full mt-4">
    <div class="h-32 overflow-hidden">
      <canvas id="wellbeingChart" class="w-full h-full"></canvas>
    </div>
    <input
        type="range"
        v-model="selectedPoint"
        :min="0"
        :max="10"
        @input="onSliderChange"
        class="w-full mt-4"
    />
    <p class="text-center mt-2">Selected Wellbeing: {{ selectedPoint }}</p>
  </div>
</template>

<style>
input[type="range"] {
  appearance: none;
  width: 100%;
  height: 8px;
  border-radius: 5px;
  background: #ddd;
  outline: none;
  opacity: 0.9;
  transition: opacity 0.2s;
}

input[type="range"]:hover {
  opacity: 1;
}
</style>
