import { Search } from '@element-plus/icons-vue';
import ChatList from '@/views/chat/ChatList.vue';
import { useI18n } from 'vue-i18n';
import { computed, nextTick, ref } from 'vue';
import { chatApi, ChatInfo } from '@/api/chat.ts';
import { filter, includes } from 'lodash-es';
import ChatCreator from '@/views/chat/ChatCreator.vue';
import { useAssistantStore } from '@/stores/assistant';
import icon_sidebar_outlined from '@/assets/svg/icon_sidebar_outlined.svg';
import icon_new_chat_outlined from '@/assets/svg/icon_new_chat_outlined.svg';
import { useUserStore } from '@/stores/user';
import router from '@/router';
const userStore = useUserStore();
const props = withDefaults(defineProps(), {
    chatList: () => [],
    currentChatId: undefined,
    currentChat: () => new ChatInfo(),
    loading: false,
    inPopover: false,
    appName: '',
});
const emits = defineEmits([
    'goEmpty',
    'onChatCreated',
    'onClickHistory',
    'onChatDeleted',
    'onChatRenamed',
    'onClickSideBarBtn',
    'update:loading',
    'update:chatList',
    'update:currentChat',
    'update:currentChatId',
]);
const assistantStore = useAssistantStore();
const isCompletePage = computed(() => !assistantStore.getAssistant || assistantStore.getEmbedded);
const selectAssistantDs = computed(() => {
    return assistantStore.getAssistant && !assistantStore.getAutoDs;
});
const search = ref();
const _currentChatId = computed({
    get() {
        return props.currentChatId;
    },
    set(v) {
        emits('update:currentChatId', v);
    },
});
const _currentChat = computed({
    get() {
        return props.currentChat;
    },
    set(v) {
        emits('update:currentChat', v);
    },
});
const _chatList = computed({
    get() {
        return props.chatList;
    },
    set(v) {
        emits('update:chatList', v);
    },
});
const computedChatList = computed(() => {
    let list = _chatList.value.filter(chat => chat.chat_type !== 'analysis');
    if (search.value && search.value.length > 0) {
        return filter(list, (c) => includes(c.brief?.toLowerCase(), search.value?.toLowerCase()));
    }
    else {
        return list;
    }
});
const _loading = computed({
    get() {
        return props.loading;
    },
    set(v) {
        emits('update:loading', v);
    },
});
const { t } = useI18n();
function onClickSideBarBtn() {
    emits('onClickSideBarBtn');
}
function onChatCreated(chat) {
    _chatList.value.unshift(chat);
    _currentChatId.value = chat.id;
    _currentChat.value = chat;
    emits('onChatCreated', chat);
}
const chatCreatorRef = ref();
function goEmpty(func, ...params) {
    _currentChat.value = new ChatInfo();
    _currentChatId.value = undefined;
    emits('goEmpty', func, ...params);
}
const createNewChat = async () => {
    try {
        await chatApi.checkLLMModel();
    }
    catch (error) {
        console.error(error);
        let errorMsg = t('model.default_miss');
        let confirm_text = t('datasource.got_it');
        if (userStore.isAdmin) {
            errorMsg = t('model.default_miss_admin');
            confirm_text = t('model.to_config');
        }
        ElMessageBox.confirm(t('qa.ask_failed'), {
            confirmButtonType: 'primary',
            tip: errorMsg,
            showCancelButton: userStore.isAdmin,
            confirmButtonText: confirm_text,
            cancelButtonText: t('common.cancel'),
            customClass: 'confirm-no_icon',
            autofocus: false,
            showClose: false,
            callback: (val) => {
                if (userStore.isAdmin && val === 'confirm') {
                    router.push('/system/model');
                }
            },
        });
        return;
    }
    goEmpty(doCreateNewChat);
};
async function doCreateNewChat() {
    if (!isCompletePage.value && !selectAssistantDs.value) {
        return;
    }
    chatCreatorRef.value?.showDs();
}
function onClickHistory(chat) {
    if (chat !== undefined && chat.id !== undefined) {
        if (_currentChatId.value === chat.id) {
            return;
        }
        goEmpty(goHistory, chat);
    }
}
function goHistory(chat) {
    nextTick(() => {
        if (chat !== undefined && chat.id !== undefined) {
            _currentChat.value = new ChatInfo(chat);
            _currentChatId.value = chat.id;
            _loading.value = true;
            chatApi
                .get(chat.id)
                .then((res) => {
                const info = chatApi.toChatInfo(res);
                if (info && info.id === _currentChatId.value) {
                    _currentChat.value = info;
                    // scrollToBottom()
                    emits('onClickHistory', info);
                }
            })
                .finally(() => {
                _loading.value = false;
            });
        }
    });
}
function onChatDeleted(id) {
    for (let i = 0; i < _chatList.value.length; i++) {
        if (_chatList.value[i].id === id) {
            _chatList.value.splice(i, 1);
            break;
        }
    }
    if (id === _currentChatId.value) {
        goEmpty();
    }
    emits('onChatDeleted', id);
}
function onChatRenamed(chat) {
    if (Array.isArray(_chatList.value)) {
        _chatList.value.forEach((c) => {
            if (c.id === chat.id) {
                c.brief = chat.brief;
            }
        });
    }
    if (_currentChat.value.id === chat.id) {
        _currentChat.value.brief = chat.brief;
    }
    emits('onChatRenamed', chat);
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    chatList: () => [],
    currentChatId: undefined,
    currentChat: () => new ChatInfo(),
    loading: false,
    inPopover: false,
    appName: '',
});
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
const __VLS_0 = {}.ElContainer;
/** @type {[typeof __VLS_components.ElContainer, typeof __VLS_components.elContainer, typeof __VLS_components.ElContainer, typeof __VLS_components.elContainer, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ class: "chat-container-right-container" },
}));
const __VLS_2 = __VLS_1({
    ...{ class: "chat-container-right-container" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
var __VLS_4 = {};
__VLS_3.slots.default;
const __VLS_5 = {}.ElHeader;
/** @type {[typeof __VLS_components.ElHeader, typeof __VLS_components.elHeader, typeof __VLS_components.ElHeader, typeof __VLS_components.elHeader, ]} */ ;
// @ts-ignore
const __VLS_6 = __VLS_asFunctionalComponent(__VLS_5, new __VLS_5({
    ...{ class: "chat-list-header" },
    ...{ class: ({ 'in-popover': __VLS_ctx.inPopover }) },
}));
const __VLS_7 = __VLS_6({
    ...{ class: "chat-list-header" },
    ...{ class: ({ 'in-popover': __VLS_ctx.inPopover }) },
}, ...__VLS_functionalComponentArgsRest(__VLS_6));
__VLS_8.slots.default;
if (!__VLS_ctx.inPopover) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "title" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    (__VLS_ctx.appName || __VLS_ctx.t('qa.title'));
    const __VLS_9 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_10 = __VLS_asFunctionalComponent(__VLS_9, new __VLS_9({
        ...{ 'onClick': {} },
        link: true,
        type: "primary",
        ...{ class: "icon-btn" },
    }));
    const __VLS_11 = __VLS_10({
        ...{ 'onClick': {} },
        link: true,
        type: "primary",
        ...{ class: "icon-btn" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_10));
    let __VLS_13;
    let __VLS_14;
    let __VLS_15;
    const __VLS_16 = {
        onClick: (__VLS_ctx.onClickSideBarBtn)
    };
    __VLS_12.slots.default;
    const __VLS_17 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_18 = __VLS_asFunctionalComponent(__VLS_17, new __VLS_17({}));
    const __VLS_19 = __VLS_18({}, ...__VLS_functionalComponentArgsRest(__VLS_18));
    __VLS_20.slots.default;
    const __VLS_21 = {}.icon_sidebar_outlined;
    /** @type {[typeof __VLS_components.Icon_sidebar_outlined, typeof __VLS_components.icon_sidebar_outlined, ]} */ ;
    // @ts-ignore
    const __VLS_22 = __VLS_asFunctionalComponent(__VLS_21, new __VLS_21({}));
    const __VLS_23 = __VLS_22({}, ...__VLS_functionalComponentArgsRest(__VLS_22));
    var __VLS_20;
    var __VLS_12;
}
const __VLS_25 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_26 = __VLS_asFunctionalComponent(__VLS_25, new __VLS_25({
    ...{ 'onClick': {} },
    ...{ class: "btn" },
    type: "primary",
}));
const __VLS_27 = __VLS_26({
    ...{ 'onClick': {} },
    ...{ class: "btn" },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_26));
