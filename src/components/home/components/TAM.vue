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
      
    <div v-for="(task) in tasks" :key="task.task_id" class="task-item">
      <el-descriptions title="任务信息">
        <!-- <template slot="extra">
          <el-button type="primary" size="small">更多</el-button>
        </template> -->
        <el-descriptions-item label="标题"> {{ task.task_title }} </el-descriptions-item>
        <el-descriptions-item label="任务状态"> {{ statusMap[task.task_status] }} </el-descriptions-item>
        <el-descriptions-item label="任务地点"> {{ task.task_location }} </el-descriptions-item>
        <el-descriptions-item label="任务时间币数"> {{ task.task_coin}} </el-descriptions-item>
        <el-descriptions-item label="任务发布时间"> {{new Date(task.task_begintime).toLocaleString()}} </el-descriptions-item>
        <el-descriptions-item label="任务截止时间"> {{new Date(task.task_endtime).toLocaleString()}}</el-descriptions-item>
        <el-descriptions-item label="任务完成时间" v-if="task.task_status[2] == '1' && task.task_status[5] != '2'"> {{new Date(task.task_finishtime).toLocaleString()}}</el-descriptions-item>
        <el-descriptions-item label="任务领取者编号" v-if="task.task_status[0] == '2'"> {{task.task_takerId}}</el-descriptions-item>
        <el-descriptions-item label="任务领取者名字" v-if="task.task_status[0] == '2'"> {{task.task_takerName}}</el-descriptions-item>
        <el-descriptions-item label="审核不通过理由" v-if="task.task_status[0] == '1'"> {{task.task_advice}}</el-descriptions-item>
        <el-descriptions-item label="评分"> {{task.task_score}}</el-descriptions-item>
        <el-descriptions-item label="正文"> {{task.task_text}}</el-descriptions-item>
      </el-descriptions>
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
        }, {
          value: '1000-00',
          label: '审核不通过'
        }, {
          value: ['0000-10', '2000-10', '2100-10'],
          label: '已超时'
        }, {
          value: '2110-20',
          label: '已失效'
        }, {
          value: ['2110-00', '2110-10'],
          label: '待评价'
        }, {
          value: ['2111-00', '2111-01', '2111-11', '2111-10'],
          label: '已评价'
        }
      ],
      status: '',
      statusMap: {
        '0000-00': '待审核',
        '2000-00': '待领取',
        '2100-00': '待完成',
        '0000-10': '已超时',
        '2000-10': '已超时',
        '2100-10': '已超时',
        '1000-00': '审核不通过',
        '2110-20': '已失效',
        '2110-00': '待评价',
        '2110-10': '待评价',
        '2111-00': '已评价',
        '2111-01': '已评价',
        '2111-11': '已评价',
        '2111-10': '已评价',
      }
    };
  },
  methods: {
    onSelect(status) {
      this.tasks = [];
      console.log('select')
      if(Array.isArray(status)) {
        for(let item in status) {
          axios({
            method: 'post',
            url: 'http://172.26.58.27:8081/demo/taskMonitor/select',
            data: JSON.stringify({
              token: localStorage.getItem('token'),
              status: item,
            })
          }).then( response => {
            this.tasks = this.tasks.concat(response.data.taskArray);
            console.log(this.tasks);
          }).catch( err => {
            console.log(err);
            this.$router.push('/');
            localStorage.removeItem('token');
          })
        }
        return;
      }
      axios({
        method: 'post',
        url: 'http://172.26.58.27:8081/demo/taskMonitor/select',
        data: JSON.stringify({
          token: localStorage.getItem('token'),
          status: status,
        })
      }).then( response => {
        this.tasks = response.data.taskArray;
        console.log(this.tasks);
      }).catch( err => {
        console.log(err);
        this.$router.push('/');
        localStorage.removeItem('token');
      })
    }
  },
  mounted() {
    console.log('mounted')
    axios({
      method: 'post',
      url: 'http://172.26.58.27:8081/demo/taskMonitor/info',
      data: JSON.stringify({token: localStorage.getItem('token')}),
    }).then( response => {
      console.log(response.data);
      this.taskCount.toReview = response.data.task_num1;
      this.taskCount.toReceive = response.data.task_num2;
      this.taskCount.toComplete = response.data.task_num3;
    }).catch( err => {
      console.log(err);
      this.$router.push('/');
      localStorage.removeItem('token');
    })

    for (let key in this.statusMap) 
      axios({
        method: 'post',
        url: 'http://172.26.58.27:8081/demo/taskMonitor/select',
        data: JSON.stringify({
          token: localStorage.getItem('token'),
          status: key,
        })
      }).then( response => {
        this.tasks = this.tasks.concat(response.data.taskArray);
        console.log(this.tasks);
      }).catch( err => {
        console.log(err);
        this.$router.push('/');
        localStorage.removeItem('token');
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
