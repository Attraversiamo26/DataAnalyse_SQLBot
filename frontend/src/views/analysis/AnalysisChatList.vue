<script setup lang="ts">
import { Search } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'
import { computed, nextTick, ref, onMounted } from 'vue'
import { Chat, chatApi, ChatInfo } from '@/api/chat.ts'
import { filter, includes, groupBy } from 'lodash-es'
import icon_sidebar_outlined from '@/assets/svg/icon_sidebar_outlined.svg'
import icon_new_chat_outlined from '@/assets/svg/icon_new_chat_outlined.svg'
import icon_expand_down_filled from '@/assets/embedded/icon_expand-down_filled.svg'
import icon_more_outlined from '@/assets/svg/icon_more_outlined.svg'
import rename from '@/assets/svg/icon_rename_outlined.svg'
import delIcon from '@/assets/svg/icon_delete.svg'
// import { useUserStore } from '@/stores/user'
// const userStore = useUserStore()
const props = withDefaults(
  defineProps<{
    inPopover?: boolean
    currentChatId?: number
    currentChat?: ChatInfo
    loading?: boolean
  }>(),
  {
    currentChatId: undefined,
    currentChat: () => new ChatInfo(),
    loading: false,
    inPopover: false,
  }
)

const emits = defineEmits([
  'goEmpty',
  'onChatCreated',
  'onClickHistory',
  'onChatDeleted',
  'onChatRenamed',
  'onClickSideBarBtn',
  'update:loading',
  'update:currentChat',
  'update:currentChatId',
])

const search = ref<string>()
const chatList = ref<Array<ChatInfo>>([])

const _currentChatId = computed({
  get() {
    return props.currentChatId
  },
  set(v) {
    emits('update:currentChatId', v)
  },
})
const _currentChat = computed({
  get() {
    return props.currentChat
  },
  set(v) {
    emits('update:currentChat', v)
  },
})

const _loading = computed({
  get() {
    return props.loading
  },
  set(v) {
    emits('update:loading', v)
  },
})

const { t } = useI18n()

const expandMap = ref<Record<string, boolean>>({})

const initExpandMap = () => {
  expandMap.value = {
    [t('qa.today')]: true,
    [t('qa.week')]: true,
    [t('qa.earlier')]: true,
    [t('qa.no_time')]: true,
  }
}

function groupByDate(chat: ChatInfo) {
  const todayStart = new Date(new Date().toDateString())
  const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000 - 1)
  const weekStart = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000)

  const time = new Date(chat.create_time || new Date())

  if (time >= todayStart && time <= todayEnd) {
    return t('qa.today')
  }
  if (time < todayStart && time >= weekStart) {
    return t('qa.week')
  }
  if (time < weekStart) {
    return t('qa.earlier')
  }

  return t('qa.no_time')
}

const computedChatGroup = computed(() => {
  const analysisChats = chatList.value.filter(chat => chat.chat_type === 'analysis')
  let list = analysisChats
  if (search.value && search.value.length > 0) {
    list = filter(analysisChats, (c) =>
      includes(c.brief?.toLowerCase(), search.value?.toLowerCase())
    )
  }
  return groupBy(list, groupByDate)
})

const computedChatList = computed(() => {
  const _list = []
  if (computedChatGroup.value[t('qa.today')]) {
    _list.push({
      key: t('qa.today'),
      list: computedChatGroup.value[t('qa.today')],
    })
  }
  if (computedChatGroup.value[t('qa.week')]) {
    _list.push({
      key: t('qa.week'),
      list: computedChatGroup.value[t('qa.week')],
    })
  }
  if (computedChatGroup.value[t('qa.earlier')]) {
    _list.push({
      key: t('qa.earlier'),
      list: computedChatGroup.value[t('qa.earlier')],
    })
  }
  if (computedChatGroup.value[t('qa.no_time')]) {
    _list.push({
      key: t('qa.no_time'),
      list: computedChatGroup.value[t('qa.no_time')],
    })
  }

  return _list
})

function onClickSideBarBtn() {
  emits('onClickSideBarBtn')
}

// function onChatCreated(chat: ChatInfo) {
//   chatList.value.unshift(chat)
//   _currentChatId.value = chat.id
//   _currentChat.value = chat
//   emits('onChatCreated', chat)
// }

