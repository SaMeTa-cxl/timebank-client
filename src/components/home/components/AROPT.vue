<template>
  <!-- 审核往期记录 -->
  <div class="task-list">
    <div v-for="(task, index) in tasks" :key="index" class="task-item">
      <el-descriptions title="任务信息">
        <!-- <template slot="extra">
          <el-button type="primary" size="small">更多</el-button>
        </template> -->
        <el-descriptions-item label="标题"> {{ task.task_title }} </el-descriptions-item>
        <el-descriptions-item label="正文"> {{ task.task_text }} </el-descriptions-item>
        <el-descriptions-item label="任务时间币数"> {{ task.task_coin}} </el-descriptions-item>
        <el-descriptions-item label="任务发布时间"> {{new Date(task.task_begintime).toLocaleString()}} </el-descriptions-item>
        <el-descriptions-item label="任务截止时间"> {{new Date(task.task_endtime).toLocaleString()}}</el-descriptions-item>
        <el-descriptions-item label="任务地点"> {{task.task_location}}</el-descriptions-item>
        <el-descriptions-item label="任务发布者编号"> {{task.task_publisherId}}</el-descriptions-item>
        <el-descriptions-item label="任务审核状态"> {{task.task_status[0] == '1' ? '未通过' : '通过'}}</el-descriptions-item>
        <el-descriptions-item label="任务审核意见" v-if="task.task_status[0] == '1'"> {{task.task_advice}}</el-descriptions-item>

      </el-descriptions>
    </div>
  </div>
</template>
<script>
import axios from 'axios';
export default {
  name: 'AROPT',
  data() {
    return {
      tasks: [],
    }
  },
  created() {
    axios({
      method: 'post',
      url: 'https://mock.apifox.com/m1/4316049-3958895-default/taskReview/myHistory',
      data: JSON.stringify({token: localStorage.getItem('token')}),
    }).then( response => {
      console.log(response.data);
      this.tasks = response.data.taskArray;
    }).catch( err => {
      console.log(err);
    })
  }
}
</script>
<style>

</style>