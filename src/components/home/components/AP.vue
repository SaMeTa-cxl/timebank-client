<template>
  <div>
    <el-button type="primary" @click="handleNewAnnouncement">发布新公告</el-button>
    <el-dialog
      title="发布新公告"
      :visible.sync="dialogVisible"
      width="50%"
      :before-close="handleCloseDialog"
    >
      <el-form :model="announcementForm" :rules="announcementRules" ref="announcementForm">
        <el-form-item label="标题" prop="notice_title">
          <el-input v-model="announcementForm.notice_title"></el-input>
        </el-form-item>
        <el-form-item label="内容" prop="notice_content">
          <el-input type="textarea" v-model="announcementForm.notice_content"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="handleCancle">取消</el-button>
        <el-button type="primary" @click="submitAnnouncement">发布</el-button>
      </span>
    </el-dialog>

    <!-- 展示过往所有公告的区域 -->
    <div v-for="announcement in announcements" :key="announcement.notice_id">
      <h3>{{ announcement.notice_title }}</h3>
      <p>{{ announcement.notice_content }}</p>
      <p>发布时间：{{ new Date(announcement.notice_time).toLocaleString() }}</p>
      <el-button type="text" @click="deleteAnnouncement(announcement)">删除</el-button>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      dialogVisible: false,
      announcementForm: {
        notice_title: '',
        notice_content: '',
      },
      announcementRules: {
        notice_title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
        notice_content: [{ required: true, message: '请输入内容', trigger: 'blur' }]
      },
      announcements: []
    };
  },
  methods: {
    handleNewAnnouncement() {
      this.dialogVisible = true;
    },
    handleCloseDialog(done) {
      this.$confirm('确定要关闭?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        done();
        this.$refs['announcementForm'].resetFields();
      });
    },
    handleCancle() {
      this.$confirm('确定要取消发布?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.dialogVisible = false;
        this.$refs['announcementForm'].resetFields();
      });
    },
    submitAnnouncement() {
      this.$refs['announcementForm'].validate(valid => {
        if (valid) {
          axios({
            method: 'post',
            url: 'http://172.26.58.27:8081/demo/notice/publish',
            data: JSON.stringify({
              token: localStorage.getItem('token'),
              ...this.announcementForm
            })
          }).then(() => {
            this.$message.success('发布成功');
            axios({
              method: 'post',
              url: 'http://172.26.58.27:8081/demo/notice/get',
              data: JSON.stringify({token: localStorage.getItem('token')}),
            }).then( response => {
              this.announcements = response.data['noticeArray'];
            }).catch( () => {
              this.$router.push('/');
              localStorage.removeItem('token');
            });
          }).catch(() => {
            this.$router.push('/');
            localStorage.removeItem('token');
          })

          this.dialogVisible = false;
          axios({
            method: 'post',
            url: 'http://172.26.58.27:8081/demo/notice/get',
            data: JSON.stringify({token: localStorage.getItem('token')}),
          }).then( response => {
            this.announcements = response.data['noticeArray'];
          }).catch( () => {
            this.$router.push('/');
    });
        } else {
          return false;
        }
      });
    },
    deleteAnnouncement(announcement) {
      axios({
        method: 'post',
        url: 'http://172.26.58.27:8081/demo/notice/delete',
        data: JSON.stringify({
          token: localStorage.getItem('token'),
          notice_id: announcement.id
        })
      }).then( () => {
        console.log(this.announcements);
        this.announcements = this.announcements.filter( el => el.notice_id != announcement.notice_id);
        this.$message.success('删除成功');
      }).catch( () => {
        this.$router.push('/');
        localStorage.removeItem('token');
      })
    }
  },
  created() {
    axios({
      method: 'post',
      url: 'http://172.26.58.27:8081/demo/notice/get',
      data: JSON.stringify({token: localStorage.getItem('token')}),
    }).then( response => {
      this.announcements = response.data['noticeArray'];
    }).catch( () => {
      this.$router.push('/');
      localStorage.removeItem('token');
    });
  },
};
</script>
