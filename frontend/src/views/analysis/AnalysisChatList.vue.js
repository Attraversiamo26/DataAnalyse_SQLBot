import { Search } from '@element-plus/icons-vue';
import { useI18n } from 'vue-i18n';
import { computed, nextTick, ref, onMounted } from 'vue';
import { chatApi, ChatInfo } from '@/api/chat.ts';
import { filter, includes, groupBy } from 'lodash-es';
import icon_sidebar_outlined from '@/assets/svg/icon_sidebar_outlined.svg';
import icon_new_chat_outlined from '@/assets/svg/icon_new_chat_outlined.svg';
import icon_expand_down_filled from '@/assets/embedded/icon_expand-down_filled.svg';
import icon_more_outlined from '@/assets/svg/icon_more_outlined.svg';
import rename from '@/assets/svg/icon_rename_outlined.svg';
import delIcon from '@/assets/svg/icon_delete.svg';
const props = withDefaults(defineProps(), {
    currentChatId: undefined,
    currentChat: () => new ChatInfo(),
    loading: false,
    inPopover: false,
});
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
]);
const search = ref();
const chatList = ref([]);
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
const _loading = computed({
    get() {
        return props.loading;
    },
    set(v) {
        emits('update:loading', v);
    },
});
const { t } = useI18n();
const expandMap = ref({});
const initExpandMap = () => {
    expandMap.value = {
        [t('qa.today')]: true,
        [t('qa.week')]: true,
        [t('qa.earlier')]: true,
        [t('qa.no_time')]: true,
    };
};
function groupByDate(chat) {
    const todayStart = new Date(new Date().toDateString());
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000 - 1);
    const weekStart = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000);
    const time = new Date(chat.create_time || new Date());
    if (time >= todayStart && time <= todayEnd) {
        return t('qa.today');
    }
    if (time < todayStart && time >= weekStart) {
        return t('qa.week');
    }
    if (time < weekStart) {
        return t('qa.earlier');
    }
    return t('qa.no_time');
}
const computedChatGroup = computed(() => {
    const analysisChats = chatList.value.filter(chat => chat.chat_type === 'analysis');
    let list = analysisChats;
    if (search.value && search.value.length > 0) {
        list = filter(analysisChats, (c) => includes(c.brief?.toLowerCase(), search.value?.toLowerCase()));
    }
    return groupBy(list, groupByDate);
});
const computedChatList = computed(() => {
    const _list = [];
    if (computedChatGroup.value[t('qa.today')]) {
        _list.push({
            key: t('qa.today'),
            list: computedChatGroup.value[t('qa.today')],
        });
    }
    if (computedChatGroup.value[t('qa.week')]) {
        _list.push({
            key: t('qa.week'),
            list: computedChatGroup.value[t('qa.week')],
        });
    }
    if (computedChatGroup.value[t('qa.earlier')]) {
        _list.push({
            key: t('qa.earlier'),
            list: computedChatGroup.value[t('qa.earlier')],
        });
    }
    if (computedChatGroup.value[t('qa.no_time')]) {
        _list.push({
            key: t('qa.no_time'),
            list: computedChatGroup.value[t('qa.no_time')],
        });
    }
    return _list;
});
function onClickSideBarBtn() {
    emits('onClickSideBarBtn');
}
// function onChatCreated(chat: ChatInfo) {
//   chatList.value.unshift(chat)
//   _currentChatId.value = chat.id
//   _currentChat.value = chat
//   emits('onChatCreated', chat)
// }
function goEmpty(func, ...params) {
    _currentChat.value = new ChatInfo();
    _currentChatId.value = undefined;
    emits('goEmpty', func, ...params);
    if (func && typeof func === 'function') {
        func(...params);
    }
}
const createNewChat = async () => {
    goEmpty();
    emits('onChatCreated', new ChatInfo());
};
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
    for (let i = 0; i < chatList.value.length; i++) {
        if (chatList.value[i].id === id) {
            chatList.value.splice(i, 1);
            break;
        }
    }
    if (id === _currentChatId.value) {
        goEmpty();
    }
    emits('onChatDeleted', id);
}
function onChatRenamed(chat) {
    if (Array.isArray(chatList.value)) {
        chatList.value.forEach((c) => {
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
const loadChatList = async () => {
    _loading.value = true;
    try {
        const res = await chatApi.list('analysis'); // 只获取数据分析类型的会话
        chatList.value = chatApi.toChatInfoList(res);
    }
    catch (error) {
        console.error('Failed to load chat list:', error);
    }
    finally {
        _loading.value = false;
    }
};
const handleCommand = (command, chat) => {
    if (chat && chat.id !== undefined) {
        switch (command) {
            case 'rename':
                password.value.id = chat.id;
                password.value.name = chat.brief;
                dialogVisiblePassword.value = true;
                break;
            case 'delete':
                ElMessageBox.confirm(t('common.sales_in_2024', { msg: chat.brief }), {
                    confirmButtonType: 'danger',
                    tip: t('common.proceed_with_caution'),
                    confirmButtonText: t('dashboard.delete'),
                    cancelButtonText: t('common.cancel'),
                    customClass: 'confirm-no_icon',
                    autofocus: false,
                }).then(() => {
                    _loading.value = true;
                    chatApi
                        .deleteChat(chat.id, chat.brief)
                        .then(() => {
                        ElMessage({
                            type: 'success',
                            message: t('dashboard.delete_success'),
                        });
                        onChatDeleted(chat.id);
                    })
                        .catch((err) => {
                        ElMessage({
                            type: 'error',
                            message: err.message,
                        });
                        console.error(err);
                    })
                        .finally(() => {
                        _loading.value = false;
                    });
                });
                break;
        }
    }
};
const passwordRef = ref();
const dialogVisiblePassword = ref(false);
const password = ref({
    name: '',
    id: 0,
});
const passwordRules = {
    name: [
        {
            required: true,
            message: t('datasource.please_enter') + t('common.empty') + t('qa.conversation_title'),
            trigger: 'blur',
        },
    ],
};
const handleClosePassword = () => {
    passwordRef.value?.clearValidate();
    dialogVisiblePassword.value = false;
    password.value.id = 0;
    password.value.name = '';
};
const handleConfirmPassword = () => {
    passwordRef.value?.validate((res) => {
        if (res) {
            chatApi
                .renameChat(password.value.id, password.value.name)
                .then((res) => {
                ElMessage({
                    type: 'success',
                    message: t('common.save_success'),
                });
                onChatRenamed({ id: password.value.id, brief: res });
                handleClosePassword();
            })
                .catch((err) => {
                ElMessage({
                    type: 'error',
                    message: err.message,
                });
                console.error(err);
            })
                .finally(() => {
                _loading.value = false;
            });
        }
    });
};
onMounted(() => {
    initExpandMap();
    loadChatList();
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    currentChatId: undefined,
    currentChat: () => new ChatInfo(),
    loading: false,
    inPopover: false,
});
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['title']} */ ;
/** @type {__VLS_StyleScopedClasses['more']} */ ;
// CSS variable injection 
// CSS variable injection end 
const __VLS_0 = {}.ElContainer;
/** @type {[typeof __VLS_components.ElContainer, typeof __VLS_components.elContainer, typeof __VLS_components.ElContainer, typeof __VLS_components.elContainer, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ class: "analysis-chat-container" },
}));
const __VLS_2 = __VLS_1({
    ...{ class: "analysis-chat-container" },
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
    placeholder: "搜索会话",
    clearable: true,
}));
const __VLS_43 = __VLS_42({
    ...{ 'onClick': {} },
    modelValue: (__VLS_ctx.search),
    prefixIcon: (__VLS_ctx.Search),
    ...{ class: "search" },
    name: "quick-search",
    autocomplete: "off",
    placeholder: "搜索会话",
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
    (!!__VLS_ctx.search ? '未找到相关内容' : '暂无数据会话');
}
else {
    const __VLS_53 = {}.ElScrollbar;
    /** @type {[typeof __VLS_components.ElScrollbar, typeof __VLS_components.elScrollbar, typeof __VLS_components.ElScrollbar, typeof __VLS_components.elScrollbar, ]} */ ;
    // @ts-ignore
    const __VLS_54 = __VLS_asFunctionalComponent(__VLS_53, new __VLS_53({}));
    const __VLS_55 = __VLS_54({}, ...__VLS_functionalComponentArgsRest(__VLS_54));
    __VLS_56.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "chat-list-inner" },
    });
    for (const [group] of __VLS_getVForSourceType((__VLS_ctx.computedChatList))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (group.key),
            ...{ class: "group" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ onClick: (...[$event]) => {
                    if (!!(!__VLS_ctx.computedChatList.length))
                        return;
                    __VLS_ctx.expandMap[group.key] = !__VLS_ctx.expandMap[group.key];
                } },
            ...{ class: "group-title" },
            ...{ style: {} },
        });
        const __VLS_57 = {}.ElIcon;
        /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
        // @ts-ignore
        const __VLS_58 = __VLS_asFunctionalComponent(__VLS_57, new __VLS_57({
            ...{ class: (!__VLS_ctx.expandMap[group.key] && 'expand') },
            ...{ style: {} },
            size: "10",
        }));
        const __VLS_59 = __VLS_58({
            ...{ class: (!__VLS_ctx.expandMap[group.key] && 'expand') },
            ...{ style: {} },
            size: "10",
        }, ...__VLS_functionalComponentArgsRest(__VLS_58));
        __VLS_60.slots.default;
        const __VLS_61 = {}.icon_expand_down_filled;
        /** @type {[typeof __VLS_components.Icon_expand_down_filled, typeof __VLS_components.icon_expand_down_filled, typeof __VLS_components.Icon_expand_down_filled, typeof __VLS_components.icon_expand_down_filled, ]} */ ;
        // @ts-ignore
        const __VLS_62 = __VLS_asFunctionalComponent(__VLS_61, new __VLS_61({}));
        const __VLS_63 = __VLS_62({}, ...__VLS_functionalComponentArgsRest(__VLS_62));
        var __VLS_60;
        (group.key);
        for (const [chat] of __VLS_getVForSourceType((group.list))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ onClick: (...[$event]) => {
                        if (!!(!__VLS_ctx.computedChatList.length))
                            return;
                        __VLS_ctx.onClickHistory(chat);
                    } },
                ...{ class: "chat-item" },
                ...{ class: ({ active: __VLS_ctx._currentChatId === chat.id, hide: !__VLS_ctx.expandMap[group.key] }) },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "title" },
            });
            (chat.brief || '未命名会话');
            const __VLS_65 = {}.ElPopover;
            /** @type {[typeof __VLS_components.ElPopover, typeof __VLS_components.elPopover, typeof __VLS_components.ElPopover, typeof __VLS_components.elPopover, ]} */ ;
            // @ts-ignore
            const __VLS_66 = __VLS_asFunctionalComponent(__VLS_65, new __VLS_65({
                teleported: (false),
                popperClass: "popover-card_chat",
                placement: "bottom",
            }));
            const __VLS_67 = __VLS_66({
                teleported: (false),
                popperClass: "popover-card_chat",
                placement: "bottom",
            }, ...__VLS_functionalComponentArgsRest(__VLS_66));
            __VLS_68.slots.default;
            {
                const { reference: __VLS_thisSlot } = __VLS_68.slots;
                const __VLS_69 = {}.ElIcon;
                /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
                // @ts-ignore
                const __VLS_70 = __VLS_asFunctionalComponent(__VLS_69, new __VLS_69({
                    ...{ 'onClick': {} },
                    ...{ class: "more" },
                    size: "16",
                    ...{ style: {} },
                }));
                const __VLS_71 = __VLS_70({
                    ...{ 'onClick': {} },
                    ...{ class: "more" },
                    size: "16",
                    ...{ style: {} },
                }, ...__VLS_functionalComponentArgsRest(__VLS_70));
                let __VLS_73;
                let __VLS_74;
                let __VLS_75;
                const __VLS_76 = {
                    onClick: () => { }
                };
                __VLS_72.slots.default;
                const __VLS_77 = {}.icon_more_outlined;
                /** @type {[typeof __VLS_components.Icon_more_outlined, typeof __VLS_components.icon_more_outlined, typeof __VLS_components.Icon_more_outlined, typeof __VLS_components.icon_more_outlined, ]} */ ;
                // @ts-ignore
                const __VLS_78 = __VLS_asFunctionalComponent(__VLS_77, new __VLS_77({}));
                const __VLS_79 = __VLS_78({}, ...__VLS_functionalComponentArgsRest(__VLS_78));
                var __VLS_72;
            }
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "content" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ onClick: (...[$event]) => {
                        if (!!(!__VLS_ctx.computedChatList.length))
                            return;
                        __VLS_ctx.handleCommand('rename', chat);
                    } },
                ...{ class: "item" },
            });
            const __VLS_81 = {}.ElIcon;
            /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
            // @ts-ignore
            const __VLS_82 = __VLS_asFunctionalComponent(__VLS_81, new __VLS_81({
                size: "16",
            }));
            const __VLS_83 = __VLS_82({
                size: "16",
            }, ...__VLS_functionalComponentArgsRest(__VLS_82));
            __VLS_84.slots.default;
            const __VLS_85 = {}.rename;
            /** @type {[typeof __VLS_components.Rename, typeof __VLS_components.rename, typeof __VLS_components.Rename, typeof __VLS_components.rename, ]} */ ;
            // @ts-ignore
            const __VLS_86 = __VLS_asFunctionalComponent(__VLS_85, new __VLS_85({}));
            const __VLS_87 = __VLS_86({}, ...__VLS_functionalComponentArgsRest(__VLS_86));
            var __VLS_84;
            (__VLS_ctx.$t('dashboard.rename'));
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ onClick: (...[$event]) => {
                        if (!!(!__VLS_ctx.computedChatList.length))
                            return;
                        __VLS_ctx.handleCommand('delete', chat);
                    } },
                ...{ class: "item" },
            });
            const __VLS_89 = {}.ElIcon;
            /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
            // @ts-ignore
            const __VLS_90 = __VLS_asFunctionalComponent(__VLS_89, new __VLS_89({
                size: "16",
            }));
            const __VLS_91 = __VLS_90({
                size: "16",
            }, ...__VLS_functionalComponentArgsRest(__VLS_90));
            __VLS_92.slots.default;
            const __VLS_93 = {}.delIcon;
            /** @type {[typeof __VLS_components.DelIcon, typeof __VLS_components.delIcon, typeof __VLS_components.DelIcon, typeof __VLS_components.delIcon, ]} */ ;
            // @ts-ignore
            const __VLS_94 = __VLS_asFunctionalComponent(__VLS_93, new __VLS_93({}));
            const __VLS_95 = __VLS_94({}, ...__VLS_functionalComponentArgsRest(__VLS_94));
            var __VLS_92;
            (__VLS_ctx.$t('dashboard.delete'));
            var __VLS_68;
        }
    }
    var __VLS_56;
}
var __VLS_52;
const __VLS_97 = {}.ElDialog;
/** @type {[typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ]} */ ;
// @ts-ignore
const __VLS_98 = __VLS_asFunctionalComponent(__VLS_97, new __VLS_97({
    modelValue: (__VLS_ctx.dialogVisiblePassword),
    title: (__VLS_ctx.$t('qa.rename_conversation_title')),
    width: "420",
    beforeClose: (__VLS_ctx.handleClosePassword),
    appendToBody: true,
}));
const __VLS_99 = __VLS_98({
    modelValue: (__VLS_ctx.dialogVisiblePassword),
    title: (__VLS_ctx.$t('qa.rename_conversation_title')),
    width: "420",
    beforeClose: (__VLS_ctx.handleClosePassword),
    appendToBody: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_98));
