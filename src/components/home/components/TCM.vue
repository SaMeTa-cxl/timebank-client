<template>
  <div class="time-coin-chart">
    <el-card class="chart-card">
      <div slot="header" class="card-header">
        <span>时间币总数：{{ totalCoins }}</span>
        <el-button type="primary" @click="deliverCoins">发放时间币</el-button>
      </div>
      <div ref="chartRef" style="width: 100%; height: 400px;"></div>
    </el-card>
  </div>
</template>

<script>
import * as echarts from 'echarts';
import axios from 'axios';

export default {
  name: 'TCM',
  data() {
    return {
      timeCoins: [],
      totalCoins: 0,
    }
  },
  async mounted() {
    console.log("chart!");
    await axios({
      method: 'post',
      url: 'http://8.138.119.85:8080/demo_war/coin/getStatistic',
      data: JSON.stringify({token: localStorage.getItem('token')})
    }).then( response => {
      this.totalCoins = response.data.coinSum;
      this.timeCoins = response.data.userCoinArray;
      console.log(this.timeCoins)
    });
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
          name: '频数',
          type: 'bar',
          data: frequencies // 频率数据
        }]
      };

      myChart.setOption(option);
    },
    async deliverCoins() {
      let flag = false;
      let coinCount = null;
      await this.$prompt('请输入发布时间币数量', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
      }).then(({ value }) => {
        flag = true;
        coinCount = Number(value);
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消'
        });       
      });

      if (flag) {
        axios({
          method: 'post',
          url: 'http://8.138.119.85:8080/demo_war/coin/issue',
          data: JSON.stringify({
            token: localStorage.getItem('token'),
            coinNum: coinCount
          })
        }).then( response => {
          if(response.data['status']) {
            this.$message({
              message: '发布成功',
              type: 'success'
            });
            this.totalCoins += this.timeCoins.length * coinCount;
          }
          else 
            this.$message.error('发布失败：'+response.data['msg']);
        })
      }
    }
  }
};
</script>

<style scoped>
.time-coin-chart {
  width: 100%;
  height: 100%;
}

.chart-card {
  margin-top: 20px; /* 调整卡片与顶部的间距 */
}

.card-header {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>