<template>
  <div class="login-container">
    <div class="background"></div>
    <div class="login-box" @keyup.enter="login">
      <div class="welcome-message">
        <!-- <img src="./assets/analysis.png" alt="Decoration Image" class="decoration-image"> -->
        <h1>欢迎访问时间银行管理平台</h1>
      </div>
      <el-form :model="loginForm" ref ="loginForm" class="login-form" :rules="rules" label-width="100px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="loginForm.username" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input type="password" v-model="loginForm.password" show-password placeholder="请输入密码"></el-input>
        </el-form-item>
        <el-form-item label="身份选择" prop="identity">
          <el-select v-model="loginForm.identity" placeholder="请选择">
            <el-option label="管理员" value="AD"></el-option>
            <el-option label="审核员" value="AU"></el-option>
            <el-option label="客服" value="CS"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item><el-button type="primary" @click="login">登录</el-button></el-form-item>
      </el-form>
    </div>
  </div>
</template>
  
<script>
import axios from 'axios';
export default {
  data() {
    return {
      loginForm: {
        username: '',
        password: '',
        identity: 'AD'
      },
      rules: {
        username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
        password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
        identity: [{ required: true, message: '请选择身份', trigger: 'change' }]
      }
    };
  },
  methods: {
    sha256(message) {
      const crypto = require('crypto-js');
      return crypto.SHA256(message).toString();
    },

    login() {
      if(this.loginForm.password == '') {
        alert("请输入密码");
        return;
      }
      if(this.loginForm.username == '') {
        alert("请输入用户名");
        return;
      }

      let crypto_password = this.sha256(this.loginForm.password);
      // this.sha256(this.loginForm.password).then(hash => {
      //   crypto_password = hash;
      // });
      console.log(crypto_password);
      // 第一次登录时获取token,并存在浏览器中,在主页面每次发送请求时携带
      let data = {
        username : this.loginForm.username,
        password : crypto_password,
        role : this.loginForm.identity
      }
      console.log(data);

      axios({
          method: 'post',
          url: 'http://172.26.58.27:8081/demo/login/passwordJudge',
          data: JSON.stringify(data)
      }).then( (response) => {      //使用箭头函数可以使this指针仍然指向的是该组件对象
          if(response.data['status']) {
            console.log(this.loginForm.identity)
            this.$router.push(`/${this.loginForm.identity}`);
            localStorage.setItem('token', response.data['token']);
            localStorage.setItem('role', this.loginForm.identity);
          }
          else {
            alert('用户名或密码错误！请检查后重新输入');
            this.loginForm.username = '';
            this.loginForm.password = '';
            this.loginForm.identity = 'AD';
          }
      }).catch(function(err){
          console.log(err);
      })
    }
  },
  created() {
    if(localStorage.getItem('token') != null) {
      let data = {
        token: localStorage.getItem('token')
      };
      axios({
          method: 'post',
          url: 'http://172.26.58.27:8081/demo/login/tokenJudge',
          data: JSON.stringify(data)
      }).then( (response) => {      //使用箭头函数可以使this指针仍然指向的是该组件对象
          localStorage.setItem('token', response.data['token']);
          this.$router.push(`/${localStorage.role}`);
      }).catch(function(err){
          console.log(err);
          localStorage.removeItem('token');
      })
    }
  }
}
</script>
  
<style scoped>
  * {
    box-sizing: border-box;
  }

  .login-container {
    position: relative;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
  }
  
  .background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(to bottom right, #7f00ff, #00ffea);
  }
  
  .login-box {
    overflow: hidden;
    display: flex;
    /* flex-direction: row; */
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: rgba(255, 255, 255, 0.6); /* 使用透明白色背景 */
    border-radius: 15px;
    box-shadow: 0px 0px 20px #34495e; 
    width: 600px;
    max-width: 90%;
  }
  
  .welcome-message {
    text-align: center;
    margin: auto;
    width: 50%;
  }
  
  .decoration-image { 
    display: flex;  
    width: 100%; 
  }
  
  .login-form { 
    margin: auto;
    margin-right: 10px;
    display: flex;
    flex-direction: column;
  }
  
  .el-form-item {
    margin-top: 20px;
    margin-bottom: 20px;
  }
  
  .el-button {
    width: 100%;
  }
</style>
  