<template>
  <div class="APmain">
    <div class="top-bar">
      <el-button type="text" @click="handleNewAnnouncement" style="width: 100%;">
        <span style="color: #03A3CF; font-weight: bold; font-size: 20px;">发布新公告</span>
        <i class="el-icon-circle-plus" style="font-size: 20px;"></i>
      </el-button>
    </div>
    <el-dialog
      title="发布新公告"
      :visible.sync="dialogVisible"
      width="50%"
      :before-close="handleCloseDialog"
      append-to-body="false"
      modal-append-to-body="false"
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
    <div v-for="announcement in announcements" :key="announcement.notice_id" class="annnoucement-list">
      <el-card class="box-card" style="margin-bottom: 10px;">
        <div slot="header" class="clearfix">
          <h3> {{announcement.notice_title}} </h3>
          <el-button type="primary" style="float: right;  padding: 3px 0" @click="deleteAnnouncement(announcement.notice_id)">删除</el-button>
        </div>
        <p>{{ announcement.notice_content }}</p>
        <p>发布时间：{{ new Date(announcement.notice_time).toLocaleString() }}</p>
      </el-card>
    </div>

    <el-backtop :visibility-height="200"/>
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
            url: 'http://8.138.119.85:8080/demo_war/notice/publish',
            data: JSON.stringify({
              token: localStorage.getItem('token'),
              ...this.announcementForm
            })
          }).then(() => {
            this.$message.success('发布成功');
            axios({
              method: 'post',
              url: 'http://8.138.119.85:8080/demo_war/notice/get',
              data: JSON.stringify({token: localStorage.getItem('token')}),
            }).then( response => {
              this.announcements = response.data['noticeArray'];
              this.$refs.announcementForm.resetFields();
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
            url: 'http://8.138.119.85:8080/demo_war/notice/get',
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
    deleteAnnouncement(id) {
      axios({
        method: 'post',
        url: 'http://8.138.119.85:8080/demo_war/notice/delete',
        data: JSON.stringify({
          token: localStorage.getItem('token'),
          notice_id: id,
        })
      }).then( () => {
        console.log(this.announcements);
        this.announcements = this.announcements.filter( el => el.notice_id != id);
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
      url: 'http://8.138.119.85:8080/demo_war/notice/get',
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

<style scoped>
.top-bar {
  text-align: center;
  margin-bottom: 10px;
  background-color: aqua;
  border: 0px solid;
  border-radius: 10px;
}
</style>