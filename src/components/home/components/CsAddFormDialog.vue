<template>
    <el-dialog title="新增客服" :visible.sync="dialogFormVisible" :before-close="onClose" align = "left" center width="30%"> 
        <el-form :model="form" label-position="left" label-width="auto">
            <el-form-item label="用户头像">
                <el-upload
                    class="avatar-uploader"
                    action="#"
                    :auto-upload="false"
                    :show-file-list="false"
                    :on-change="handleChange">
                    <img v-if="form.img" :src="form.img" class="avatar">
                    <i v-else class="el-icon-plus avatar-uploader-icon"></i>
                </el-upload>
            </el-form-item>
            <el-form-item label="用户名">
                <el-input v-model="form.name" autocomplete="off" placeholder="请输入用户名"></el-input>
            </el-form-item>
            <el-form-item label="电话号码">
                <el-input v-model="form.phone" placeholder="请输入电话号码"></el-input>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="onConfirm" ref="confirmBtn">确定</el-button>
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
            disabled : false,
            dialogFormVisible : true,
            form: {
                name: '',
                phone: '',
                img: null,
                icon: 0,
                token: ''
            },
            blob : null,
        }
    },
    methods : {
        onClose(done) {
            done();
            this.$emit('closeDialog');
        },
        onConfirm() {
            this.dialogFormVisible = false;
            this.$emit('closeDialog');
            console.log(URL.createObjectURL(this.blob));
            this.form.img = this.blob;
            this.form.token = localStorage.getItem('token');
            axios({
                method: 'post',
                url: 'https://mock.apifox.com/m1/4316049-3958895-default/CSM/insert',
                data: JSON.stringify(this.form)
            }).then(response => {
                if(response.data['status'])
                    this.$message({
                        message: '添加成功',
                        type: 'success'
                    });
                else
                    this.$message.error('添加失败：'+response.data['msg']);
            }).catch(err => {
                console.log(err);
                this.$router.push('/');
                localStorage.removeItem('token');
            })
        },
        handleChange(file) {
            this.form.img = URL.createObjectURL(file.raw);
            // 使用FileReader读取文件数据并转换为Blob对象
            const reader = new FileReader();
            reader.onload = (event) => {
                const dataURL = event.target.result;
                this.blob = this.dataURLToBlob(dataURL);
                // 在这里可以使用blob对象进行后续操作，比如上传到服务器等
                console.log('Blob对象:', this.blob);
            };
            reader.readAsDataURL(file.raw);
        },
        dataURLToBlob(dataURL) {
            const parts = dataURL.split(';base64,');
            const contentType = parts[0].split(':')[1];
            const byteString = atob(parts[1]);
            const arrayBuffer = new ArrayBuffer(byteString.length);
            const uint8Array = new Uint8Array(arrayBuffer);
            for (let i = 0; i < byteString.length; i++) {
                uint8Array[i] = byteString.charCodeAt(i);
            }
            return new Blob([arrayBuffer], { type: contentType });
        },
    },
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