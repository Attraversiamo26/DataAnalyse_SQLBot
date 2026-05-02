<script setup lang="ts">
import Chat from '@/views/chat/index.vue'
</script>

<template>
  <div class="chat-tool-wrapper">
    <Chat />
  </div>
</template>

<style scoped>
.chat-tool-wrapper {
  width: 100%;
  height: 100%;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
}
</style>
