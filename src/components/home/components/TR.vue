<template>
  <el-card class="box-card">
    <div slot="header" class="clearfix">
      <span>任务审核</span>
      <el-button style="float: right; padding: 3px 0" type="primary">通过</el-button>
      <el-button style="float: right; padding: 3px 0; margin: 0 20px" type="danger">不通过</el-button>
    </div>
    <div v-for="task in taskArray" :key="task.task_id" class="text item">
      <el-descriptions title="任务信息">
        <!-- <template slot="extra">
          <el-button type="primary" size="small">更多</el-button>
        </template> -->
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
</template>
<script>
export default {
  name: 'TR',
  data() {
    return {
      taskArray: [
        {
          "task_id": 71,
          "task_publisherName": "何看土极",
          "task_publisherId": 83,
          "task_coin": 92,
          "task_title": "口情改参细律无",
          "task_text": "laborum eiusmod nostrud",
          "task_location": "irure",
          "task_begintime": 90013813070,
          "task_endtime": 1445567805053
        }
      ]
    }
  },
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