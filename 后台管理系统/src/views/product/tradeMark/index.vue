<template>
  <div>
    <el-button type="primary" icon="el-icon-plus" style="margin: 10px 0px"
      >添加</el-button
    >
    <el-table border :data="list" style="width: 100%">
      <el-table-column type="idnex" label="序号" width="80" align="center">
      </el-table-column>
      <el-table-column prop="tmName" label="品牌名称" width="180">
      </el-table-column>
      <el-table-column prop="address" label="品牌LOGO">
        <template slot-scope="{ row, $index }">{{ row }}{{ $index }}</template>
      </el-table-column>
      <el-table-column label="操作"> </el-table-column>
    </el-table>
    <el-pagination
      style="margin-top: 20px; text-align: center"
      :current-page="6"
      :page-size="3"
      :page-sizes="[3, 5]"
      layout="prev, pager, next,jumper,->,sizes,total"
      :total="50"
    >
    </el-pagination>
  </div>
</template>

<script>
export default {
  name: "TradeMark",
  data() {
    return {
      list: [],
      //总共数据条数
      total: 0,
      //分页器第几页
      page: 1,
      //当前页数展示数据条数
      limit: 3,
    };
  },
  mounted() {
    this.getPageList();
  },
  methods: {
    //获取品牌列表数据
    async getPageList() {
      const { page, limit } = this;
      let res = await this.$API.trademark.reqTradeMarkList(page, limit);
      console.log(res, "res");
      if (res.code == 200) {
        this.total = res.data.total;
        this.list = res.data.records;
      }
    },
  },
};
</script>

<style>
</style>