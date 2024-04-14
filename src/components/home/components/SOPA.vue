<template>
  <!-- 往期审核汇总 -->
  <div class="task-list">
    <div v-for="(task, index) in tasks" :key="index" class="task-item">
      <el-descriptions title="任务信息">
        <!-- <template slot="extra">
          <el-button type="primary" size="small">更多</el-button>
        </template> -->
        <el-descriptions-item label="标题"> {{ task.task_title }} </el-descriptions-item>
        <el-descriptions-item label="任务时间币数"> {{ task.task_coin}} </el-descriptions-item>
        <el-descriptions-item label="任务发布时间"> {{new Date(task.task_begintime).toLocaleString()}} </el-descriptions-item>
        <el-descriptions-item label="任务截止时间"> {{new Date(task.task_endtime).toLocaleString()}}</el-descriptions-item>
        <el-descriptions-item label="任务地点"> {{task.task_location}}</el-descriptions-item>
        <el-descriptions-item label="任务发布者编号"> {{task.task_publisherId}}</el-descriptions-item>
        <el-descriptions-item label="任务发布者名字"> {{task.task_publisherName}}</el-descriptions-item>
        <el-descriptions-item label="任务审核状态"> {{task.reviewStatus == '1' ? '未通过' : '通过'}}</el-descriptions-item>
        <el-descriptions-item label="任务审核意见"> {{task.reviewAdvice}}</el-descriptions-item>
        <el-descriptions-item label="审核员编号"> {{task.task_auId}}</el-descriptions-item>
        <el-descriptions-item label="审核员名字"> {{task.task_auName}}</el-descriptions-item>
        <el-descriptions-item label="审核时间"> {{ new Date(task.task_auTime).toLocaleString() }}</el-descriptions-item>
        <el-descriptions-item label="正文"> {{ task.task_text }} </el-descriptions-item>
      </el-descriptions>
    </div>
  </div>
</template>
<script>
import axios from 'axios';
export default {
  name: 'SOPA',
  data() {
    return {
      tasks: [],
    }
  },
  created() {
    axios({
      method: 'post',
      url: 'http://172.26.58.27:8081/demo/taskReview/history',
      data: JSON.stringify({token: localStorage.getItem('token')}),
    }).then( response => {
      console.log(response.data);
      this.tasks = response.data.taskArray;
    })
  }
}
</script>
<style>

</style>