__VLS_100.slots.default;
const __VLS_101 = {}.ElForm;
/** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
// @ts-ignore
const __VLS_102 = __VLS_asFunctionalComponent(__VLS_101, new __VLS_101({
    ...{ 'onSubmit': {} },
    ref: "passwordRef",
    model: (__VLS_ctx.password),
    labelWidth: "180px",
    labelPosition: "top",
    rules: (__VLS_ctx.passwordRules),
    ...{ class: "form-content_error" },
}));
const __VLS_103 = __VLS_102({
    ...{ 'onSubmit': {} },
    ref: "passwordRef",
    model: (__VLS_ctx.password),
    labelWidth: "180px",
    labelPosition: "top",
    rules: (__VLS_ctx.passwordRules),
    ...{ class: "form-content_error" },
}, ...__VLS_functionalComponentArgsRest(__VLS_102));
let __VLS_105;
let __VLS_106;
let __VLS_107;
const __VLS_108 = {
    onSubmit: () => { }
};
/** @type {typeof __VLS_ctx.passwordRef} */ ;
var __VLS_109 = {};
__VLS_104.slots.default;
const __VLS_111 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_112 = __VLS_asFunctionalComponent(__VLS_111, new __VLS_111({
    prop: "name",
    label: (__VLS_ctx.t('qa.conversation_title')),
}));
const __VLS_113 = __VLS_112({
    prop: "name",
    label: (__VLS_ctx.t('qa.conversation_title')),
}, ...__VLS_functionalComponentArgsRest(__VLS_112));
__VLS_114.slots.default;
const __VLS_115 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_116 = __VLS_asFunctionalComponent(__VLS_115, new __VLS_115({
    modelValue: (__VLS_ctx.password.name),
    maxlength: "20",
    placeholder: (__VLS_ctx.$t('datasource.please_enter') + __VLS_ctx.$t('common.empty') + __VLS_ctx.$t('qa.conversation_title')),
    clearable: true,
    autocomplete: "off",
}));
const __VLS_117 = __VLS_116({
    modelValue: (__VLS_ctx.password.name),
    maxlength: "20",
    placeholder: (__VLS_ctx.$t('datasource.please_enter') + __VLS_ctx.$t('common.empty') + __VLS_ctx.$t('qa.conversation_title')),
    clearable: true,
    autocomplete: "off",
}, ...__VLS_functionalComponentArgsRest(__VLS_116));
var __VLS_114;
var __VLS_104;
{
    const { footer: __VLS_thisSlot } = __VLS_100.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "dialog-footer" },
    });
    const __VLS_119 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_120 = __VLS_asFunctionalComponent(__VLS_119, new __VLS_119({
        ...{ 'onClick': {} },
        secondary: true,
    }));
    const __VLS_121 = __VLS_120({
        ...{ 'onClick': {} },
        secondary: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_120));
    let __VLS_123;
    let __VLS_124;
    let __VLS_125;
    const __VLS_126 = {
        onClick: (__VLS_ctx.handleClosePassword)
    };
    __VLS_122.slots.default;
    (__VLS_ctx.$t('common.cancel'));
    var __VLS_122;
    const __VLS_127 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_128 = __VLS_asFunctionalComponent(__VLS_127, new __VLS_127({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_129 = __VLS_128({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_128));
    let __VLS_131;
    let __VLS_132;
    let __VLS_133;
    const __VLS_134 = {
        onClick: (__VLS_ctx.handleConfirmPassword)
    };
    __VLS_130.slots.default;
    (__VLS_ctx.$t('common.save'));
    var __VLS_130;
}
var __VLS_100;
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['analysis-chat-container']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-list-header']} */ ;
/** @type {__VLS_StyleScopedClasses['in-popover']} */ ;
/** @type {__VLS_StyleScopedClasses['title']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['search']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-list']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-search']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-list-inner']} */ ;
/** @type {__VLS_StyleScopedClasses['group']} */ ;
/** @type {__VLS_StyleScopedClasses['group-title']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-item']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['hide']} */ ;
/** @type {__VLS_StyleScopedClasses['title']} */ ;
/** @type {__VLS_StyleScopedClasses['more']} */ ;
/** @type {__VLS_StyleScopedClasses['content']} */ ;
/** @type {__VLS_StyleScopedClasses['item']} */ ;
/** @type {__VLS_StyleScopedClasses['item']} */ ;
/** @type {__VLS_StyleScopedClasses['form-content_error']} */ ;
/** @type {__VLS_StyleScopedClasses['dialog-footer']} */ ;
// @ts-ignore
var __VLS_110 = __VLS_109;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            Search: Search,
            icon_sidebar_outlined: icon_sidebar_outlined,
            icon_new_chat_outlined: icon_new_chat_outlined,
            icon_expand_down_filled: icon_expand_down_filled,
            icon_more_outlined: icon_more_outlined,
            rename: rename,
            delIcon: delIcon,
            search: search,
            _currentChatId: _currentChatId,
            t: t,
            expandMap: expandMap,
            computedChatList: computedChatList,
            onClickSideBarBtn: onClickSideBarBtn,
            createNewChat: createNewChat,
            onClickHistory: onClickHistory,
            handleCommand: handleCommand,
            passwordRef: passwordRef,
            dialogVisiblePassword: dialogVisiblePassword,
            password: password,
            passwordRules: passwordRules,
            handleClosePassword: handleClosePassword,
            handleConfirmPassword: handleConfirmPassword,
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
