<template>
  <div>
    <el-tabs v-model="activeName">
      <el-tab-pane label="账号信息" name="first">
        <el-card>
          <div slot="header" class="clearfix">
            <span>账号信息</span>
            <el-button type="primary" class="edit-btn" @click="editAccount">编辑</el-button>
          </div>
          <div v-if="editing" class="edit-form-container">
            <el-form ref="editForm" :model="formData" label-width="100px">
              <el-form-item label="用户ID">
                <span>{{ formData.userId }}</span>
              </el-form-item>
              <el-form-item label="手机号">
                <el-input v-model="formData.phoneNumber"></el-input>
              </el-form-item>
              <el-form-item label="用户名">
                <el-input v-model="formData.username"></el-input>
              </el-form-item>
              <el-form-item label="用户头像">
                    <el-upload
                        class="avatar-uploader"
                        action="#"
                        :auto-upload="false"
                        :show-file-list="false"
                        :on-change="handleChangeAvatar">
                        <img v-if="avatarUrl" :src="avatarUrl" class="avatar">
                        <i v-else class="el-icon-plus avatar-uploader-icon"></i>
                    </el-upload>
                </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="saveChanges">保存</el-button>
              </el-form-item>
            </el-form>
          </div>
          <div v-else>
            <div class="account-info">
              <div class="info-item">用户ID: {{ userInfo.userId }}</div>
              <div class="info-item">手机号: {{ userInfo.phoneNumber }}</div>
              <div class="info-item">用户名: {{ userInfo.username }}</div>
              <div class="info-item">
                头像:
                <img v-if="avatarUrl" :src="avatarUrl" class="avatar">
                <span v-else>未设置</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-tab-pane>
      <el-tab-pane label="修改密码" name="second">
        <el-form :model="ruleForm" status-icon :rules="rules" ref="ruleForm" label-width="100px" style="width: 50%;">
          <el-form-item label="旧密码" prop="oldPass">
            <el-input type="password" v-model="ruleForm.oldPass"></el-input>
          </el-form-item>
          <el-form-item label="新密码" prop="pass">
            <el-input type="password" v-model="ruleForm.pass" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="确认新密码" prop="checkPass">
            <el-input type="password" v-model="ruleForm.checkPass" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="submitForm('ruleForm')">提交</el-button>
            <el-button @click="resetForm('ruleForm')">重置</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>
    </el-tabs>  
  </div>
</template>

