<template>
  <div>
    <el-card v-for="task in taskArray" :key="task.task_id" class="box-card" style="margin: 10px 0">
      <div slot="header" class="clearfix">
        <span>任务审核</span>
        <el-button style="float: right; padding: 3px 3px" type="primary" @click="onAccept(task.task_id)">通过</el-button>
        <el-button style="float: right; padding: 3px 3px; margin: 0 20px" type="danger" @click="onReject(task.task_id)">拒绝</el-button>
      </div>
      <div>
        <el-descriptions title="任务信息">
          <el-descriptions-item label="标题"> {{ task.task_title }} </el-descriptions-item>
          <el-descriptions-item label="任务地点"> {{ task.task_location }} </el-descriptions-item>
          <el-descriptions-item label="任务时间币数"> {{ task.task_coin}} </el-descriptions-item>
          <el-descriptions-item label="任务发布时间"> {{new Date(task.task_begintime).toLocaleString()}} </el-descriptions-item>
          <el-descriptions-item label="任务截止时间"> {{new Date(task.task_endtime).toLocaleString()}}</el-descriptions-item>
          <el-descriptions-item label="任务发布者编号"> {{task.task_publisherId}}</el-descriptions-item>
          <el-descriptions-item label="任务发布者名字"> {{task.task_publisherName}}</el-descriptions-item>
          <el-descriptions-item label="正文"> {{task.task_text}}</el-descriptions-item>
        </el-descriptions>
      </div>
    </el-card>
  </div>
</template>
<script>

import axios from 'axios';

export default {
  name: 'TR',
  data() {
    return {
      taskArray: []
    }
  },
  methods: {
    onAccept(id) {
      console.log("Task accepted!");

      axios({
        method: 'post',
        url: 'https://mock.apifox.com/m1/4316049-3958895-default/taskReview/review',
        data: JSON.stringify({
          token: localStorage.getItem('token'),
          task_id: id,
          reviewStatus: '2',
          reviewAdvice: null
        })
      }).then( response => {
        if(response.data['status']) {
          this.$message({
            message: '审核成功',
            type: 'success'
          });
          this.taskArray = this.taskArray.filter(item => item.task_id != id);
        }
        else 
          this.$message.error('审核失败：'+response.data['msg']);
      })
    },
    async onReject(id) {
      console.log("Task Rejected!");
      let flag = false;
      let advice = '';
      await this.$prompt('请输入拒绝理由', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
      }).then(({ value }) => {
        flag = true;
        advice = value;
        console.log(value);
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消'
        });       
      });

      if (flag) {
        axios({
          method: 'post',
          url: 'https://mock.apifox.com/m1/4316049-3958895-default/taskReview/review',
          data: JSON.stringify({
            token: localStorage.getItem('token'),
            task_id: id,
            reviewStatus: '1',
            reviewAdvice: advice
          })
        }).then( response => {
          if(response.data['status']) {
            this.$message({
              message: '审核成功',
              type: 'success'
            });
            this.taskArray = this.taskArray.filter(item => item.task_id != id);
          }
          else 
            this.$message.error('审核失败：'+response.data['msg']);
        })
      }
    }
  },
  created() {
    axios({
      method: 'get',
      url: 'https://mock.apifox.com/m1/4316049-3958895-default/taskReview/get',
      data: JSON.stringify({token: localStorage.getItem('token')})
    }).then( response => {
      this.taskArray = response.data.taskArray;
    }).catch( err => {
      console.log(err);
      this.$router.push('/');
      localStorage.removeItem('token');
    })
  }
}
</script>
<style>
  .clearfix:before,
  .clearfix:after {
    display: table;
    content: "";
  }
  .clearfix:after {
    clear: both
  }
</style>