let __VLS_29;
let __VLS_30;
let __VLS_31;
const __VLS_32 = {
    onClick: (__VLS_ctx.createNewChat)
};
__VLS_28.slots.default;
const __VLS_33 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_34 = __VLS_asFunctionalComponent(__VLS_33, new __VLS_33({
    ...{ style: {} },
}));
const __VLS_35 = __VLS_34({
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_34));
__VLS_36.slots.default;
const __VLS_37 = {}.icon_new_chat_outlined;
/** @type {[typeof __VLS_components.Icon_new_chat_outlined, typeof __VLS_components.icon_new_chat_outlined, ]} */ ;
// @ts-ignore
const __VLS_38 = __VLS_asFunctionalComponent(__VLS_37, new __VLS_37({}));
const __VLS_39 = __VLS_38({}, ...__VLS_functionalComponentArgsRest(__VLS_38));
var __VLS_36;
(__VLS_ctx.t('qa.new_chat'));
var __VLS_28;
const __VLS_41 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_42 = __VLS_asFunctionalComponent(__VLS_41, new __VLS_41({
    ...{ 'onClick': {} },
    modelValue: (__VLS_ctx.search),
    prefixIcon: (__VLS_ctx.Search),
    ...{ class: "search" },
    name: "quick-search",
    autocomplete: "off",
    placeholder: (__VLS_ctx.t('qa.chat_search')),
    clearable: true,
}));
const __VLS_43 = __VLS_42({
    ...{ 'onClick': {} },
    modelValue: (__VLS_ctx.search),
    prefixIcon: (__VLS_ctx.Search),
    ...{ class: "search" },
    name: "quick-search",
    autocomplete: "off",
    placeholder: (__VLS_ctx.t('qa.chat_search')),
    clearable: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_42));