<script>
import axios from 'axios';
export default {
  props: ['role'],
  data() {
    var validateOldPass = (rule, value, callback) => {
      if (value === '') {
        return callback(new Error('请输入旧密码'));
      }
      callback();
    };
    var validatePass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入新密码'));
      } else {
        if (this.ruleForm.checkPass !== '') {
          this.$refs.ruleForm.validateField('checkPass');
        }
        callback();
      }
    };
    var validatePass2 = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入旧密码'));
      } else if (value !== this.ruleForm.pass) {
        callback(new Error('两次输入密码不一致!'));
      } else {
        callback();
      }
    };
    return {
      editing: false,
      userInfo: {
        userId: '12345',
        phoneNumber: '1234567890',
        username: 'user123',
      },
      formData: {
        userId: '12345',
        phoneNumber: '1234567890',
        username: 'user123',
        img: null,
      },
      hasChangedAvatar: false,
      avatarUrl: null,
      tmpAvatarUrl: null,
      activeName: 'first',
      ruleForm: {
        oldPass: '',
        pass: '',
        checkPass: '',
      },
      rules: {
        pass: [
          { validator: validatePass, trigger: 'blur' }
        ],
        checkPass: [
          { validator: validatePass2, trigger: 'blur' }
        ],
        oldPass: [
          { validator: validateOldPass, trigger: 'blur' }
        ]
      }
    };
  },
  methods: {
    editAccount() {
      this.editing = true;
      this.formData = { ...this.userInfo };
    },
    async saveChanges() {
      // 保存修改
      this.userInfo = { ...this.formData };
      this.editing = false;

      let flag = true;
      let err = '';

      //三种角色的请求接口表
      let urlMap = {
        'AD': 'http://8.138.119.85:8080/demo_war/adAccount/upload',
        'AU': 'http://8.138.119.85:8080/demo_war/auAccount/upload',
        'CS': 'http://8.138.119.85:8080/demo_war/csAccount/upload',
      };

      if(this.hasChangedAvatar) {
        // 向服务端发送更新头像请求
        await axios({
          method: 'post',
          url: urlMap[localStorage.getItem('role')],
          data: JSON.stringify({
            img: this.formData.img,
            token: localStorage.getItem('token'),
          })
        }).then(response => {
          flag &&= response.data['status'];
          if(!response.data['status']) {
            err += response.data['msg'] + ' ';
            this.avatarUrl = this.tmpAvatarUrl;
          }
        }).catch(err => {
          console.log(err);
          this.$router.push('/');
          localStorage.removeItem('token');
        })
      }

      urlMap = {
        'AD': 'http://8.138.119.85:8080/demo_war/adAccount/set',
        'AU': 'http://8.138.119.85:8080/demo_war/auAccount/set',
        'CS': 'http://8.138.119.85:8080/demo_war/csAccount/set',
      };
      //向服务端发送其他信息的更新请求
      await axios({
        method: 'post',
        url: urlMap[localStorage.getItem('role')],
        data: JSON.stringify({
          token: localStorage.getItem('token'),
          name: this.formData.username == this.userInfo.username ? null : this.formData.username,
          tel: this.formData.phoneNumber == this.userInfo.phoneNumber ? null : this.formData.phoneNumber,
        })
      }).then(response => {
        flag &&= response.data['status'];
        if(!response.data['status']) err += response.data['msg'];
      }).catch(err => {
        console.log(err);
        this.$router.push('/');
        localStorage.removeItem('token');
      })

      
      if(flag)
        this.$message({
          message: '更新成功',
          type: 'success'
        });
      else
        this.$message.error('更新失败：'+err);
    },
    handleChangeAvatar(file) {
      this.hasChangedAvatar = true;
      // 判断格式和大小要求
      const isJPGorPNG = file.raw.type === 'image/jpeg' || file.raw.type === 'image/png';
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isJPGorPNG) {
        this.$message.error('上传头像图片只能是 JPG/PNG 格式!');
        return;
      }
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过 2MB!');
        return;
      }

      this.tmpAvatarUrl = this.avatarUrl;
      this.avatarUrl = URL.createObjectURL(file.raw);
      // 使用FileReader读取文件数据
      const reader = new FileReader();
      reader.onload = (event) => {
        this.formData.img = event.target.result;
        console.log(JSON.stringify(this.formData));
      };
      reader.readAsDataURL(file.raw);
    },
    sha256(message) {
      const crypto = require('crypto-js');
      return crypto.SHA256(message).toString();
    },
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          let urlMap = {
            'AD': 'http://8.138.119.85:8080/demo_war/adAccount/setPwd',
            'AU': 'http://8.138.119.85:8080/demo_war/auAccount/setPwd',
            'CS': 'http://8.138.119.85:8080/demo_war/csAccount/setPwd',
          };
          //向服务端发送更新密码请求
          axios({
            method: 'post',
            url: urlMap[localStorage.getItem('role')],
            data: JSON.stringify({
              token: localStorage.getItem('token'),
              pwd: this.sha256(this.ruleForm.oldPass),
              newPwd: this.sha256(this.ruleForm.pass),
            })
          }).then(response => {
            if(response.data['status'])
              this.$message({
                message: '更新成功',
                type: 'success'
              });
            else
              this.$message.error('更新失败：'+response.data['msg']);
          }).catch(err => {
            console.log(err);
            this.$router.push('/');
            localStorage.removeItem('token');
          })
        } else {
          this.ruleForm.checkPass = this.ruleForm.pass = ''
        }
      });
    },
    resetForm(formName) {
      this.$refs[formName].resetFields();
    },
  },
  async mounted() {
    const urlMap = {
      'AD': 'http://8.138.119.85:8080/demo_war/adAccount/get',
      'AU': 'http://8.138.119.85:8080/demo_war/auAccount/get',
      'CS': 'http://8.138.119.85:8080/demo_war/csAccount/get',
    }
    // console.log(urlMap[localStorage.getItem('role')])
    //请求账号信息
    await axios({
      method: 'post',
      url: urlMap[localStorage.getItem('role')],
      data: JSON.stringify({
        token: localStorage.getItem('token')
      })
    }).then(response => {
      this.userInfo.phoneNumber = response.data['tel'];
      this.userInfo.userId = response.data['id'];
      this.userInfo.username = response.data['name'];
      this.avatarUrl = "http://8.138.119.85:8080/images" + response.data['img'];
      console.log(this.avatarUrl);
    }).catch(err => {
      console.log(err);
      this.$router.push('/');
      localStorage.removeItem('token');
    })
  },  
};
</script>

<style scoped>
.clearfix {
  display: flex;
  justify-content: space-between;
}
.edit-btn {
  margin-top: -4px;
}
.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  transition: transform 0.3s ease;
}
.avatar:hover {
  transform: scale(1.1);
}
.avatar-uploader {
  display: flex;
  align-items: center;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
}
.account-info {
  display: flex;
  flex-direction: column;
}
.info-item {
  margin-bottom: 10px;
}
.edit-form-container {
  transition: height 0.3s ease;
}
</style>
