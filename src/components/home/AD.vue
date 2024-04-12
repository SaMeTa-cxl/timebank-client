<template>
  <div class="ad-container">
    <div class="ad-header">欢迎管理员</div>
    <div class="ad-content">
      <el-row>
        <el-col :span="5">
          <div class="ad-sidebar">
            <el-menu :default-active="defaultActive" class="el-menu-vertical-demo" @select="handleMenuSelect">
              <el-menu-item index="CUM">普通用户管理</el-menu-item>
              <el-menu-item index="AM">审核员管理</el-menu-item>
              <el-menu-item index="CSM">客服管理</el-menu-item>
              <el-menu-item index="TCM">时间币管理</el-menu-item>
              <el-menu-item index="ICC" @click="handleClickICC">
                内部交流通道
                <el-badge :hidden="unreadMessagesCount === 0 ? true : false" :value="unreadMessagesCount"></el-badge>
              </el-menu-item>
              <el-menu-item index="AP">公告发布</el-menu-item>
              <el-menu-item index="TAM">任务监控</el-menu-item>
              <el-menu-item index="TRM">流量监控</el-menu-item>
              <el-menu-item index="SOPF">往期反馈汇总</el-menu-item>
              <el-menu-item index="SOPT">往期任务汇总</el-menu-item>
              <el-menu-item index="SOPA">往期审核汇总</el-menu-item>
              <el-menu-item index="MA">我的账号</el-menu-item>
            </el-menu>
          </div>
        </el-col>
        <el-col :span="18">
          <div class="ad-main">
            <component :is="currentComponent" :msg="msg" :socket="socket" :mySessionId="mySessionId" @updateMsg="msg.push($event)"></component>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import CUM from './components/CUM.vue'
import AM from './components/AM.vue'
import AP from './components/AP.vue'
import CSM from './components/CSM.vue'
import ICC from './components/ICC.vue'
import MA from './components/MA.vue'
import SOPA from './components/SOPA.vue'
import SOPT from './components/SOPT.vue'
import SOPF from './components/SOPF.vue'
import TAM from './components/TAM.vue'
import TCM from './components/TCM.vue'
import TRM from './components/TRM.vue'
import axios from 'axios'


export default {
  name: 'AD',
  components: {
    CUM,
    AM,
    AP,
    CSM,
    ICC,
    MA,
    SOPA,
    SOPT,
    SOPF,
    TAM,
    TCM,
    TRM
  },
  computed: {
    //计算未读消息的数量
    unreadMessagesCount() {
      return this.msg.filter(item => !item.isRead).length;
    },
  },
  data () {
    return {
      defaultActive: '',
      currentComponent: '',
      msg: [],
      socket: null,
      mySessionId: '',
    }
  },
  created() {
    // 请求账号信息
    axios({
      method: 'post',
      url: 'http://172.26.58.27:8081/demo/adAccount/get',
      data: JSON.stringify({
        token: localStorage.getItem('token')
      })
    }).then(response => {
      this.mySessionId = 'AD' + '_' + response.data['id'];

        // 登陆成功后，建立websocket连接，获取未读消息，显示小红点
      // 创建WebSocket连接
      console.log(this.mySessionId)
      this.socket = new WebSocket(`ws:172.26.58.27:8081/demo/test?sessionId=${this.mySessionId}`);

      // 监听WebSocket事件
      this.socket.onopen = () => {
        this.socket.send(JSON.stringify({test: 'hello, world'}));
        console.log('WebSocket connected');
      };

      this.socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log(data)
        if(data['type'] === 'chat/unread') 
          this.handleUnreadMsg(data);         /* 处理未读消息 */
        else 
          this.handleReceive(data);           /* 处理新收到的消息 */
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      this.socket.onclose = () => {
        console.log('WebSocket closed');
      };
    }).catch(err => {
      console.log(err);
      this.$router.push('/');
      localStorage.removeItem('token');
    })
  },
  beforeDestroy() {
    this.socket.close();
  },  
  methods:{
    handleUnreadMsg(data) {
      this.msg = this.msg.concat(data['msg']);
      console.log(this.msg);
    },
    handleReceive(data) {
      console.log('receive');
      let newMessage = data['msg'];
      //如果当前在ICC中，则直接将该消息标记为已读后加入msg,并向websocket发送“已经读取”消息，否则将新消息直接加入msg
      if(this.currentComponent === 'ICC') {
        newMessage.isRead = true;
        this.msg.push(newMessage);
        this.socket.send(JSON.stringify({
          token : localStorage.getItem('token'),
          type : 'chatIsRead',
          id : [newMessage.id],
        }));
      } else 
        this.msg.push(newMessage);
    },
    handleMenuSelect(index) {
      this.currentComponent = index;
    },
    handleClickICC() {
    /*
      发送消息给后端，表示消新息已读
    */
     //构建发送信息的结构
      const sendMsg = {
        token : localStorage.getItem('token'),
        type : 'chatIsRead',
        id : this.msg.filter(obj => !obj.isRead).map(obj => obj.id),
      }

      //用websocket发送
      this.socket.send(JSON.stringify(sendMsg));

      //将msg中所有的消息的isRead字段改成true
      this.msg = this.msg.map(item => ({...item, isRead : true}));
    }
  }
}
</script>

<style scoped>
.ad-container {
  background-color: #f0f2f5; /* 淡蓝色背景 */
  color: #333; /* 深灰色文字 */
  height: 100vh;
  border-radius: 10px; /* 添加整体圆角 */
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1); /* 添加阴影 */
  overflow: hidden; /* 隐藏溢出内容 */
}

.ad-header {
  padding: 20px;
  background-color: #409eff; /* 蓝色 */
  color: #fff; /* 白色文字 */
  border-bottom: 1px solid #b3c0d1; /* 浅灰色底部边框 */
  border-top-left-radius: 10px; /* 左上角圆角 */
  border-top-right-radius: 10px; /* 右上角圆角 */
}

.ad-content {
  padding: 20px;
}

.ad-sidebar {
  background-color: #ffffff; /* 白色 */
  height: calc(100vh - 40px);
  border-right: 1px solid #b3c0d1; /* 浅灰色右侧边框 */
  border-bottom-left-radius: 10px; /* 左下角圆角 */
  border-top-left-radius: 10px; /* 左上角圆角 */
  overflow: hidden; /* 隐藏溢出内容 */
  border-bottom-right-radius: 10px; /* 右下角圆角 */
}

.ad-main {
  padding: 20px;
  height: calc(100vh - 40px);
  overflow-y: auto;
}

.el-menu {
  background-color: #ffffff; /* 白色 */
  border-right: none; /* 移除菜单的右边框 */
  border-radius: 10px; /* 添加菜单圆角 */
}

.el-menu-item:hover {
  background-color: #f0f2f5; /* 淡蓝色背景 */
}

.el-menu-item.is-active {
  background-color: #d3e9ff; /* 选中项背景色 */
} 
</style>
  