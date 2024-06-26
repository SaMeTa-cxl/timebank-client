<template>
  <el-container>
    <el-header :height="headerHeight" ref="header">
      欢迎客服
      <el-button @click="onQuit">退出</el-button>
    </el-header>
    <el-container>
      <el-aside width="200px">
        <el-menu :default-active="defaultActive" class="el-menu-vertical-demo" @select="handleMenuSelect" background-color="#E9EAEB">
          <el-menu-item index="FP" @click="handleClickFP">
            反馈处理
            <el-badge :hidden="unreadFeedbackCount === 0 ? true : false" :value="unreadFeedbackCount"></el-badge>
          </el-menu-item>
          <el-menu-item index="ICC" @click="handleClickICC">
            内部交流通道
            <el-badge :hidden="unreadMessagesCount === 0 ? true : false" :value="unreadMessagesCount"></el-badge>
          </el-menu-item>
          <el-menu-item index="MA" role="CS">我的账号</el-menu-item>
        </el-menu>
      </el-aside>
      <el-main class="main">
        <component 
              :is="currentComponent" :msg="msg" :socket="socket" role="CS" :feedback="feedback"
              :mySessionId="mySessionId"
              :name="name" :avatar="avatar"
              :key="componentKey"
              @updateMsg="msg.push($event)"
              @updateFeedback="onUpdateFeedback($event)"
              @refresh="refreshComponent()">
            </component>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import ICC from './components/ICC.vue';
import MA from './components/MA.vue';
import FP from './components/FP.vue';
import axios from 'axios';

