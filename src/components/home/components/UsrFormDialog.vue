<template>
  <el-dialog 
        title="详细信息" 
        :visible.sync="dialogFormVisible" 
        width="600px" 
        align="left" 
        :before-close="onClose">
        <el-form ref="form" :model="formData" label-width="auto" label-position="left">
            <el-form-item label="用户编号">
                <span>{{formData.id}}</span>
            </el-form-item>
            <el-form-item label="用户头像">
                <el-avatar :size="50" :src="formData.img" shape="square"></el-avatar>
            </el-form-item>
            <el-form-item label="用户名">
                <el-input v-model="formData.name" :disabled="!editable"></el-input>
            </el-form-item>
            <el-form-item label="电话号码">
                <el-input v-model="formData.phone" :disabled="!editable"></el-input>
            </el-form-item>
            <el-form-item label="注册时间">
                <i class="el-icon-time"></i>
                {{ calculateDate(formData.register) }}
            </el-form-item>
            <el-form-item label="最后登录时间">
                <i class="el-icon-time"></i>
                {{ calculateDate(formData.login) }}
            </el-form-item>
            <el-form-item label="用户状态">
                <el-switch
                    v-model="formData.userStatus"
                    active-color="#13ce66"
                    inactive-color="#ff4949"
                    :disabled="!editable">
                </el-switch>
            </el-form-item>
            <el-form-item label="发布任务数">
                <span> {{ formData.publishTaskNum }} </span>
            </el-form-item>
            <el-form-item label="接受任务数">
                <span> {{ formData.acceptTaskNum }} </span>
            </el-form-item>
            <el-form-item label="完成任务数">
                <span> {{ formData.finishTaskNum }} </span>
            </el-form-item>
            <el-form-item label="时间币数">
                <el-input v-model="formData.userCoin" :disabled="!editable"></el-input>
            </el-form-item>
            <el-form-item label="用户评分">
                <el-rate
                    v-model ="formData.userScore"
                    :disabled="!editable"
                    show-score
                    text-color="#ff9900">
                </el-rate>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="onEdit" ref="editBtn">编辑</el-button>
            </el-form-item>  
        </el-form> 
    </el-dialog>
</template>

<script>
import axios from 'axios';
export default {
    props : {
        details : Object,
    },
    data() {
        return {
            dialogFormVisible : true,
            editable : false,
            formData : {},
        }
    },
    methods : {
        onEdit(e) {
            const target = e.target;
            if(!this.editable) {
                //如果此前是禁止编辑状态，则改变按钮样式，允许编辑即可
                target.textContent = '保存';
                this.editable = true;
            } else {
                //如果此前处于编辑状态
                //先保存数据
                target.textContent = '编辑';
                this.editable = false;
                //再更新父组件数据
                this.$emit('updateData', this.formData);
                //设置请求数据体
                let requestData = {
                    token : localStorage.getItem('token'),
                    id : this.formData.id,
                    name : this.formData.name,
                    phone : this.formData.phone,
                    coin : this.formData.coin,
                    img : this.formData.img
                };
                console.log(requestData)
                //发送更新请求
                axios({
                    method: 'post',
                    url: 'http://172.26.58.27:8081/demo/CUM/updateById',
                    data: JSON.stringify(requestData)
                }).then(response => {
                    if(response.data['status'])
                        this.$message({
                            message: '保存成功',
                            type: 'success'
                        });
                    else
                        this.$message.error('保存失败：'+response.data['msg']);

                }).catch(err => {
                    console.log(err);
                    this.$router.push('/');
                    localStorage.removeItem('token');
                })
            }
        },
        onClose(done) {
            //设置请求数据体
            let requestData = {
                token : localStorage.getItem('token'),
                id : this.formData.id,
                name : this.formData.name,
                phone : this.formData.phone,
                coin : this.formData.coin,
                img : this.formData.img
            };
            if(this.$refs.editBtn.$el.innerText == '保存') {
                this.$confirm('检测到未保存的内容，真的要退出吗？', '确认信息', {
                    distinguishCancelAndClose: true,
                    confirmButtonText: '保存后退出',
                    cancelButtonText: '取消关闭'
                })
                .then(() => {
                    done();
                    //更新后关闭对话框
                    this.$emit('updateData', this.formData);
                    this.$emit('closeDialog');
                    //发送更新请求
                    axios({
                        method: 'post',
                        url: 'http://172.26.58.27:8081/demo/CUM/updateById',
                        data: JSON.stringify(requestData)
                    }).then(response => {
                        if(response.data['status'])
                            this.$message({
                                message: '保存成功',
                                type: 'success'
                            });
                        else
                            this.$message.error('保存失败：'+response.data['msg']);
                    }).catch(err => {
                        console.log(err);
                        this.$router.push('/');
                        localStorage.removeItem('token');
                    })
                })
                .catch(() => {
                    this.$refs.editBtn.$el.innerText = "编辑";
                    this.editable = false;
                });
            }
            else {
                done();
                this.$emit('closeDialog');
            }
        },
        calculateDate(timestamp) {
            // 创建一个Date对象，并传入Unix时间戳作为参数
            let date = new Date(timestamp); // 乘以1000转换为毫秒

            // 使用Date对象的方法来获取日期和时间的各个部分
            let year = date.getFullYear();
            let month = ("0" + (date.getMonth() + 1)).slice(-2); // 月份从0开始，所以要加1
            let day = ("0" + date.getDate()).slice(-2);
            let hours = ("0" + date.getHours()).slice(-2);
            let minutes = ("0" + date.getMinutes()).slice(-2);
            let seconds = ("0" + date.getSeconds()).slice(-2);

            // 构建日期字符串
            let formattedDate = year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;
            return formattedDate;
        },
    },
    mounted() {
        this.formData = this.details;
    },
}
</script>

<style>

</style>