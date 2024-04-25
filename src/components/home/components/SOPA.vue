<template>
  <!-- 往期审核汇总 -->
  <div class="task-list">
    <div v-for="(task, index) in tasks" :key="index" class="task-item">
      <el-card style="margin-bottom: 10px;">
        <div slot="header" class="clearfix">
          <h3> {{ task.task_title }} </h3>
        </div>
        
        <el-descriptions title="任务信息" border>
          <el-descriptions-item label="任务地点"> 
            <template slot="label">
              <i class="el-icon-location"></i>
              任务地点
            </template>
            {{ task.task_location }} 
          </el-descriptions-item>
          <el-descriptions-item label="任务时间币数"> 
            <template slot="label">
              <i class="el-icon-coin"></i>
              任务时间币数
            </template>
            {{ task.task_coin}} 
          </el-descriptions-item>
          <el-descriptions-item label="任务发布时间"> 
            <template slot="label">
              <i class="el-icon-timer"></i>
              任务发布时间
            </template>
            {{new Date(task.task_begintime).toLocaleString()}} 
          </el-descriptions-item>
          <el-descriptions-item label="任务截止时间"> 
            <template slot="label">
              <i class="el-icon-timer"></i>
              任务截止时间
            </template>
            {{new Date(task.task_endtime).toLocaleString()}}
          </el-descriptions-item>
          <el-descriptions-item label="任务审核状态"> 
            <template slot="label">
              <i class="el-icon-s-flag"></i>
              任务状态
            </template>
            {{task.task_status[0] == '1' ? '未通过' : '通过'}}
          </el-descriptions-item>
          <el-descriptions-item label="审核员编号"> 
            <template slot="label">
                <i class="el-icon-user"></i>
                审核员编号
            </template>
            {{task.task_auid}}
          </el-descriptions-item>
          <el-descriptions-item label="任务审核意见" v-if="task.task_status[0] == '1'"> 
            <template slot="label">
                <i class="el-icon-document"></i>
                任务审核意见
            </template>
            {{task.task_advice}}
          </el-descriptions-item>
        </el-descriptions>
        <h4> 正文 </h4>
        <p> {{task.task_text}} </p>
      </el-card>
    </div>
    <el-backtop></el-backtop>
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
      url: 'http://8.138.119.85:8080/demo_war/taskReview/history',
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