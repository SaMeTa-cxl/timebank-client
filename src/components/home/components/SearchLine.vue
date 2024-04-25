<template>
    <div class="search-line">
        <el-form :inline="true" :model="searchForm" style="width: 100%; " ref="form">
            <el-form-item label="用户编号" prop="id">
                <el-input v-model="searchForm.id" placeholder="用户编号" style="width: 500px"></el-input>
            </el-form-item>
            <el-form-item label="用户名" prop="name">
                <el-input v-model="searchForm.name" placeholder="用户名" style="width: 500px;"></el-input>
            </el-form-item>
            
            <el-form-item label="用户状态" prop="userStatus">
                <el-radio-group v-model="searchForm.userStatus" style="width: 200px">
                    <el-radio-button v-model="searchForm.userStatus" :label=true>正常</el-radio-button>
                    <el-radio-button v-model="searchForm.userStatus" :label=false>禁用</el-radio-button>
                </el-radio-group>
            </el-form-item>
            <el-form-item label="注册时间" prop="register">
                <el-date-picker
                    style="width: 500px"
                    v-model="searchForm.register"
                    type="datetimerange"
                    :picker-options="pickerOptions"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    align="right">
                </el-date-picker>
            </el-form-item>
            <el-form-item label="登录时间" prop="login">
                <el-date-picker
                    style="width: 500px"
                    v-model="searchForm.login"
                    type="datetimerange"
                    :picker-options="pickerOptions"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    align="right">
                </el-date-picker>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="handleSearch" style="margin-left: 50px;">查询</el-button>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="onReset()" >重置</el-button>
            </el-form-item>
        </el-form>
    </div>
</template>

<script>

import axios from 'axios';

export default {
    props: ['role'],
    data() {
        return {        
            searchForm: {
                id: '',
                name: null,
                phone: null,
                register: null,
                login: null,
                userStatus: null,
            },
            pickerOptions: {
                shortcuts: [{
                    text: '最近一周',
                    onClick(picker) {
                        const end = new Date();
                        const start = new Date();
                        start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
                        picker.$emit('pick', [start, end]);
                    }
                }, {
                    text: '最近一个月',
                    onClick(picker) {
                        const end = new Date();
                        const start = new Date();
                        start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
                        picker.$emit('pick', [start, end]);
                    }
                }, {
                    text: '最近三个月',
                    onClick(picker) {
                        const end = new Date();
                        const start = new Date();
                        start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
                        picker.$emit('pick', [start, end]);
                    }
                }]
            },
        }
    },
    methods: {
        onReset() {
            this.$refs.form.resetFields();  
            // console.log(this.$refs.form);
        },
        handleSearch() {
            //处理日期
            let processedSearchForm = JSON.parse(JSON.stringify(this.searchForm));
            if(this.searchForm.register != null) {
                processedSearchForm['registerBegin'] = this.searchForm.register[0].getTime();
                processedSearchForm['registerEnd'] = this.searchForm.register[1].getTime();
            }
            else
                processedSearchForm['registerBegin'] = 
                processedSearchForm['registerEnd'] = null;
            if(this.searchForm.login != null) {
                processedSearchForm['loginBegin'] = this.searchForm.login[0].getTime();
                processedSearchForm['loginEnd'] = this.searchForm.login[1].getTime();
            }
            else
                processedSearchForm['loginBegin'] =
                processedSearchForm['loginEnd'] = null;

            if(this.searchForm.name === '')
                processedSearchForm.name = null;  
            
            if(this.searchForm.id !== '')
                processedSearchForm.id = Number(this.searchForm.id);
            else
                processedSearchForm.id = null;

            delete processedSearchForm.register;
            delete processedSearchForm.login;

            processedSearchForm['token'] = localStorage.getItem('token');
            processedSearchForm['role'] = this.role;
            // processedSearchForm['userStatus'] = this.searchForm.userStatus == 'true' ? true : false;
            console.log(processedSearchForm)
            console.log(localStorage.getItem('token'))

            this.$emit('searching');
            axios({
                method: 'post',
                url: 'http://8.138.119.85:8080/demo_war/common/select',
                data: JSON.stringify(processedSearchForm)
            }).then(response => {
                this.$emit('searchUser', response.data['userArray']);
            }).catch(err => {
                console.log(err);
                localStorage.removeItem('token');
                this.$router.push('/');
            })
        },
    },
}
</script>

<style scoped>
.search-line {
    background-color: aquamarine;
    padding: 10px;
    border-width: 0px;
    border-style: solid;
    border-radius: 10px;
    margin-bottom: 10px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1)
}   
</style>