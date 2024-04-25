<template>
  <el-container>
    <el-header :height="headerHeight" ref="header">
      欢迎管理员
      <el-button @click="onQuit">退出</el-button>
    </el-header>
    <el-container>
      <el-aside width="200px">
        <el-menu 
          :default-active="defaultActive"
          background-color="#E9EAEB"
          @select="handleMenuSelect">
            <el-submenu index="1">
              <template slot="title">
                <i class="el-icon-user-solid"></i>
                <span> 人员管理 </span>
              </template>
              <el-menu-item index="CUM"> 普通用户管理 </el-menu-item>
              <el-menu-item index="AM"> 审核管理 </el-menu-item>
              <el-menu-item index="CSM"> 客服管理 </el-menu-item>
            </el-submenu>
            <el-menu-item index="TCM">
              <i class="el-icon-coin"></i>
              <span> 时间币管理 </span>
            </el-menu-item>
            <el-menu-item index="ICC" @click="handleClickICC">
              <i class="el-icon-chat-dot-round"></i>
              <span> 内部交流通道 </span>
              <el-badge :hidden="unreadMessagesCount === 0 ? true : false" :value="unreadMessagesCount"></el-badge>
            </el-menu-item>
            <el-menu-item index="AP">
              <i class="el-icon-s-order"></i>
              <span> 公告发布 </span>
            </el-menu-item>
            <el-menu-item index="TAM">
              <i class="el-icon-s-data"></i>
              <span> 任务监控 </span>
            </el-menu-item>
            <el-menu-item index="SOPA">
              <i class="el-icon-document"></i>
              <span> 往期审核汇总 </span>
            </el-menu-item>
            <el-menu-item index="MA" role="AD">
              <i class="el-icon-s-custom"></i>
              <span> 我的账号 </span>
            </el-menu-item>
        </el-menu>
      </el-aside>
      <el-main class="main">
        <component 
          :is="currentComponent" :msg="msg" :socket="socket" :mySessionId="mySessionId" :avatar="avatar" @updateMsg="msg.push($event)"
          class="component">
        </component>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import CUM from './components/CUM.vue'
import AM from './components/AM.vue'
import AP from './components/AP.vue'
import CSM from './components/CSM.vue'
import ICC from './components/ICC.vue'
import MA from './components/MA.vue'
import SOPA from './components/SOPA.vue'
import TAM from './components/TAM.vue'
import TCM from './components/TCM.vue'
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
    TAM,
    TCM,
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
      avatar: 'http://dummyimage.com/400x400',
      headerHeight: ''
    }
  },
  created() {
    
    // console.log('headerHeight:',this.headerHeight);
    // 如果没有token或者role不符合，返回登录界面
    if(!localStorage.getItem('token') || localStorage.getItem('role') != 'AD') {
      this.$router.push('/');
      localStorage.removeItem('token');
      return;
    }

    // 请求账号信息
    axios({
      method: 'post',
      url: 'http://8.138.119.85:8080/demo_war/adAccount/get',
      data: JSON.stringify({
        token: localStorage.getItem('token')
      })
    }).then(response => {
      this.mySessionId = 'AD' + '_' + response.data['id'];
      console.log("mySessionId:", this.mySessionId)

      // 登陆成功后，建立websocket连接，获取未读消息，显示小红点
      // 创建WebSocket连接
      console.log(this.mySessionId)
      this.socket = new WebSocket(`ws:8.138.119.85:8080/demo_war/test?sessionId=${this.mySessionId}`);

      // 监听WebSocket事件
      this.socket.onopen = () => {
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
  mounted() {
    this.headerHeight = String(getComputedStyle(this.$refs.header.$el, null).getPropertyValue("line-height"));
  },
  beforeDestroy() {
    if(this.socket)
      this.socket.close();
  },  
  methods:{
    onQuit() {
      this.$router.push('/');
      localStorage.removeItem('token');
    },
    handleUnreadMsg(data) {
      if(data['msg'] != null)
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
      let readMsgId = this.msg.filter(obj => !obj.isRead).map(obj => obj.id);
      
      const sendMsg = {
        token : localStorage.getItem('token'),
        type : 'chatIsRead',
        id : readMsgId,
      }

      console.log(readMsgId.length, this.msg.length)
      if(readMsgId.length != 0) {
        //用websocket发送
        this.socket.send(JSON.stringify(sendMsg));
      }

      //将msg中所有的消息的isRead字段改成true
      this.msg = this.msg.map(item => ({...item, isRead : true}));
    }
  }
}
</script>

<style>
  :root {
    --header-height: 80px;
  }
</style>

<style scoped>
  .el-header {
    position: fixed;
    width: 100vw;
    background-color: rgba(64, 158, 255, 0.8);
    color: #333;
    line-height: var(--header-height);
    z-index: 2;
  }
  .el-menu {
    position: fixed;
    height: calc(100vh - var(--header-height));
    top: var(--header-height);
    width: 200px;
  }
  .main {
    position: relative;
    top: var(--header-height);
    /* left:  */
    z-index: 1;
  }
</style>
  