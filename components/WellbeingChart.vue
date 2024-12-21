<template>
  <div class="w-full mt-4">
    <canvas ref="wellbeingChart" class="w-full h-40"></canvas>
    <input
        type="range"
        v-model="selectedPoint"
        :min="1"
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
      selectedPoint: 5,
    };
  },
  mounted() {
    this.renderChart();
  },
  methods: {
    renderChart() {
      const ctx = this.$refs.wellbeingChart.getContext('2d');
      this.chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: Array.from({length: 10}, (_, i) => i + 1),
          datasets: [{
            label: 'Wellbeing Levels',
            data: this.generateBellCurve(10, 5, 1.5),
            borderColor: 'blue',
            fill: false,
            tension: 0.4,
            pointRadius: 5,
            pointBackgroundColor: Array.from({length: 10}, (_, i) => i + 1 === this.selectedPoint ? 'red' : 'blue')
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {display: false},
          },
          scales: {
            x: {display: false},
            y: {display: false},
          },
        }
      });
    },
    onSliderChange() {
      this.updateChart();
      this.$emit('pointSelected', this.selectedPoint);
    },
    updateChart() {
      if (this.chart) {
        this.chart.data.datasets[0].pointBackgroundColor = Array.from({length: 10}, (_, i) =>
            i + 1 === Number(this.selectedPoint) ? 'red' : 'blue'
        );
        this.chart.update();
      }
    },
    generateBellCurve(points, mean, stdDev) {
      return Array.from({length: points}, (_, i) => {
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
