import Vue from 'vue';  
import VueRouter from 'vue-router';  
import LoginPage from './components/login/login.vue'; // 导入登录页面组件  
import ADHomePage from './components/home/AD.vue'; // 导入主页面组件  
import AUHomePage from './components/home/AU.vue'; // 导入主页面组件  
import CSHomePage from './components/home/CS.vue'; // 导入主页面组件  
  
Vue.use(VueRouter);  
  
const routes = [  
  {  
    path: '/',  
    name: 'Login',  
    component: LoginPage  
  },  
  {  
    path: '/AD',  
    name: 'AD',  
    component: ADHomePage  
  },  
  {  
    path: '/AU',  
    name: 'AU',  
    component: AUHomePage  
  },  
  {  
    path: '/CS',  
    name: 'CS',  
    component: CSHomePage  
  },  
];  
  
const router = new VueRouter({  
  mode: 'hash',  
  routes  
});  
  
export default router;