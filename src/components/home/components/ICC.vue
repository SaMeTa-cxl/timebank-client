<template>
  <div class="chat-room">
    <!-- 头部信息 -->
    <div class="header">{{ chatRoomName }}</div>

    <div class="message-box">
      <!-- 历史消息 -->
      <div v-show="showHistoryMessages" class="message-window">
        <transition-group name="fade" tag="div" class="message-container">
          <div v-for="(message, index) in historyMessages" :key="index" class="message" :class="{ 'right-message': message.senderSessionId === mySessionId, 'left-message': message.senderSessionId !== mySessionId }">
            <div>{{ messageDecoder(message.content) }}</div>
            <div class="message-info">{{ formatMessageInfo(message) }}</div>
          </div>
        </transition-group>
      </div>

      <!-- 显示更多按钮 -->
      <div v-if="showMoreButton" class="show-more-button">
        <el-button type="text" @click="showMoreMessages" icon="el-icon-arrow-down">显示更多</el-button>
      </div>

      <!-- 消息窗口 -->
      <div class="message-window">
        <!-- 未读新消息 -->
        <div v-if="msg.length > 0" class="unread-messages">
          <transition-group name="fade" tag="div" class="message-container">
            <div v-for="(message, index) in msg" :key="index" class="message" :class="{ 'right-message': message.senderSessionId === mySessionId, 'left-message': message.senderSessionId !== mySessionId }">
              <div>{{ messageDecoder(message.content) }}</div>
              <div class="message-info">{{ formatMessageInfo(message) }}</div>
            </div>
          </transition-group>
        </div>
      </div>
    </div>

    <!-- 消息编辑窗口 -->
    <div class="message-editor" @keyup.enter="sendMessage">
      <el-input v-model="newMessage" placeholder="输入消息..." />
      <el-button type="primary" @click="sendMessage" icon="el-icon-chat-dot-round">发送</el-button>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'ICC',
  props: ['msg', 'socket', 'mySessionId'],
  data() {
    return {
      chatRoomName: '内部交流通道',
      showMoreButton: true,
      showHistoryMessages: false,
      historyMessages: [],
      newMessage: '',
      key: 'abc'
    };
  },
  methods: {
    showMoreMessages() {
      this.showHistoryMessages = true;
      this.showMoreButton = false;
    },
    sendMessage() {
      if (this.newMessage.trim() !== '') {
        // 在这里发送消息到WebSocket服务器
        console.log('发送消息:', this.newMessage);
        const sendMsg = {
          type: "chat/send",
          msg: {
            type: "chat",
            senderSessionId: this.mySessionId,
            content: this.messageEncode(this.newMessage),
            contentType: "text",
            timestamp: Math.floor(Date.now()),
          }
        }
        console.log(sendMsg)
        this.socket.send(JSON.stringify(sendMsg));

        // 模拟收到消息后将消息添加到msg数组中
        const newMsg = {
          id: this.msg.length + 1, // 使用msg数组长度加1作为新消息的id
          senderSessionId: this.mySessionId,
          content: this.messageEncode(this.newMessage), // 使用输入框中的消息作为新消息的内容
          timestamp: Math.floor(Date.now()), // 使用当前时间作为新消息的时间戳
          isRead: true, // 默认设置为已读状态
        };

        // 将新消息添加到msg数组中
        // console.log(newMsg);
        this.$emit('updateMsg', newMsg);
        
        this.newMessage = '';
      }
    },
    formatMessageInfo(message) {
      const sender = message.senderSessionId;
      const timestamp = new Date(message.timestamp); 
      return `${sender} - ${timestamp.toLocaleString()}`;
    },
    messageDecoder(message) {
      const CryptoJS = require('crypto-js');
      return CryptoJS.AES.decrypt(message, this.key).toString(CryptoJS.enc.Utf8);
    },
    messageEncode(message) {
      const CryptoJS = require('crypto-js');
      return CryptoJS.AES.encrypt(message, this.key).toString();
    }
  },
  mounted() {
    // 在这里获取历史消息
    axios({
      method: 'post',
      url: 'https://mock.apifox.com/m1/4316049-3958895-default/chat/history',
      data: JSON.stringify({token: localStorage.getItem('token')}),
    }).then( (response) => {
      this.historyMessages = response.data['msg'];
      // 使用filter方法过滤出与msg数组不同的元素,即找到真正的历史信息
      this.historyMessages = this.historyMessages.filter(message => {
        return !this.msg.some(item => item.id === message.id && item.senderSessionId === message.senderSessionId);
      });
      console.log(this.historyMessages);
    }).catch((err) => {
      console.log(err);
      this.$router.push('/');
      localStorage.removeItem('token');
    })
    // console.log("msg:", this.msg)
    // console.log("history:", this.historyMessages)
  },
};
</script>

<style scoped>

.chat-room {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 85vh;
  overflow-y: auto;
  overflow-x: hidden;
}

.header {
  padding: 10px;
  background-color: #2196f3;
  color: #fff;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 100;
}

.message-box {
  margin-top: 50px;
}

.message-window {
  flex-grow: 1;
  overflow-y: hidden;
  padding: 10px;
}

.message-container {
  display: flex;
  flex-direction: column;
}

.message {
  margin-bottom: 10px;
  padding: 10px;
  border-radius: 10px;
  background-color: #f0f0f0;
  max-width: 80%;
  word-wrap: break-word;
  margin-right: 20px; /* 添加右边距 */
}

.right-message {
  align-self: flex-end;
  background-color: #66bb6a;
  color: #fff;
}

.left-message {
  align-self: flex-start;
  background-color: #e0e0e0;
}

.message-info {
  font-size: 12px;
  color: #f88484;
  margin-top: 5px;
}

.message-editor {
  display: flex;
  align-items: center;
  padding: 10px;
  background-color: #f0f0f0;
}

.el-input {
  flex-grow: 1;
  margin-right: 10px;
}

.show-more-button {
  text-align: center;
  margin-bottom: 10px;
}
</style>

