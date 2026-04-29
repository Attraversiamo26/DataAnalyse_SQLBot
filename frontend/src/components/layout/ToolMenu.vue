<script lang="ts" setup>
import { computed } from 'vue'
import { ElMenu } from 'element-plus-secondary'
import { useRoute } from 'vue-router'
import MenuItem from './MenuItem.vue'

defineProps({
  collapse: Boolean,
})

const route = useRoute()
const activeMenu = computed(() => route.path)

// 工具菜单列表
const toolMenuList = computed(() => [
  {
    path: '/home',
    name: 'home-assistant',
    meta: { title: '智能助手', iconActive: 'icon_ai', iconDeActive: 'noIcon_ai' },
  },
  {
    path: '/tools/tool-select',
    name: 'tool-select',
    meta: { title: '工具选择', iconActive: 'set', iconDeActive: 'noSet' },
    children: [
      {
        path: '/tools/chat',
        name: 'chat',
        meta: { title: '智能问数', iconActive: 'chat', iconDeActive: 'noChat' },
      },
      {
        path: '/tools/analysis',
        name: 'analysis',
        meta: { title: '数据分析', iconActive: 'dashboard', iconDeActive: 'noDashboard' },
      },
      {
        path: '/tools/report',
        name: 'report',
        meta: { title: '报告生成', iconActive: 'dashboard', iconDeActive: 'noDashboard' },
      },
    ],
  },
  {
    path: '/tools/datasource',
    name: 'datasource',
    meta: { title: '数据源管理', iconActive: 'ds', iconDeActive: 'noDs' },
  },
  {
    path: '/chat/history',
    name: 'chat-history',
    meta: { title: '会话管理', iconActive: 'chat', iconDeActive: 'noChat' },
  },
  {
    path: '/tools/terminology',
    name: 'terminology',
    meta: { title: '术语配置', iconActive: 'set', iconDeActive: 'noSet' },
  },
  {
    path: '/tools/system',
    name: 'system',
    meta: { title: '系统管理', iconActive: 'set', iconDeActive: 'noSet' },
    children: [
      {
        path: '/tools/system/user',
        name: 'system-user',
        meta: { title: '用户管理', iconActive: 'user', iconDeActive: 'noUser' },
      },
      {
        path: '/tools/system/workspace',
        name: 'system-workspace',
        meta: { title: '工作空间', iconActive: 'workspace', iconDeActive: 'noWorkspace' },
      },
      {
        path: '/tools/system/model',
        name: 'system-model',
        meta: { title: 'AI模型配置', iconActive: 'model', iconDeActive: 'noModel' },
      },
      {
        path: '/tools/system/setting',
        name: 'system-setting',
        meta: { title: '系统设置', iconActive: 'set', iconDeActive: 'noSet' },
        children: [
          {
            path: '/tools/system/setting/appearance',
            name: 'system-appearance',
            meta: { title: '外观设置' },
          },
          {
            path: '/tools/system/setting/parameter',
            name: 'system-parameter',
            meta: { title: '参数配置' },
          },
          {
            path: '/tools/system/setting/variables',
            name: 'system-variables',
            meta: { title: '系统变量' },
          },
          {
            path: '/tools/system/setting/authentication',
            name: 'system-authentication',
            meta: { title: '认证设置' },
          },
          {
            path: '/tools/system/setting/platform',
            name: 'system-platform',
            meta: { title: '平台设置' },
          },
        ],
      },
      {
        path: '/tools/system/audit',
        name: 'system-audit',
        meta: { title: '审计日志', iconActive: 'log', iconDeActive: 'noLog' },
      },
    ],
  },
])
</script>

<template>
  <el-menu :default-active="activeMenu" class="el-menu-demo ed-menu-vertical" :collapse="collapse">
    <MenuItem v-for="menu in toolMenuList" :key="menu.path" :menu="menu"></MenuItem>
  </el-menu>
</template>

<style lang="less" scoped>
.ed-menu-vertical {
  --ed-menu-item-height: 44px;
  --ed-menu-bg-color: transparent;
  --ed-menu-base-level-padding: 8px;
  border-right: none;

  /* 一级菜单项样式 */
  .ed-sub-menu__title,
  .ed-menu-item {
    height: 44px !important;
    border-radius: 8px !important;
    margin-bottom: 8px !important;
    background-color: transparent !important;
    border: none !important;
    color: #000000 !important;
    font-weight: 600 !important;
    font-size: 15px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: flex-start !important;
    text-align: left !important;
    padding: 0 12px !important;

    &:hover {
      background-color: #f8f8f8 !important;
    }

    &.is-active {
      background-color: #e6f7ee !important;
      color: #006633 !important;
      font-weight: 700 !important;
    }
  }
  
  /* 智能助手菜单项样式 */
  .ed-menu-item:nth-child(1) {
    font-size: 16px !important;
    font-weight: 700 !important;
    justify-content: center !important;
  }

  /* 子菜单项样式 */
  .ed-sub-menu .ed-menu .ed-menu-item {
    height: 44px !important;
    border-radius: 8px !important;
    margin-bottom: 8px !important;
    background-color: transparent !important;
    border: none !important;
    color: #444444 !important;
    font-weight: 400 !important;
    font-size: 14px !important;
    padding: 0 12px 0 36px !important;

    &:hover {
      background-color: #f8f8f8 !important;
    }

    &.is-active {
      background-color: #e6f7ee !important;
      color: #006633 !important;
      font-weight: 600 !important;
    }
  }

  /* 三级菜单项 - 通过深度选择器 */
  .ed-sub-menu {
    .ed-sub-menu {
      .ed-menu-item {
        height: 44px !important;
        padding: 0 12px 0 56px !important;
        color: #666666 !important;
        font-size: 13px !important;
        margin-bottom: 8px !important;

        &.is-active {
          background-color: #e6f7ee !important;
          color: #006633 !important;
          font-weight: 500 !important;
        }
      }
    }
  }

  /* 图标样式 */
  .ed-icon {
    margin-right: 10px;
    color: #333333 !important;
    font-size: 18px !important;
  }

  /* 子菜单图标样式 */
  .ed-sub-menu .ed-menu .ed-icon {
    color: #666666 !important;
    font-size: 16px !important;
    margin-right: 8px;
  }

  /* 子菜单容器 */
  .ed-sub-menu .ed-menu {
    padding: 4px 0 8px 0;
  }
}
.ed-popper.is-light:has(.ed-menu--popup) {
  border: 1px solid #dee0e3;
  border-radius: 6px;
  box-shadow: 0px 4px 8px 0px #1f23291a;
  background: #ffffff;
  overflow: hidden;
}
.ed-menu--popup {
  padding: 4px;
  background: #ffffff;

  .ed-menu-item {
    padding: 9px 16px;
    height: 40px !important;
    border-radius: 6px;
    background-color: transparent !important;
    border: none !important;

    &:hover {
      background-color: #f5f5f5 !important;
    }

    &.is-active {
      background-color: #e6f7ee !important;
      color: #006633 !important;
      font-weight: 500;
    }
  }
}
.ed-sub-menu {
  .subTitleMenu {
    display: none;
  }
}

.ed-menu--popup-container .subTitleMenu {
  color: #646a73 !important;
  pointer-events: none;
}
</style>
