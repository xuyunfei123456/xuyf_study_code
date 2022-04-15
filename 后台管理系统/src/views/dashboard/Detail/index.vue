<template>
  <div>
    <div class="card-header">
      <span>{{ title }}</span>
      <div class="el-icon-warning-outline"></div>
    </div>
    <div class="card-content">{{ count }}</div>
    <div class="card-charts"><slot name="charts"></slot></div>
    <div class="card-footer"><slot name="footer"></slot></div>
  </div>
</template>

<script>
export default {
  props: ["title", "count"],
};
</script>

<style scoped>
.card-charts {
  width: 100%;
  height: 200px;
}
</style>