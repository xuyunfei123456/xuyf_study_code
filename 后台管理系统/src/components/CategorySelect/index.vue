<template>
  <div>
    <!-- inline代表的是行内表单，代表一行可以放置多个表单元素 -->
    <el-form :inline="true" class="demo-form-inline" :model="cForm">
      <el-form-item label="一级分类">
        <el-select
          v-model="cForm.category1Id"
          placeholder="请选择"
          @change="handler1"
        >
          <el-option
            :label="c1.name"
            v-for="(c1, index) in list1"
            :key="c1.id"
            :value="c1.id"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="二级分类">
        <el-select
          v-model="cForm.category2Id"
          placeholder="请选择"
          @change="handler2"
        >
          <el-option
            :label="c2.name"
            v-for="(c2, index) in list2"
            :key="c2.id"
            :value="c2.id"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="三级分类">
        <el-select v-model="cForm.category3Id" placeholder="请选择">
          <el-option
            :label="c3.name"
            v-for="(c3, index) in list3"
            :key="c3.id"
            :value="c3.id"
          ></el-option>
        </el-select>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: "CategorySelect",
  data() {
    return {
      //一级分类的数据
      list1: [],
      //二级分类的数据
      list2: [],
      //三级分类的数据
      list3: [],
      //收集相应的一级二级三级分类的ID
      cForm: {
        category1Id: "",
        category2Id: "",
        category3Id: "",
      },
    };
  },
  //组件挂载完毕，向服务器发请求，获取相应的一级分类的数据
  mounted() {
    //获取一级分类的数据的方法
    this.getCategoryList();
  },
  methods: {
    //获取一级分类的方法
    async getCategoryList() {
      //获取一级分类的请求，不需要携带参数
      let res = await this.$API.attr.reqCategory1List();
      if (res.code == 200) {
        this.list1 = res.data;
      }
    },
    //一级分类的select事件回调（当一级分类的option发生变化的时候获取相应的二级分类的数据）
    async handler1() {
      //解构出一级分类的ID
      const { category1Id } = this.cForm;
      let res = await this.$API.attr.reqCategory2List(category1Id);
      if (res.code == 200) {
        this.list2 = res.data;
      }
    },
    //二级分类的select事件回调（当二级分类的option发生变化的时候获取相应的三级分类的数据）
    async handler2() {
      //解构出二级分类的ID
      const { category2Id } = this.cForm;
      let res = await this.$API.attr.reqCategory3List(category2Id);
      if (res.code == 200) {
        this.list3 = res.data;
      }
    },
  },
};
</script>

<style>
</style>