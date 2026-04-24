<script setup lang="ts">
// 报告查看工具组件
</script>

<template>
  <div class="report-tool">
    <div class="report-container">
      <h3>报告查看</h3>
      <p>这里将展示生成的分析报告</p>
      <!-- 后续可以添加报告列表和查看功能 -->
    </div>
  </div>
</template>

<style scoped>
.report-tool {
  width: 100%;
  height: 100%;
}

.report-container {
  background-color: #fff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.report-container h3 {
  margin-top: 0;
  color: #1f2937;
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
}

.report-container p {
  color: #6b7280;
  font-size: 14px;
}
</style>
