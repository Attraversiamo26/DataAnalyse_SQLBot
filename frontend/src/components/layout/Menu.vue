<script lang="ts" setup>
import { computed } from 'vue'
import { ElMenu } from 'element-plus-secondary'
import { useRoute, useRouter } from 'vue-router'
import MenuItem from './MenuItem.vue'
import { useUserStore } from '@/stores/user'
// import { routes } from '@/router'
const userStore = useUserStore()
const router = useRouter()
defineProps({
  collapse: Boolean,
})

const route = useRoute()
// const menuList = computed(() => route.matched[0]?.children || [])
const activeMenu = computed(() => route.path)
/* const activeIndex = computed(() => {
  const arr = route.path.split('/')
  return arr[arr.length - 1]
}) */
const showSysmenu = computed(() => {
  return route.path.includes('/system')
})

const formatRoute = (arr: any, parentPath = '') => {
  return arr.map((element: any) => {
    let children: any = []
    const path = `${parentPath ? parentPath + '/' : ''}${element.path}`
    if (element.children?.length) {
      children = formatRoute(element.children, path)
    }
    return {
      ...element,
      path,
      children,
    }
  })
}

const routerList = computed(() => {
  if (showSysmenu.value) {
    const [sysRouter] = formatRoute(
      router.getRoutes().filter((route: any) => route?.name === 'system')
    )
    return sysRouter.children
  }
  const list = router.getRoutes().filter((route) => {
    return (
      !route.path.includes('embeddedPage') &&
      !route.path.includes('assistant') &&
      !route.path.includes('embeddedPage') &&
      !route.path.includes('canvas') &&
      !route.path.includes('member') &&
      !route.path.includes('professional') &&
      !route.path.includes('401') &&
      !route.path.includes('training') &&
      !route.path.includes('prompt') &&
      !route.path.includes('permission') &&
      !route.path.includes('embeddedCommon') &&
      !route.path.includes('preview') &&
      !route.path.includes('audit') &&
      route.path !== '/login' &&
      route.path !== '/admin-login' &&
      route.path !== '/chatPreview' &&
      !route.path.includes('/system') &&
      ((route.path.includes('set') && userStore.isSpaceAdmin) || !route.redirect) &&
      route.path !== '/:pathMatch(.*)*' &&
      !route.path.includes('dsTable')
    )
  })

  return list
})
</script>

<template>
  <el-menu :default-active="activeMenu" class="el-menu-demo ed-menu-vertical" :collapse="collapse">
    <MenuItem v-for="menu in routerList" :key="menu.path" :menu="menu"></MenuItem>
  </el-menu>
</template>

<style lang="less">
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

  /* 二级菜单项样式 */
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

  /* 三级菜单项样式 */
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
      background-color: #f8f8f8 !important;
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