function goEmpty(func?: (...p: any[]) => void, ...params: any[]) {
  _currentChat.value = new ChatInfo()
  _currentChatId.value = undefined
  emits('goEmpty', func, ...params)
  if (func && typeof func === 'function') {
    func(...params)
  }
}

const createNewChat = async () => {
  goEmpty()
  emits('onChatCreated', new ChatInfo())
}

function onClickHistory(chat: Chat) {
  if (chat !== undefined && chat.id !== undefined) {
    if (_currentChatId.value === chat.id) {
      return
    }
    goEmpty(goHistory, chat)
  }
}

function goHistory(chat: Chat) {
  nextTick(() => {
    if (chat !== undefined && chat.id !== undefined) {
      _currentChat.value = new ChatInfo(chat)
      _currentChatId.value = chat.id
      _loading.value = true
      chatApi
        .get(chat.id)
        .then((res) => {
          const info = chatApi.toChatInfo(res)
          if (info && info.id === _currentChatId.value) {
            _currentChat.value = info
            emits('onClickHistory', info)
          }
        })
        .finally(() => {
          _loading.value = false
        })
    }
  })
}

function onChatDeleted(id: number) {
  for (let i = 0; i < chatList.value.length; i++) {
    if (chatList.value[i].id === id) {
      chatList.value.splice(i, 1)
      break
    }
  }
  if (id === _currentChatId.value) {
    goEmpty()
  }
  emits('onChatDeleted', id)
}

function onChatRenamed(chat: Chat) {
  if (Array.isArray(chatList.value)) {
    chatList.value.forEach((c: Chat) => {
      if (c.id === chat.id) {
        c.brief = chat.brief
      }
    })
  }
  if (_currentChat.value.id === chat.id) {
    _currentChat.value.brief = chat.brief
  }
  emits('onChatRenamed', chat)
}

const loadChatList = async () => {
  _loading.value = true
  try {
    const res = await chatApi.list()
    chatList.value = chatApi.toChatInfoList(res)
  } catch (error) {
    console.error('Failed to load chat list:', error)
  } finally {
    _loading.value = false
  }
}

const handleCommand = (command: string | number | object, chat: Chat) => {
  if (chat && chat.id !== undefined) {
    switch (command) {
      case 'rename':
        password.value.id = chat.id
        password.value.name = chat.brief as string
        dialogVisiblePassword.value = true
        break
      case 'delete':
        ElMessageBox.confirm(t('common.sales_in_2024', { msg: chat.brief }), {
          confirmButtonType: 'danger',
          tip: t('common.proceed_with_caution'),
          confirmButtonText: t('dashboard.delete'),
          cancelButtonText: t('common.cancel'),
          customClass: 'confirm-no_icon',
          autofocus: false,
        }).then(() => {
          _loading.value = true
          chatApi
            .deleteChat(chat.id, chat.brief)
            .then(() => {
              ElMessage({
                type: 'success',
                message: t('dashboard.delete_success'),
              })
              onChatDeleted(chat.id!)
            })
            .catch((err) => {
              ElMessage({
                type: 'error',
                message: err.message,
              })
              console.error(err)
            })
            .finally(() => {
              _loading.value = false
            })
        })
        break
    }
  }
}

const passwordRef = ref()
const dialogVisiblePassword = ref(false)
const password = ref({
  name: '',
  id: 0,
})

const passwordRules = {
  name: [
    {
      required: true,
      message: t('datasource.please_enter') + t('common.empty') + t('qa.conversation_title'),
      trigger: 'blur',
    },
  ],
}

const handleClosePassword = () => {
  passwordRef.value?.clearValidate()
  dialogVisiblePassword.value = false
  password.value.id = 0
  password.value.name = ''
}

const handleConfirmPassword = () => {
  passwordRef.value?.validate((res: any) => {
    if (res) {
      chatApi
        .renameChat(password.value.id, password.value.name)
        .then((res) => {
          ElMessage({
            type: 'success',
            message: t('common.save_success'),
          })
          onChatRenamed({ id: password.value.id, brief: res })
          handleClosePassword()
        })
        .catch((err) => {
          ElMessage({
            type: 'error',
            message: err.message,
          })
          console.error(err)
        })
        .finally(() => {
          _loading.value = false
        })
    }
  })
}

