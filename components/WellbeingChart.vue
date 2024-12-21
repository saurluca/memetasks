<template>
  <div class="w-full mt-4">
    <div class="h-32 overflow-hidden">
      <canvas ref="wellbeingChart" class="w-full h-full"></canvas>
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

<script>
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

export default {
  name: 'WellbeingChart',
  emits: ['pointSelected'],
  data() {
    return {
      chart: null,
      selectedPoint: 0,
    };
  },
  mounted() {
    this.renderChart();
  },
  methods: {
    renderChart() {
      const ctx = this.$refs.wellbeingChart.getContext('2d');
      const gradient = ctx.createLinearGradient(0, 0, ctx.canvas.width, 0);
      gradient.addColorStop(0, 'blue');
      gradient.addColorStop(1, 'green');

      this.chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: Array.from({ length: 100 }, (_, i) => i + 1),
          datasets: [{
            label: 'Wellbeing Levels',
            data: this.generateBellCurve(100, 50, 18),
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
    },
    onSliderChange() {
      this.$emit('pointSelected', this.selectedPoint);
    },
    generateBellCurve(points, mean, stdDev) {
      return Array.from({ length: points }, (_, i) => {
        const x = i + 1;
        return (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - mean) / stdDev, 2));
      });
    }
  }
};
</script>

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