<template>
    <el-dialog 
        title="新增用户" :visible.sync="dialogFormVisible" 
        :before-close="onClose" align = "left" 
        center width="30%"
        :append-to-body="false"
        :modal-append-to-body="false"> 
        <el-form :model="form" label-position="left" label-width="auto" ref="form" :rules="rules">
            <el-form-item label="用户名" prop="name">
                <el-input v-model="form.name" autocomplete="off" placeholder="请输入用户名"></el-input>
            </el-form-item>
            <el-form-item label="电话号码" prop="phone">
                <el-input v-model="form.phone" placeholder="请输入电话号码"></el-input>
            </el-form-item>
            <el-form-item v-if="role=='CU'" label="时间币数" prop="coin">
                <el-input v-model="form.coin" placeholder="请输入时间币数"></el-input>
            </el-form-item>
            <el-form-item label="密码" prop="pwd">
                <el-input v-model="form.pwd" type="password" show-password placeholder="请输入密码"></el-input>
            </el-form-item>
            <el-form-item label="确认密码" prop="pwd2">
                <el-input v-model="form.pwd2" type="password" show-password placeholder="请确认密码"></el-input>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="onConfirm" ref="confirmBtn">确定</el-button>
            </el-form-item>
        </el-form>
    </el-dialog>
</template>

<script>
import axios from 'axios';
import CryptoJS from 'crypto-js';
export default {
    props : {
        role: String,  /* 所添加用户的角色 */
    },
    data() {
        var validateName = (rule, value, callback) => {
            console.log('validating name!')
            if (value === '') {
                return callback(new Error('请输入用户名'));
            } 
            callback();
        };
        var validatePhone = (rule, value, callback) => {
            console.log('validating phone!')
            let reg = /^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/;
            if (value === '') {
                callback(new Error('请输入手机号'));
            } else if (!reg.test(value)){
                callback(new Error('请输入合法的手机号'));
            } else 
                callback();
        };
        var validateCoin = (rule, value, callback) => {
            if (value === '') {
                callback(new Error('请输入时间币数'));
            } else if (isNaN(Number(value))) {
                callback(new Error('请输入数字'));
            } else {
                callback();
            }
        };
        var validatePass = (rule, value, callback) => {
        if (value === '') {
            callback(new Error('请输入密码'));
        } else {
            if (this.form.pwd2 !== '') {
            this.$refs.form.validateField('pwd2');
            }
            callback();
        }
        };
        var validatePass2 = (rule, value, callback) => {
        if (value === '') {
            callback(new Error('请再次输入旧密码'));
        } else if (value !== this.form.pwd) {
            callback(new Error('两次输入密码不一致!'));
        } else {
            callback();
        }
        };
        return {
            disabled : false,
            dialogFormVisible : true,
            form: {
                name: '',
                phone: '',
                coin: '',
                token: '',
                pwd: '',
                pwd2: '',
            },
            rules: {
                name: [
                    { validator: validateName, trigger: 'blur' }
                ],
                phone: [
                    { validator: validatePhone, trigger: 'blur' }
                ],
                coin: [
                    { validator: validateCoin, trigger: 'blur' }
                ],
                pwd: [
                    { validator: validatePass, trigger: 'blur'}
                ],
                pwd2: [
                    { validator: validatePass2, trigger: 'blur'}
                ]
            }
        }
    },
    methods : {
        onClose(done) {
            // this.dialogFormVisible = false;
            done();
            this.$emit('closeDialog');
        },
        onConfirm() {
            this.$refs['form'].validate((valid) => {
                // 检查字段如果不符合规则，则不提交表单
                if(!valid) return;

                // 发起添加用户请求
                this.form.token = localStorage.getItem('token');
                if(this.role == 'CU') this.form.coin = Number(this.form.coin)
                console.log(this.form);
                axios({
                    method: 'post',
                    url: `http://8.138.119.85:8080/demo_war/${this.role}M/insert`,
                    data: JSON.stringify({...this.form, pwd: CryptoJS.SHA256(this.form.pwd).toString()})
                }).then(response => {
                    if(response.data['status']) {
                        this.$message({
                            message: '添加成功',
                            type: 'success'
                        });
                        axios({
                            method: 'post',
                            url: 'http://8.138.119.85:8080/demo_war/common/select',
                            data: JSON.stringify({
                                id : null,
                                name : null,
                                phone : null,
                                registerBegin : null,
                                registerEnd : null,
                                loginBegin : null,
                                loginEnd : null,
                                userStatus : null,
                                token : localStorage.getItem('token'),
                                role : this.role
                            })
                        }).then( (response) => {
                            console.log("searching after adding")
                            console.log(response.data);
                            // 更新userArray并关闭对话框
                            this.$emit('updateUserArray', response.data['userArray']);
                        }).catch((err) => {
                            console.log(err);
                            this.$router.push('/');
                            localStorage.removeItem('token');
                        });
                    }
                    else {
                        this.$message.error('添加失败：'+response.data['msg']);
                    }
                }).catch(err => {
                    console.log(err);
                    this.$router.push('/');
                    localStorage.removeItem('token');
                });
            });
        }
    }
}
</script>

<style>
    .avatar-uploader .el-upload {
        border: 1px dashed #d9d9d9;
        border-radius: 6px;
        cursor: pointer;
        position: relative;
        overflow: hidden;
    }
    .avatar-uploader .el-upload:hover {
        border-color: #409EFF;
    }
    .avatar-uploader-icon {
        font-size: 28px;
        color: #8c939d;
        width: 178px;
        height: 178px;
        line-height: 178px;
        text-align: center;
    }
    .avatar {
        width: 178px;
        height: 178px;
        display: block;
    }
</style>