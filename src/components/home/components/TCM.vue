<template>
  <div class="time-coin-chart">
    <div ref="chartRef" style="width: 100%; height: 400px;"></div>
  </div>
</template>

<script>
import * as echarts from 'echarts';

export default {
  name: 'TCM',
  data() {
    return {
      timeCoins: [10, 10, 20, 30, 40, 40, 50]
    }
  },
  mounted() {
    console.log("chart!");
    this.initChart();
  },
  methods: {
    initChart() {
      let chartDom = this.$refs.chartRef;
      console.log(echarts)
      let myChart = echarts.init(chartDom);

      let bins = []; // 区间
      let frequencies = []; // 频率
      let binSize = Math.floor((this.timeCoins[this.timeCoins.length - 1] - this.timeCoins[0]) / 7) 
      let start = this.timeCoins[0];
      let end = this.timeCoins[this.timeCoins.length - 1];
      // 计算频率分布
      for (let i = start; i < end; i += binSize) {
        bins.push(i); // 区间起点
        let count = this.timeCoins.filter(item => item >= i && item < i + binSize).length; // 计算区间内时间币数量
        frequencies.push(count);
      }

      let option = {
        title: {
          text: '时间币数量频数分布直方图'
        },
        tooltip: {},
        xAxis: {
          data: bins.map(bin => `${bin}-${bin + binSize}`) // 区间标签
        },
        yAxis: {},
        series: [{
          name: '频率',
          type: 'bar',
          data: frequencies // 频率数据
        }]
      };

      myChart.setOption(option);
    }
  }
};
</script>

<style scoped>
.time-coin-chart {
  width: 100%;
  height: 100%;
}
</style>