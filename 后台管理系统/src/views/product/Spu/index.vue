<template>
  <div>
    <el-card style="margin: 20px 0px">
      <CategorySelect @getCategoryId="getCategoryId" :show="scene != 0" />
    </el-card>
    <el-card>
      <!-- 底部这里将来是有三部分进行切换的 -->
      <div v-show="scene == 0">
        <el-button
          type="primary"
          icon="el-icon-plus"
          :disabled="!category3Id"
          @click="addSpu"
          >添加SPU</el-button
        >
        <el-table style="width: 100%" border :data="records">
          <el-table-column
            align="center"
            type="index"
            label="序号"
            width="80"
          ></el-table-column>
          <el-table-column
            align="center"
            label="SPU名称"
            width="width"
            prop="spuName"
          ></el-table-column>
          <el-table-column
            align="center"
            label="SPU描述"
            width="width"
            prop="description"
          >
          </el-table-column>
          <el-table-column align="center" label="操作" width="width">
            <template slot-scope="{ row, $index }">
              <hint-button
                type="success"
                icon="el-icon-plus"
                size="mini"
                title="添加sku"
                @click="addSku(row)"
              ></hint-button>
              <hint-button
                type="warning"
                icon="el-icon-edit"
                size="mini"
                title="修改spu"
                @click="updateSpu(row)"
              ></hint-button>
              <hint-button
                type="info"
                icon="el-icon-info"
                size="mini"
                title="查看当前spu全部sku列表"
                @click="handler(row)"
              ></hint-button>
              <el-popconfirm
                title="这是一段内容确定删除吗？"
                @onConfirm="deleteSpu(row)"
              >
                <el-button slot="reference">删除</el-button>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          style="text-align: center"
          :current-page="page"
          :page-sizes="[1, 2, 3]"
          :page-size="limit"
          layout="prev, pager, next,->,sizes,total"
          :total="total"
          @current-change="getSpuList"
          @size-change="handleSizeChange"
        >
        </el-pagination>
      </div>
      <SpuForm
        v-show="scene == 1"
        @changeScene="changeScene"
        ref="spu"
      ></SpuForm>
      <SkuForm
        v-show="scene == 2"
        ref="sku"
        @changeScenes="changeScenes"
      ></SkuForm>
    </el-card>
    <el-dialog
      :title="`${spu.spuName}的SKU的列表`"
      :visible.sync="dialogTableVisible"
      :before-close="close"
    >
      <el-table :data="skuList" border v-loading="loading">
        <el-table-column
          prop="skuName"
          label="名称"
          width="width"
        ></el-table-column>
        <el-table-column
          prop="price"
          label="价格"
          width="width"
        ></el-table-column>
        <el-table-column
          prop="weight"
          label="重量"
          width="width"
        ></el-table-column>
        <el-table-column label="默认图片" width="width">
          <template slot-scope="{ row, $index }">
            <img
              :src="row.skuDefaultImg"
              alt=""
              style="width: 100px; height: 100px"
            />
          </template>
        </el-table-column>
        <el-table-column property="address" label="地址"></el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
import SpuForm from "./SpuForm";
import SkuForm from "./SkuForm";
export default {
  name: "Spu",
  components: { SpuForm, SkuForm },
  data() {
    return {
      category1Id: "",
      category2Id: "",
      category3Id: "",
      //控制三级联动的可操作性
      show: true,
      page: 1, //分页器当前第几页
      limit: 3, //每一页展示多少条数据
      records: [], //spu列表的数据
      total: 0, //分页器展示数据的条数
      scene: 0, //0代表展示SPU列表的数据   1 添加SPU|修改SPU   2 添加SKU
      dialogTableVisible: false, //控制对话框的显示与隐藏
      spu: {},
      skuList: [], //存储的是SKU列表的数据
      loading: true,
    };
  },
  methods: {
    //三级联动的自定义事件，可以把子组件相应的ID传递给我们的父组件
    getCategoryId({ categoryId, level }) {
      //categoryId：获取到一二三级分类的id  level：为了区分是几级id
      if (level == 1) {
        this.category1Id = categoryId;
        this.category2Id = "";
        this.category3Id = "";
      } else if (level == 2) {
        this.category2Id = categoryId;
        this.category3Id = "";
      } else {
        //代表三级分类的ID有了
        this.category3Id = categoryId;
        //获取spu列表数据进行展示
        this.getSpuList();
      }
    },
    //获取SPU列表数据的方法
    async getSpuList(pages = 1) {
      this.page = pages;
      const { page, limit, category3Id } = this;
      //携带三个参数：page:第几页  limit:每一页需要展示多少条数据  三级分类的id
      let res = await this.$API.spu.reqSpuList(page, limit, category3Id);
      if (res.code == 200) {
        this.total = res.data.total;
        this.records = res.data.records;
      }
      console.log(res);
    },
    //当分页器的某一个展示数据条数发生变化的回调
    handleSizeChange(limit) {
      this.limit = limit;
      this.getSpuList();
    },
    //添加spu按钮的回调
    addSpu() {
      this.scene = 1;
      //通知子组件spuForm发请求---2个
      this.$refs.spu.addSpuData(this.category3Id);
    },
    //修改某一个spu
    updateSpu(row) {
      this.scene = 1;
      //获取子组件spu
      //在父组件当中可以通过$refs获取子组件
      this.$refs.spu.initSpuData(row);
    },
    //自定义事件回调
    changeScene({ scene, flag }) {
      this.scene = scene;
      this.getSpuList(this.page);
      if (flag == "修改") {
        this.getSpuList(this.page);
      } else {
        this.getSpuList();
      }
    },
    //删除spu按钮的回调
    async deleteSpu(row) {
      let res = this.$API.spu.reqDeleteSpu(row.id);
      if (res.code == 200) {
        this.$message({ type: "success", message: "删除成功" });
        this.getSpuList(this.records.length > 1 ? this.page : this.page - 1);
      }
    },
    //添加SKU
    addSku(row) {
      this.scene = 2;
      //父组件调用子组件的方法，让子组件发请求
      this.$refs.sku.getData(this.category1Id, this.category2Id, row);
    },
    changeScenes(scene) {
      this.scene = scene;
    },
    //查看sku按钮的回调
    async handler(spu) {
      //点击按钮的时候，对话框是可见的
      this.dialogTableVisible = true;
      //保存spu的信息
      this.spu = spu;
      //获取sku列表的数据进行展示
      let res = await this.$API.spu.reqSkuList(spu.id);
      if (res.code == 200) {
        this.skuList = res.data;
        //loading隐藏
        this.loading = false;
      }
    },
    //关闭对话框的回调
    close() {
      //loading再次变为真
      this.loading = true;
      //清除sku列表的数据
      this.skuList = [];
      this.dialogTableVisible = false;
    },
  },
};
</script>

<style>
</style>