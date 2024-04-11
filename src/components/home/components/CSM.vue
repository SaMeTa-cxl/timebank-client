<template>
  <div name = "main">
    <SearchLine 
      @searchUser="handleSearchUser($event)"
      @searching="loading = true"
      role="CS"></SearchLine>
    <el-table
      ref="table"
      :data="userArray"
      highlight-current-row
      @current-change="handleCurrentChange"
      style="width: 100%; box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1); border-radius: 10px"
      max-height="500px"
      v-loading="loading">
      <el-table-column
        v-if="multiSelectMode"
        fixed
        width="auto"
        type="selection"
        align="center">
      </el-table-column>
      <el-table-column
        fixed
        property="id"
        label="用户编号"
        width="120"
        align="center">
      </el-table-column>
      <el-table-column
        property="name"
        label="用户名"
        width="120"
        align="center">
      </el-table-column>
      <el-table-column
        property="phone"
        label="电话号码"
        width="150"
        align="center">
      </el-table-column>
      <el-table-column
        label="最后登录时间"
        width="200"
        align="center">
        <template slot-scope="scope">
        <i class="el-icon-time"></i>
        <span style="margin-left: 10px">{{ calculateDate(scope.row.login) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="注册时间"
        width="200"
        align="center">
        <template slot-scope="scope">
        <i class="el-icon-time"></i>
        <span style="margin-left: 10px">{{ calculateDate(scope.row.register) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="用户状态"
        width="150"
        align="center">
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.userStatus"
            active-color="#13ce66"
            inactive-color="#ff4949"
            @change="onChange($event, scope.$index)">
          </el-switch>
        </template>
      </el-table-column>
      <el-table-column
        label="用户头像"
        width="150"
        align="center">
        <template slot-scope="scope">
          <el-avatar :size="50" :src="scope.row.img"></el-avatar>
        </template>
      </el-table-column>
      <el-table-column 
        fixed="right"
        label="操作"
        width="300px"
        align="center">
        <template slot-scope="scope">
          <el-button 
            size="mini"
            @click="onMore(scope.$index, scope.row)">更多</el-button>
          <el-button
            size="mini"
            @click="onResetPswd(scope.row.id)">重置密码</el-button>
          <el-button
            size="mini"
            type="danger"
            @click="onDelete(userArray[scope.$index].id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div style="margin-top: 20px">
      <el-button type="primary" @click="onMultiSelect" round>多选</el-button>
      <el-button type="primary" @click="onAdd" round>增添</el-button>
      <el-button type="danger" round v-if="multiSelectMode" @click="onMultiDelete">删除</el-button>
    </div>
    <CsFormDialog v-if="isEditDialogVisble" :details="details" @closeDialog="isEditDialogVisble = false" @updateData="onUpdateData($event)"></CsFormDialog>
    <cs-add-form-dialog v-if="isAddDialogVisible" @closeDialog="isAddDialogVisible = false"></cs-add-form-dialog>
  </div>
</template>
<script>
import axios from 'axios';
import operation from './Operation.vue';
import SearchLine from './SearchLine.vue';
import CsFormDialog from './CsFormDialog.vue';
import CsAddFormDialog from './CsAddFormDialog.vue';
export default {
  components: {
    operation,
    SearchLine,
    CsFormDialog,
    CsAddFormDialog
  },
  name: 'CSM',
  data() {
      return {
        userArray: [],
        details: {
          userStatus: true,
          id: null,
          login: null,
          name: null,
          phone: null,
          register: null,
          processNum: null,
        },
        currentRow: null,
        multiSelectMode: false,
        isEditDialogVisble: false,
        isAddDialogVisible: false,
        selectedIndex: 0,
        loading: true,
      }
    },

    methods: {
      handleSearchUser(userArray) {
        this.userArray = userArray;
        this.loading = false;
      },
      handleCurrentChange(val) {
        this.currentRow = val;
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
      onChange(e, index) {
        axios({
          method: 'post',
          url: 'http://172.26.58.27:8081/demo/common/statusSet',
          data: JSON.stringify({
            role: 'CS',
            status: e,
            token: localStorage.getItem('token'),
            id: this.userArray[index].id,
          })
        }).then(response => {
            if(response.data['status'])
              this.$message({
                message: '状态修改成功',
                type: 'success'
              });
            else {
              this.$message.error('状态修改失败：'+response.data['msg']);
              this.userArray[index].userStatus = !this.userArray[index].userStatus;
            }
        }).catch(err => {
          console.log(err);
          this.$router.push('/');
          localStorage.removeItem('token');
        })
      },
      onAdd() {
        this.isAddDialogVisible = true;
      },
      onResetPswd(id) {
        axios({
          method: 'post',
          url: 'http://172.26.58.27:8081/demo/common/passwordReset',
          data: JSON.stringify({
            role: 'CS',
            id: id,
            token: localStorage.getItem('token'),
          })
        }).then(response => {
          if(response.data['status'])
            this.$message({
              message: '密码重置成功',
              type: 'success'
            });
          else
            this.$message.error('密码重置失败：'+response.data['msg']);
        }).catch(err => {
          console.log(err);
          this.$router.push('/');
          localStorage.removeItem('token');
        })
      },
      onMultiSelect(e) {
        if(this.multiSelectMode)
          e.target.textContent = '多选'
        else
          e.target.textContent = '取消多选'
        this.multiSelectMode = !this.multiSelectMode;
      },
      onDelete(id) {
        let deleteData = {
            role: 'CS',
            idArray: [id],
            token: localStorage.getItem('token')
        }
        this.$confirm('确定要删除该用户吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          axios({
            method: 'post',
            url: 'http://172.26.58.27:8081/demo/common/delete',
            data: JSON.stringify(deleteData)
          }).then(response => {
            if(response.data['status']) {
              this.$message({
                message: '删除成功',
                type: 'success'
              });
              this.userArray = this.userArray.filter(el => el.id != id);
            }
            else
              this.$message.error('删除失败：'+response.data['msg']);
          }).catch(err => {
            console.log(err);
            this.$router.push('/');
            localStorage.removeItem('token');
          })
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });          
        });
      },
      onMultiDelete() {
        let deleteData = {
            role: 'CS',
            idArray: this.$refs.table.selection.map(el => el.id),
            token: localStorage.getItem('token')
        }
        this.$confirm('确定要删除指定用户吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          axios({
            method: 'post',
            url: 'http://172.26.58.27:8081/demo/common/delete',
            data: JSON.stringify(deleteData)
          }).then(response => {
              if(response.data['status']) {
                this.$message({
                      message: '删除成功',
                      type: 'success'
                  });
                this.userArray = this.userArray.filter(el => !this.$refs.table.selection.includes(el));
              }
              else
                this.$message.error('删除失败：'+response.data['msg']);
          }).catch(err => {
            console.log(err);
            this.$router.push('/');
            localStorage.removeItem('token');
          })
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });          
        });
      },
      //获得选中用户的更多信息
      onMore(index, row) {
        this.selectedIndex = index;
        let requestData = {
          id: row.id,
          token: localStorage.getItem('token')
        };
        axios({
          method: 'post',
          url: 'http://172.26.58.27:8081/demo/CSM/selectById',
          data: JSON.stringify(requestData)
        }).then(response => {
            if(response.data['status']) {
              this.details.processNum = response.data['processNum'];
              this.details.id = row.id;
              this.details.name = row.name;
              this.details.img = row.img;
              this.details.phone = row.phone;
              this.details.login = row.login;
              this.details.register = row.register;
              this.details.userStatus = row.userStatus;
              this.isEditDialogVisble = true;
            }
            else
              this.$message.error('访问失败：'+response.data['msg']);
        }).catch(err => {
            console.log(err);
            this.$router.push('/');
            localStorage.removeItem('token');
        })
      },
      onCloseDialog() {
        this.isEditDialogVisble = false;
      },
      onUpdateData(updatedUser) {
        for (const key in updatedUser) {
          if(Object.prototype.hasOwnProperty.call(this.userArray[this.selectedIndex], key))
            this.userArray[this.selectedIndex][key] = updatedUser[key];
        }
        console.log(this.userArray[this.selectedIndex]); 
      }
    },
    created() {
      let searchForm = {
        id : null,
        name : '',
        phone : null,
        registerBegin : null,
        registerEnd : null,
        loginBegin : null,
        loginEnd : null,
        userStatus : null,
        token : localStorage.getItem('token'),
        role : 'CS'
      }
      axios({
        method: 'post',
        url: 'http://172.26.58.27:8081/demo/common/select',
        data: JSON.stringify(searchForm)
      }).then( (response) => {
        this.userArray = response.data['userArray'];
        this.loading = false;
      }).catch((err) => {
        console.log(err);
        this.$router.push('/');
        localStorage.removeItem('token');
      })
    },
}
</script>
<style scoped>
</style>