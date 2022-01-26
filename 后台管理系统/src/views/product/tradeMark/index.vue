<template>
  <div>
    <el-button
      type="primary"
      icon="el-icon-plus"
      style="margin: 10px 0px"
      @click="showDialog"
      >添加</el-button
    >
    <el-table border :data="list" style="width: 100%">
      <el-table-column type="idnex" label="序号" width="80" align="center">
      </el-table-column>
      <el-table-column prop="tmName" label="品牌名称" width="180">
      </el-table-column>
      <el-table-column prop="address" label="品牌LOGO">
        <template slot-scope="{ row, $index }">
          <img :src="row.logoUrl" alt="" style="width: 100px; height: 100px" />
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="{ row, $index }">
          <el-button
            type="warning"
            icon="el-icon-edit"
            size="mini"
            @click="updateTradeMark(row)"
            >修改</el-button
          >
          <el-button
            type="danger"
            icon="el-icon-delete"
            size="mini"
            @click="deleteTradeMark(row)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      @current-change="getPageList"
      @size-change="handleSizeChange"
      style="margin-top: 20px; text-align: center"
      :current-page="page"
      :page-size="limit"
      :page-sizes="[3, 5]"
      layout="prev, pager, next,jumper,->,sizes,total"
      :total="total"
    >
    </el-pagination>
    <!-- 对话框 -->
    <el-dialog
      :title="tmForm.id ? '修改品牌' : '添加品牌'"
      :visible.sync="dialogFormVisible"
    >
      <el-form style="width: 80%" :model="tmForm" :rules="rules" ref="ruleForm">
        <el-form-item label="品牌名称" label-width="100px" prop="tmName">
          <el-input autocomplete="off" v-model="tmForm.tmName"></el-input>
        </el-form-item>
        <el-form-item label="品牌LOGO" label-width="100px" prop="logoUrl">
          <!-- on-success 可以检测到图片上传成功，当图片上传成功，会执行一次
          before-upload  可以在上传图片之前 执行一次
           -->
          <el-upload
            class="avatar-uploader"
            action="/dev-api/admin/product/fileUpload"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
          >
            <img v-if="tmForm.logoUrl" :src="tmForm.logoUrl" class="avatar" />
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
            <div slot="tip" class="el-upload__tip">
              只能上传jpg/png文件，且不超过500kb
            </div>
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="addOrUpdateTradeMark"
          >确 定</el-button
        >
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "TradeMark",
  data() {
    //自定义校验规则
    var validateTmname = (rule, value, callback) => {
      if (value.length < 2 || value.length > 10) {
        callback(new Error("品牌名称2-10位"));
      } else {
        callback();
      }
    };
    return {
      dialogFormVisible: false,
      list: [],
      //总共数据条数
      total: 0,
      //分页器第几页
      page: 1,
      //当前页数展示数据条数
      limit: 3,
      //上传图片使用的属性
      imageUrl: "",
      //收集品牌的信息
      tmForm: {
        logoUrl: "",
        tmName: "",
      },
      //表单验证规则
      rules: {
        tmName: [
          { required: true, message: "请输入品牌名称", trigger: "blur" },
          {
            min: 2,
            max: 10,
            message: "长度在 2 到 10 个字符",
            trigger: "change",
          },
          { validator: validateTmname, trigger: "change" },
        ],
        logoUrl: [{ required: true, message: "请选择品牌图片" }],
      },
    };
  },
  mounted() {
    this.getPageList();
  },
  methods: {
    //获取品牌列表数据
    async getPageList(pager = 1) {
      const { limit } = this;
      this.page = pager;
      let res = await this.$API.trademark.reqTradeMarkList(this.page, limit);
      console.log(res, "res");
      if (res.code == 200) {
        this.total = res.data.total;
        this.list = res.data.records;
      }
    },
    handleCurrentChange(pager) {
      this.page = pager;
      this.getPageList();
    },
    handleSizeChange(limit) {
      this.limit = limit;
      this.getPageList();
    },
    //点击添加品牌的按钮
    showDialog() {
      //显示对话框
      this.dialogFormVisible = true;
      //清除数据
      this.tmForm = { logoUrl: "", tmName: "" };
    },
    //修改某一个品牌
    updateTradeMark(row) {
      this.dialogFormVisible = true;
      //将已有的品牌信息赋值给tmForm进行展示
      this.tmForm = { ...row };
    },
    //删除某一个品牌
    deleteTradeMark(row) {
      this.$confirm(`你确定删除${row.tmName}吗？`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(async () => {
          //当用户点击确定按钮的时候会触发
          //向服务器发请求
          let res = await this.$API.trademark.reqDeleteTradeMark(row.id);
          if (res.code == 200) {
            this.$message({
              type: "success",
              message: "删除成功!",
            });
            this.getPageList();
          }
        })
        .catch(() => {
          //当用户点击取消按钮的时候会触发
          this.$message({
            type: "info",
            message: "已取消删除",
          });
        });
    },
    //上传图片相关的回调
    handleAvatarSuccess(res, file) {
      //res上传成功之后返回前端数据
      //file上传成功之后服务器返回前端数据
      console.log(res);
      this.tmForm.logoUrl = res.data;
    },
    //图片上传之前
    beforeAvatarUpload(file) {
      const isJPG = file.type === "image/jpeg";
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isJPG) {
        this.$message.error("上传头像图片只能是 JPG 格式!");
      }
      if (!isLt2M) {
        this.$message.error("上传头像图片大小不能超过 2MB!");
      }
      return isJPG && isLt2M;
    },
    //添加按钮(添加品牌或者修改品牌)
    addOrUpdateTradeMark() {
      //当全部字段验证通过，再去执行业务逻辑
      this.$res.ruleForm.validate(async (success) => {
        if (success) {
          this.dialogFormVisible = false;
          //发请求（添加品牌|修改品牌）
          let res = await this.$API.trademark.reqAddOrUpdateTradeMark(
            this.tmForm
          );
          if (res.code == 200) {
            //弹出信息
            this.$message(this.tmForm.id ? "修改品牌成功" : "添加品牌成功");
            this.page = this.tmForm.id ? this.page : 1;
            //再次获取品牌列表数据
            this.getPageList(this.list.length > 1 ? this.page : this.page - 1);
          }
        } else {
          return false;
        }
      });
    },
  },
};
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
  border-color: #409eff;
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