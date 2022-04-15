<template>
  <div class="dashboard-container">
    <el-row :gutter="10">
      <el-col :span="6">
        <el-card>
          <Detail title="总销售额" count="1233">
            <template slot="charts">
              <div>2333333</div>
            </template>
          </Detail>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <Detail title="访问量" count="1233">
            <template slot="charts">
              <lineCharts></lineCharts>
            </template>
          </Detail> </el-card
      ></el-col>
      <el-col :span="6">
        <el-card> <Detail title="支付笔数" count="1233"></Detail> </el-card
      ></el-col>
      <el-col :span="6">
        <el-card> <Detail title="运营活动效果" count="1233"></Detail> </el-card
      ></el-col>
    </el-row>
    <Card></Card>
  </div>
</template>

<script>
import Card from "./Card";
import Detail from "./Detail";
import lineCharts from "./lineChart";
import { mapGetters } from "vuex";
export default {
  name: "Dashboard",
  components: { Card, Detail, lineCharts },
  computed: {
    ...mapGetters(["name"]),
  },
};
</script>

<style lang="scss" scoped>
.dashboard {
  &-container {
    margin: 30px;
  }
  &-text {
    font-size: 30px;
    line-height: 46px;
  }
}
</style>