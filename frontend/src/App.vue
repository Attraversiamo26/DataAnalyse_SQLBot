<script setup lang="ts">
import { computed } from 'vue'
import { ElConfigProvider } from 'element-plus-secondary'
import { getElementLocale } from '@/i18n'
const elLanguage = computed(() => {
  return getElementLocale()
})
</script>

<template>
  <el-config-provider :locale="elLanguage">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </el-config-provider>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

<style scoped></style>