export default {
  name: 'CS',
  components: {
    FP,
    ICC,
    MA
  },
  computed: {
    //计算未读消息的数量
    unreadMessagesCount() {
      return this.msg.filter(item => !item.isRead).length;
    }
  },
  data () {
    return {
      defaultActive: '',
      currentComponent: '',
      msg: [],
      feedback: {},
      socket: null,
      connected: false,
      mySessionId: '',
      name: '',
      avatar: '',
      unreadFeedbackCount: 0,
      componentKey: new Date().getTime(),
      headerHeight: ''
    }
  },
  async created() {
    // 如果没有token或者role不符合，返回登录界面
    if(!localStorage.getItem('token') || localStorage.getItem('role') != 'CS') {
      this.$router.push('/');
      localStorage.removeItem('token');
      return;
    }

    await axios({
      method: 'post',
      url: 'http://8.138.119.85:8080/demo_war/csAccount/get',
      data: JSON.stringify({
        token: localStorage.getItem('token')
      })
    }).then(response => {
      this.mySessionId = 'CS' + '_' + response.data['id'];
      this.name = response.data['name'];
      this.avatar = response.data['img'];
      console.log("myAvatar:", this.avatar)

      this.socket = new WebSocket(`ws:8.138.119.85:8080/demo_war/test?sessionId=${this.mySessionId}`);

      // 监听WebSocket事件
      this.socket.onopen = () => {
        console.log('WebSocket connected');
      };

      this.socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        // console.log(data)
        if(data['type'] === 'chat/unread') 
          this.handleUnreadMsg(data);         /* 处理未读消息 */
        else if(data['type'] === 'chat/receive')
          this.handleReceiveMsg(data);           /* 处理新收到的消息 */
        else if(data['type'] === 'feedback/unread')
          this.handleUnreadFeedback(data.msg);
        else
          this.handleReceiveFeedback(data.msg);
      };

      this.socket.onerror = (error) => {
        console.log('WebSocket error:', error);
      };

      this.socket.onclose = () => {
        console.log('WebSocket closed');
      };
    }).catch(err => {
      console.log(err);
      this.$router.push('/');
      localStorage.removeItem('token');
    });

    await axios({
      method: 'post',
      url:'http://8.138.119.85:8080/demo_war/feedback/getId2',
      data: JSON.stringify({token: localStorage.getItem('token')})
    }).then( response => {
      if(response.data.status) {
        console.log(response.data.ids)
        for(let i = 0; i < response.data.ids.length; i++) {
          console.log("建立连接的用户编号：",response.data.ids[i]);
          let cuSessionId = 'CU_' + response.data.ids[i];
          this.feedback[cuSessionId] = [];

          // 查看是否有历史消息，没有则删除该用户
          axios({
            method: 'post',
            url: 'http://8.138.119.85:8080/demo_war/feedback/history',
            data: JSON.stringify({
              token: localStorage.getItem('token'),
              cuSessionId: cuSessionId,
              csSessionId: this.mySessionId
            })
          }).then( response => {
            if(!response.data.msg.length) {
              delete this.feedback[cuSessionId];
              // console.log("delete feedback:",this.feedback);
              return;
            }
            console.log(`与${cuSessionId}的聊天记录：`,response.data.msg);
          }).catch(() => {
            this.$router.push('/');
            localStorage.removeItem('token');
          });
        }
      }
    })
  },
  beforeDestroy() {
    this.socket.close();
  },  
  mounted() {
    this.headerHeight = String(getComputedStyle(this.$refs.header.$el, null).getPropertyValue("line-height"));
  },
  methods:{
    refreshComponent() {
      console.log('refresh component');
      this.componentKey = new Date().getTime();
    },
    onUpdateFeedback(newFeedback) {
      console.log("update new feedback:", newFeedback);
      console.log('before adding, feedback:', this.feedback);
      this.feedback[newFeedback.receiverSessionId].push(newFeedback);
      console.log('after adding, feedback:', this.feedback);
    },
    onQuit() {
      this.$router.push('/');
      localStorage.removeItem('token');
    },
    handleUnreadFeedback(msg) {
      console.log('handleUnreadFeedback');
      console.log(msg);
      if(msg.length == 0) return;
      msg.forEach(el => {
        if(!this.feedback[el.senderSessionId]) 
          this.feedback[el.senderSessionId] = [el];
        else
          this.feedback[el.senderSessionId].push(el);        
      });

      //维护未读反馈数量
      for(let key in this.feedback) {
        this.unreadFeedbackCount += this.feedback[key].filter(item => !item.isRead).length;
      }
      // console.log(this.feedback)
    },
    handleReceiveFeedback(msg) {
      console.log('handleReceivedFeedback');
      if(!msg) return;
      //如果当前在FP中，则直接将该消息标记为已读后加入feedback,并向websocket发送“已经读取”消息，否则将新消息直接加入feedback
      if(this.currentComponent === 'FP') {
        msg.isRead = true;
        console.log("msg:", msg.senderSessionId);
        console.log("feedback:", this.feedback);
        this.feedback[msg.senderSessionId].push(msg); 
        this.socket.send(JSON.stringify({
          token : localStorage.getItem('token'),
          type : 'feedbackIsRead',
          id : [msg.id],
        }));
        
      } else {
        this.feedback[msg.senderSessionId].push(msg); 
        this.unreadFeedbackCount++;
      }
      this.refreshComponent();
      console.log(this.feedback);
    },
    handleUnreadMsg(data) {
      if(data['msg'] == null) return;
      this.msg = this.msg.concat(data['msg']);
      console.log(this.msg);
    },
    handleReceiveMsg(data) {
      if(!data['msg']) return;
      let newMessage = data['msg'];
      //如果当前在ICC中，则直接将该消息标记为已读后加入msg,并向websocket发送“已经读取”消息，否则将新消息直接加入msg
      if(this.currentComponent === 'ICC') {
        newMessage.isRead = true;
        this.msg.push(newMessage);
        this.socket.send(JSON.stringify({
          token : localStorage.getItem('token'),
          type : 'chatIsRead',
          id : this.msg.filter(obj => !obj.isRead).map(obj => obj.id),
        }));
      } else 
        this.msg.push(newMessage);
    },
    handleMenuSelect(index) {
      this.currentComponent = index;
    },
    handleClickICC() {
      /*
        发送消息给后端，表示消息已读
      */
      let readMsgId = this.msg.filter(obj => !obj.isRead).map(obj => obj.id);
      const sendMsg = {
        token : localStorage.getItem('token'),
        type : 'chatIsRead',
        id :  readMsgId,
      }

      if(readMsgId.length == 0) return;

      //用websocket发送
      this.socket.send(JSON.stringify(sendMsg));

      //将msg中所有的消息的isRead字段改成true
      this.msg = this.msg.map(item => ({...item, isRead : true}));
    },
    handleClickFP() {
      /*
        发送消息给后端，表示消息已读
      */
     // 获取所有未读消息的id数组
      let readFeedbackId = [];
      for(let key in this.feedback) {
        readFeedbackId = readFeedbackId.concat(this.feedback[key].filter(el => !el.isRead).map(el => el.id))
      }
      console.log(readFeedbackId);

      // 将未读消息数量清零
      this.unreadFeedbackCount = 0;

      const sendMsg = {
        token : localStorage.getItem('token'),
        type : 'feedbackIsRead',
        id : readFeedbackId
      }

      if(readFeedbackId.length == 0) return;
      console.log("send:", sendMsg);

      //用websocket发送
      this.socket.send(JSON.stringify(sendMsg));

      //将msg中所有的消息的isRead字段改成true
      for(let key in this.feedback) {
        this.feedback[key] = this.feedback[key].map(item => ({...item, isRead: true}));
      }
    },
  }
}
</script>

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
  