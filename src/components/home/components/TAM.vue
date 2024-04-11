<template>
  <div class="task-monitor">
    <el-row type="flex" justify="space-around" class="row">
      <span class="task-label blue">待领取: {{ taskCount.toReceive }}</span>
      <span class="task-label yellow">待完成: {{ taskCount.toComplete }}</span>
      <span class="task-label red">待审核: {{ taskCount.toReview }}</span>
    </el-row>
    
    <el-row type="flex" justify="center" class="row">
      <!-- 筛选选择框 -->
      <el-select v-model="status" placeholder="请选择">
        <el-option
          v-for="item in options"
          :key="item.value"
          :label="item.label"
          :value="item.value">
        </el-option>
      </el-select>
      <el-button type="primary" @click="onSelect(status)"> 筛选 </el-button>
      <el-button type="primary" @click="status=''"> 重置 </el-button>
    </el-row>
      
    <div v-for="(task, index) in tasks" :key="index" class="task-item">
      <el-descriptions title="任务信息">
        <template slot="extra">
          <el-button type="primary" size="small">更多</el-button>
        </template>
        <el-descriptions-item label="标题"> {{ task.title }} </el-descriptions-item>
        <el-descriptions-item label="任务状态"> {{ statusMap[task.status]}} </el-descriptions-item>
        <el-descriptions-item label="任务时间币数"> {{ task.coin}} </el-descriptions-item>
        <el-descriptions-item label="任务发布时间"> {{new Date(task.task_begintime).toLocaleString()}} </el-descriptions-item>
        <el-descriptions-item label="任务截至时间"> {{new Date(task.task_endtime).toLocaleString()}}</el-descriptions-item>
      </el-descriptions>
      <div class="task-title">{{ task.title }}</div>
      <div class="task-body">{{ task.body }}</div>
      <div class="task-info">
        <span>发布时间: {{ task.publishTime }}</span>
        <span>截止时间: {{ task.deadline }}</span>
        <span>时间币数: {{ task.coinValue }}</span>
        <span v-if="task.status !== '待完成'">完成状态: {{ task.status }}</span>
        <span v-if="task.status === '审核不通过'">审核不通过原因: {{ task.rejectReason }}</span>
        <span v-if="task.status === '待完成'">领取者用户名: {{ task.receiverUsername }}</span>
        <span v-if="task.status === '待完成'">领取者ID: {{ task.receiverId }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
export default {
  name: 'TAM',
  data() {
    return {
      taskCount: {
        toReceive: 0,
        toComplete: 0,
        toReview: 0,
      },
      tasks: [],
      options: [{
          value: '0000-00',
          label: '待审核'
        }, {
          value: '2000-00',
          label: '待领取'
        }, {
          value: '2100-00',
          label: '待完成'
      }],
      status: '',
      statusMap: {
        '0000-00': '待审核',
        '2000-00': '待领取',
        '2100-00': '待完成',
      }
    };
  },
  methods: {
    onSelect(status) {
      console.log('select')
      axios({
        method: 'get',
        url: 'https://mock.apifox.com/m1/4278752-3920807-default/taskMonitor/select',
        data: JSON.stringify({
          token: localStorage.getItem('token'),
          status: status,
        })
      }).then( response => {
        this.tasks = response.data.taskArray;
      }).catch( err => {
        console.log(err);
        this.$router.push('/');
        localStorage.removeItem('token');
      })
    }
  },
  mounted() {
    axios({
      method: 'get',
      url: 'https://mock.apifox.com/m1/4278752-3920807-default/taskMonitor/info',
      data: JSON.stringify({token: localStorage.getItem('token')}),
    }).then( response => {
      console.log(response.data);
      this.taskCount.toReview = response.data.task_num1;
      this.taskCount.toReceive = response.data.task_num2;
      this.taskCount.toComplete = response.data.task_num3;
    })
  },
};
</script>

<style scoped>
.task-monitor {
  padding: 10px;
}

.row {
  padding: 10px 0;
  /* display: flex; */
  /* justify-content: space-around; */
}

.task-label {
  padding: 5px 10px;
  border-radius: 5px;
  font-weight: bold;
}

.blue {
  background-color: blue;
  color: white;
}

.yellow {
  background-color: yellow;
}

.red {
  background-color: red;
  color: white;
}
</style>