let __VLS_45;
let __VLS_46;
let __VLS_47;
const __VLS_48 = {
    onClick: () => { }
};
var __VLS_44;
var __VLS_8;
const __VLS_49 = {}.ElMain;
/** @type {[typeof __VLS_components.ElMain, typeof __VLS_components.elMain, typeof __VLS_components.ElMain, typeof __VLS_components.elMain, ]} */ ;
// @ts-ignore
const __VLS_50 = __VLS_asFunctionalComponent(__VLS_49, new __VLS_49({
    ...{ class: "chat-list" },
}));
const __VLS_51 = __VLS_50({
    ...{ class: "chat-list" },
}, ...__VLS_functionalComponentArgsRest(__VLS_50));
__VLS_52.slots.default;
if (!__VLS_ctx.computedChatList.length) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "empty-search" },
    });
    (!!__VLS_ctx.search ? __VLS_ctx.$t('datasource.relevant_content_found') : __VLS_ctx.$t('dashboard.no_chat'));
}
else {
    /** @type {[typeof ChatList, ]} */ ;
    // @ts-ignore
    const __VLS_53 = __VLS_asFunctionalComponent(ChatList, new ChatList({
        ...{ 'onChatSelected': {} },
        ...{ 'onChatDeleted': {} },
        ...{ 'onChatRenamed': {} },
        loading: (__VLS_ctx._loading),
        currentChatId: (__VLS_ctx._currentChatId),
        chatList: (__VLS_ctx.computedChatList),
    }));
    const __VLS_54 = __VLS_53({
        ...{ 'onChatSelected': {} },
        ...{ 'onChatDeleted': {} },
        ...{ 'onChatRenamed': {} },
        loading: (__VLS_ctx._loading),
        currentChatId: (__VLS_ctx._currentChatId),
        chatList: (__VLS_ctx.computedChatList),
    }, ...__VLS_functionalComponentArgsRest(__VLS_53));
    let __VLS_56;
    let __VLS_57;
    let __VLS_58;
    const __VLS_59 = {
        onChatSelected: (__VLS_ctx.onClickHistory)
    };
    const __VLS_60 = {
        onChatDeleted: (__VLS_ctx.onChatDeleted)
    };
    const __VLS_61 = {
        onChatRenamed: (__VLS_ctx.onChatRenamed)
    };
    var __VLS_55;
}
var __VLS_52;
if (__VLS_ctx.isCompletePage || __VLS_ctx.selectAssistantDs) {
    /** @type {[typeof ChatCreator, ]} */ ;
    // @ts-ignore
    const __VLS_62 = __VLS_asFunctionalComponent(ChatCreator, new ChatCreator({
        ...{ 'onOnChatCreated': {} },
        ref: "chatCreatorRef",
    }));
    const __VLS_63 = __VLS_62({
        ...{ 'onOnChatCreated': {} },
        ref: "chatCreatorRef",
    }, ...__VLS_functionalComponentArgsRest(__VLS_62));
    let __VLS_65;
    let __VLS_66;
    let __VLS_67;
    const __VLS_68 = {
        onOnChatCreated: (__VLS_ctx.onChatCreated)
    };
    /** @type {typeof __VLS_ctx.chatCreatorRef} */ ;
    var __VLS_69 = {};
    var __VLS_64;
}
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['chat-container-right-container']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-list-header']} */ ;
/** @type {__VLS_StyleScopedClasses['in-popover']} */ ;
/** @type {__VLS_StyleScopedClasses['title']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['search']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-list']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-search']} */ ;
// @ts-ignore
var __VLS_70 = __VLS_69;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            Search: Search,
            ChatList: ChatList,
            ChatCreator: ChatCreator,
            icon_sidebar_outlined: icon_sidebar_outlined,
            icon_new_chat_outlined: icon_new_chat_outlined,
            isCompletePage: isCompletePage,
            selectAssistantDs: selectAssistantDs,
            search: search,
            _currentChatId: _currentChatId,
            computedChatList: computedChatList,
            _loading: _loading,
            t: t,
            onClickSideBarBtn: onClickSideBarBtn,
            onChatCreated: onChatCreated,
            chatCreatorRef: chatCreatorRef,
            createNewChat: createNewChat,
            onClickHistory: onClickHistory,
            onChatDeleted: onChatDeleted,
            onChatRenamed: onChatRenamed,
        };
    },
    emits: {},
    __typeProps: {},
    props: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    emits: {},
    __typeProps: {},
    props: {},
});
; /* PartiallyEnd: #4569/main.vue */
