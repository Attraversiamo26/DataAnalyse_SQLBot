<script setup lang="ts">
import Dashboard from '@/views/dashboard/index.vue'
</script>

<template>
  <div class="dashboard-tool-wrapper">
    <Dashboard />
  </div>
</template>

<style lang="less" scoped>
.dashboard-tool-wrapper {
  width: 100%;
  height: 100%;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
}
</style>
