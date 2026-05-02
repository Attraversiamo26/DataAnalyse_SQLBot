<script lang="ts" setup>
import { ref, computed } from 'vue'
import Menu from './ToolMenu.vue'
import Person from './Person.vue'
import icon_side_fold_outlined from '@/assets/svg/icon_side-fold_outlined.svg'
import icon_side_expand_outlined from '@/assets/svg/icon_side-expand_outlined.svg'
import { useRouter } from 'vue-router'
import { isMobile } from '@/utils/utils'
import { onBeforeMount } from 'vue'

const isPhone = computed(() => {
  return isMobile()
})
const router = useRouter()
const collapse = ref(false)
const collapseCopy = ref(false)

const handleCollapseChange = (val: any = true) => {
  collapseCopy.value = val
  setTimeout(() => {
    collapse.value = val
  }, 100)
}

const handleFoldExpand = () => {
  handleCollapseChange(!collapse.value)
}

onBeforeMount(() => {
  if (isPhone.value) {
    collapse.value = true
    collapseCopy.value = true
  }
})
</script>

<template>
  <div class="tool-dispatch-layout">
    <!-- 顶部导航 -->
    <div class="top-nav">
      <div class="nav-left">
        <img
          src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=China%20Post%20logo%20with%20green%20logo%20and%20black%20text%20on%20white%20background%20CHINA%20POST&image_size=square"
          height="32"
          width="32"
          alt="中国邮政"
          style="cursor: pointer; margin-right: 12px"
          @click="router.push('/')"
        />
        <h1 class="nav-title">邮政数据分析智能体</h1>
      </div>
      <div class="nav-right">
        <Person :collapse="false" :in-sysmenu="false" />
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 左侧工具列表 -->
      <div class="left-side" :class="collapse && 'left-side-collapse'">
        <Menu :collapse="collapseCopy" />
        <div class="bottom">
          <div class="fold-btn" @click="handleFoldExpand">
            <el-icon size="20">
              <icon_side_expand_outlined v-if="collapse"></icon_side_expand_outlined>
              <icon_side_fold_outlined v-else></icon_side_fold_outlined>
            </el-icon>
          </div>
        </div>
      </div>

      <!-- 右侧执行面板 -->
      <div class="right-main" :class="collapse && 'right-side-collapse'">
        <div class="content">
          <router-view />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.tool-dispatch-layout {
  width: 100vw;
  height: 100vh;
  background-color: #f0f7f0;
  display: flex;
  flex-direction: column;

  .top-nav {
    height: 70px;
    background-color: #ffffff;
    border-bottom: 2px solid #006633;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 40px;
    box-shadow: 0 2px 8px rgba(0, 102, 51, 0.15);

    .nav-left {
      display: flex;
      align-items: center;

      .nav-title {
        font-size: 24px;
        font-weight: 600;
        color: #006633;
        margin: 0;
      }
    }

    .nav-right {
      display: flex;
      align-items: center;
    }
  }

  .main-content {
    flex: 1;
    display: flex;
    overflow: hidden;

    .left-side {
      width: 240px;
      height: 100%;
      padding: 16px 16px 76px 16px;
      position: relative;
      min-width: 240px;
      background-color: #ffffff;
      border-right: 2px solid #006633;
      overflow-y: auto;

      :deep(.ed-menu-vertical) {
        overflow-y: visible;
      }

      .bottom {
        position: absolute;
        bottom: 20px;
        left: 16px;
        width: calc(100% - 32px);

        .fold-btn {
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          width: 40px;
          height: 40px;
          margin: 0 auto;

          &:hover,
          &:focus {
            background: #1f23291a;
          }

          &:active {
            background: #1f232933;
          }
        }
      }

      &.left-side-collapse {
        width: 64px;
        min-width: 64px;
        padding: 16px 12px;

        .bottom {
          left: 12px;
          width: calc(100% - 24px);
        }
      }
    }

    .right-main {
      width: calc(100% - 240px);
      height: 100%;
      overflow: auto;

      &.right-side-collapse {
        width: calc(100% - 64px);
      }

      .content {
        width: 100%;
        height: 100%;
        padding: 24px;
        background-color: #fff;

        &:has(.no-padding) {
          padding: 0;
        }
      }
    }
  }
}
</style>
