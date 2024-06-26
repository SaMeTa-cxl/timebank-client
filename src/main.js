import Vue from 'vue'
import App from './App.vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css';
import router from './router'; // 导入路由配置  

import axios from 'axios'
import VueRouter from 'vue-router';
Vue.prototype.$http = axios

Vue.config.productionTip = false
Vue.use(ElementUI);
Vue.use(VueRouter)
new Vue({
  router,
  render: h => h(App),
}).$mount('#app')