onMounted(() => {
  initExpandMap()
  loadChatList()
})
</script>

<template>
  <el-container class="analysis-chat-container">
    <el-header class="chat-list-header" :class="{ 'in-popover': inPopover }">
      <div v-if="!inPopover" class="title">
        <div>数据会话</div>
        <el-button link type="primary" class="icon-btn" @click="onClickSideBarBtn">
          <el-icon>
            <icon_sidebar_outlined />
          </el-icon>
        </el-button>
      </div>
      <el-button class="btn" type="primary" @click="createNewChat">
        <el-icon style="margin-right: 6px">
          <icon_new_chat_outlined />
        </el-icon>
        新建分析
      </el-button>
      <el-input
        v-model="search"
        :prefix-icon="Search"
        class="search"
        name="quick-search"
        autocomplete="off"
        placeholder="搜索会话"
        clearable
        @click.stop
      />
    </el-header>
    <el-main class="chat-list">
      <div v-if="!computedChatList.length" class="empty-search">
        {{ !!search ? '未找到相关内容' : '暂无数据会话' }}
      </div>
      <el-scrollbar v-else>
        <div class="chat-list-inner">
          <div v-for="group in computedChatList" :key="group.key" class="group">
            <div
              class="group-title"
              style="cursor: pointer"
              @click="expandMap[group.key] = !expandMap[group.key]"
            >
              <el-icon :class="!expandMap[group.key] && 'expand'" style="margin-right: 8px" size="10">
                <icon_expand_down_filled></icon_expand_down_filled>
              </el-icon>
              {{ group.key }}
            </div>
            <template v-for="chat in group.list" :key="chat.id">
              <div
                class="chat-item"
                :class="{ active: _currentChatId === chat.id, hide: !expandMap[group.key] }"
                @click="onClickHistory(chat)"
              >
                <span class="title">{{ chat.brief || '未命名会话' }}</span>
                <el-popover :teleported="false" popper-class="popover-card_chat" placement="bottom">
                  <template #reference>
                    <el-icon
                      class="more"
                      size="16"
                      style="margin-left: auto; color: #646a73"
                      @click.stop
                    >
                      <icon_more_outlined></icon_more_outlined>
                    </el-icon>
                  </template>
                  <div class="content">
                    <div class="item" @click.stop="handleCommand('rename', chat)">
                      <el-icon size="16">
                        <rename></rename>
                      </el-icon>
                      {{ $t('dashboard.rename') }}
                    </div>
                    <div class="item" @click.stop="handleCommand('delete', chat)">
                      <el-icon size="16">
                        <delIcon></delIcon>
                      </el-icon>
                      {{ $t('dashboard.delete') }}
                    </div>
                  </div>
                </el-popover>
              </div>
            </template>
          </div>
        </div>
      </el-scrollbar>
    </el-main>

    <el-dialog
      v-model="dialogVisiblePassword"
      :title="$t('qa.rename_conversation_title')"
      width="420"
      :before-close="handleClosePassword"
      append-to-body
    >
      <el-form
        ref="passwordRef"
        :model="password"
        label-width="180px"
        label-position="top"
        :rules="passwordRules"
        class="form-content_error"
        @submit.prevent
      >
        <el-form-item prop="name" :label="t('qa.conversation_title')">
          <el-input
            v-model="password.name"
            maxlength="20"
            :placeholder="
              $t('datasource.please_enter') + $t('common.empty') + $t('qa.conversation_title')
            "
            clearable
            autocomplete="off"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button secondary @click="handleClosePassword">{{ $t('common.cancel') }}</el-button>
          <el-button type="primary" @click="handleConfirmPassword">
            {{ $t('common.save') }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </el-container>
</template>

<style scoped lang="less">
.analysis-chat-container {
  background: #ffffff;
  border-left: 1px solid #e0e0e0;
  height: 100%;

  .icon-btn {
    min-width: unset;
    width: 26px;
    height: 26px;
    font-size: 18px;

    &:hover {
      background: rgba(0, 102, 51, 0.1);
    }
  }

  .chat-list-header {
    --ed-header-padding: 16px;
    --ed-header-height: calc(16px + 24px + 16px + 48px + 16px + 36px + 16px);

    &.in-popover {
      --ed-header-height: calc(16px + 48px + 16px + 36px + 16px);
    }

    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 16px;
    border-bottom: 1px solid #e0e0e0;
    padding-bottom: 16px;

    .title {
      height: 24px;
      width: 100%;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      font-weight: 600;
      font-size: 18px;
      color: #006633;
    }

    .btn {
      width: 100%;
      height: 48px;

      font-size: 16px;
      font-weight: 500;

      --ed-button-text-color: #ffffff;
      --ed-button-bg-color: #006633;
      --ed-button-border-color: #006633;
      --ed-button-hover-bg-color: #00522a;
      --ed-button-hover-text-color: #ffffff;
      --ed-button-hover-border-color: #00522a;
      --ed-button-active-bg-color: #004020;
      --ed-button-active-border-color: #004020;
    }

    .search {
      height: 36px;
      width: 100%;
      :deep(.ed-input__wrapper) {
        background-color: #f5f6f7;
        border-radius: 8px;
      }
    }
  }

  .chat-list {
    padding: 16px 0 20px 0;
    height: calc(100% - var(--ed-header-height));
    overflow: auto;

    .empty-search {
      width: 100%;
      text-align: center;
      margin-top: 80px;
      color: #646a73;
      font-weight: 400;
      font-size: 14px;
      line-height: 22px;
    }

    .chat-list-inner {
      --hover-color: var(--ed-color-primary-light-9);
      --active-color: var(--hover-color);

      padding-left: 16px;
      padding-right: 16px;
      width: 100%;

      display: flex;
      flex-direction: column;

      gap: 16px;

      .group {
        display: flex;
        flex-direction: column;

        .group-title {
          padding: 0 8px;
          color: rgba(100, 106, 115, 1);
          line-height: 20px;
          font-weight: 500;
          font-size: 12px;

          margin-bottom: 4px;

          .expand {
            transform: rotate(-90deg);
          }
        }
      }

      .chat-item {
        width: 100%;
        height: 40px;
        cursor: pointer;
        border-radius: 6px;
        line-height: 22px;
        font-size: 14px;
        font-weight: 400;
        margin-bottom: 2px;

        display: flex;
        align-items: center;
        padding: 8px;

        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;

        .title {
          flex: 1;
          width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .more {
          display: none;
          &.ed-icon {
            position: relative;
            cursor: pointer;
            margin-top: 4px;

            &::after {
              content: '';
              background-color: #1f23291a;
              position: absolute;
              border-radius: 6px;
              width: 24px;
              height: 24px;
              transform: translate(-50%, -50%);
              top: 50%;
              left: 50%;
              display: none;
            }

            &:hover {
              &::after {
                display: block;
              }
            }
          }
        }

        &:hover {
          background-color: rgba(31, 35, 41, 0.1);

          .more {
            display: block;
          }
        }

        &.active {
          background-color: rgba(255, 255, 255, 1);
          font-weight: 500;
        }

        &.hide {
          display: none;
        }
      }
    }
  }
}
</style>

<style lang="less">
.popover-card_chat.popover-card_chat.popover-card_chat {
  box-shadow: 0px 4px 8px 0px #1f23291a;
  border-radius: 4px;
  border: 1px solid #dee0e3;
  width: fit-content !important;
  min-width: 120px !important;
  padding: 0;
  .content {
    position: relative;
    &::after {
      position: absolute;
      content: '';
      top: 40px;
      left: 0;
      width: 100%;
      height: 1px;
      background: #dee0e3;
    }
    .item {
      position: relative;
      padding: 0 12px;
      height: 40px;
      display: flex;
      align-items: center;
      cursor: pointer;
      .ed-icon {
        margin-right: 8px;
        color: #646a73;
      }
      &:hover {
        &::after {
          display: block;
        }
      }

      &::after {
        content: '';
        width: calc(100% - 8px);
        height: 32px;
        border-radius: 4px;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #1f23291a;
        display: none;
      }
    }
  }
}
</style>
