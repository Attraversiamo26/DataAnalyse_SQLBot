import icon_more_outlined from '@/assets/svg/icon_more_outlined.svg';
import icon_expand_down_filled from '@/assets/embedded/icon_expand-down_filled.svg';
import rename from '@/assets/svg/icon_rename_outlined.svg';
import delIcon from '@/assets/svg/icon_delete.svg';
import { chatApi } from '@/api/chat.ts';
import { computed, reactive, ref } from 'vue';
import dayjs from 'dayjs';
import { getDate } from '@/utils/utils.ts';
import { groupBy } from 'lodash-es';
import { useI18n } from 'vue-i18n';
const props = withDefaults(defineProps(), {
    currentChatId: undefined,
    chatList: () => [],
    loading: false,
});
const { t } = useI18n();
function groupByDate(chat) {
    const todayStart = dayjs(dayjs().format('YYYY-MM-DD') + ' 00:00:00').toDate();
    const todayEnd = dayjs(dayjs().format('YYYY-MM-DD') + ' 23:59:59').toDate();
    const weekStart = dayjs(dayjs().subtract(7, 'day').format('YYYY-MM-DD') + ' 00:00:00').toDate();
    const time = getDate(chat.create_time);
    if (time) {
        if (time >= todayStart && time <= todayEnd) {
            return t('qa.today');
        }
        if (time < todayStart && time >= weekStart) {
            return t('qa.week');
        }
        if (time < weekStart) {
            return t('qa.earlier');
        }
    }
    return t('qa.no_time');
}
const computedChatGroup = computed(() => {
    return groupBy(props.chatList, groupByDate);
});
const expandMap = ref({
    [t('qa.today')]: true,
    [t('qa.week')]: true,
    [t('qa.earlier')]: true,
    [t('qa.no_time')]: true,
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
const emits = defineEmits(['chatSelected', 'chatRenamed', 'chatDeleted', 'update:loading']);
const _loading = computed({
    get() {
        return props.loading;
    },
    set(v) {
        emits('update:loading', v);
    },
});
function onClickHistory(chat) {
    emits('chatSelected', chat);
}
function handleCommand(command, chat) {
    if (chat && chat.id !== undefined) {
        switch (command) {
            case 'rename':
                password.id = chat.id;
                password.name = chat.brief;
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
                        emits('chatDeleted', chat.id);
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
}
const passwordRef = ref();
const dialogVisiblePassword = ref(false);
const password = reactive({
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
    passwordRef.value.clearValidate();
    dialogVisiblePassword.value = false;
    password.id = 0;
    password.name = '';
};
const handleConfirmPassword = () => {
    passwordRef.value.validate((res) => {
        if (res) {
            chatApi
                .renameChat(password.id, password.name)
                .then((res) => {
                ElMessage({
                    type: 'success',
                    message: t('common.save_success'),
                });
                emits('chatRenamed', { id: password.id, brief: res });
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
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    currentChatId: undefined,
    chatList: () => [],
    loading: false,
});
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['more']} */ ;
// CSS variable injection 
// CSS variable injection end 
const __VLS_0 = {}.ElScrollbar;
/** @type {[typeof __VLS_components.ElScrollbar, typeof __VLS_components.elScrollbar, typeof __VLS_components.ElScrollbar, typeof __VLS_components.elScrollbar, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ref: "chatListRef",
}));
const __VLS_2 = __VLS_1({
    ref: "chatListRef",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
/** @type {typeof __VLS_ctx.chatListRef} */ ;
var __VLS_4 = {};
__VLS_3.slots.default;
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
                __VLS_ctx.expandMap[group.key] = !__VLS_ctx.expandMap[group.key];
            } },
        ...{ class: "group-title" },
        ...{ style: {} },
    });
    const __VLS_6 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_7 = __VLS_asFunctionalComponent(__VLS_6, new __VLS_6({
        ...{ class: (!__VLS_ctx.expandMap[group.key] && 'expand') },
        ...{ style: {} },
        size: "10",
    }));
    const __VLS_8 = __VLS_7({
        ...{ class: (!__VLS_ctx.expandMap[group.key] && 'expand') },
        ...{ style: {} },
        size: "10",
    }, ...__VLS_functionalComponentArgsRest(__VLS_7));
    __VLS_9.slots.default;
    const __VLS_10 = {}.icon_expand_down_filled;
    /** @type {[typeof __VLS_components.Icon_expand_down_filled, typeof __VLS_components.icon_expand_down_filled, typeof __VLS_components.Icon_expand_down_filled, typeof __VLS_components.icon_expand_down_filled, ]} */ ;
    // @ts-ignore
    const __VLS_11 = __VLS_asFunctionalComponent(__VLS_10, new __VLS_10({}));
    const __VLS_12 = __VLS_11({}, ...__VLS_functionalComponentArgsRest(__VLS_11));
    var __VLS_9;
    (group.key);
    for (const [chat] of __VLS_getVForSourceType((group.list))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ onClick: (...[$event]) => {
                    __VLS_ctx.onClickHistory(chat);
                } },
            ...{ class: "chat-list-item" },
            ...{ class: ({ active: __VLS_ctx.currentChatId === chat.id, hide: !__VLS_ctx.expandMap[group.key] }) },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "title" },
        });
        (chat.brief ?? 'Untitled');
        const __VLS_14 = {}.ElPopover;
        /** @type {[typeof __VLS_components.ElPopover, typeof __VLS_components.elPopover, typeof __VLS_components.ElPopover, typeof __VLS_components.elPopover, ]} */ ;
        // @ts-ignore
        const __VLS_15 = __VLS_asFunctionalComponent(__VLS_14, new __VLS_14({
            teleported: (false),
            popperClass: "popover-card_chat",
            placement: "bottom",
        }));
        const __VLS_16 = __VLS_15({
            teleported: (false),
            popperClass: "popover-card_chat",
            placement: "bottom",
        }, ...__VLS_functionalComponentArgsRest(__VLS_15));
        __VLS_17.slots.default;
        {
            const { reference: __VLS_thisSlot } = __VLS_17.slots;
            const __VLS_18 = {}.ElIcon;
            /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
            // @ts-ignore
            const __VLS_19 = __VLS_asFunctionalComponent(__VLS_18, new __VLS_18({
                ...{ 'onClick': {} },
                ...{ class: "more" },
                size: "16",
                ...{ style: {} },
            }));
            const __VLS_20 = __VLS_19({
                ...{ 'onClick': {} },
                ...{ class: "more" },
                size: "16",
                ...{ style: {} },
            }, ...__VLS_functionalComponentArgsRest(__VLS_19));
            let __VLS_22;
            let __VLS_23;
            let __VLS_24;
            const __VLS_25 = {
                onClick: () => { }
            };
            __VLS_21.slots.default;
            const __VLS_26 = {}.icon_more_outlined;
            /** @type {[typeof __VLS_components.Icon_more_outlined, typeof __VLS_components.icon_more_outlined, typeof __VLS_components.Icon_more_outlined, typeof __VLS_components.icon_more_outlined, ]} */ ;
            // @ts-ignore
            const __VLS_27 = __VLS_asFunctionalComponent(__VLS_26, new __VLS_26({}));
            const __VLS_28 = __VLS_27({}, ...__VLS_functionalComponentArgsRest(__VLS_27));
            var __VLS_21;
        }
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "content" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ onClick: (...[$event]) => {
                    __VLS_ctx.handleCommand('rename', chat);
                } },
            ...{ class: "item" },
        });
        const __VLS_30 = {}.ElIcon;
        /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
        // @ts-ignore
        const __VLS_31 = __VLS_asFunctionalComponent(__VLS_30, new __VLS_30({
            size: "16",
        }));
        const __VLS_32 = __VLS_31({
            size: "16",
        }, ...__VLS_functionalComponentArgsRest(__VLS_31));
        __VLS_33.slots.default;
        const __VLS_34 = {}.rename;
        /** @type {[typeof __VLS_components.Rename, typeof __VLS_components.rename, typeof __VLS_components.Rename, typeof __VLS_components.rename, ]} */ ;
        // @ts-ignore
        const __VLS_35 = __VLS_asFunctionalComponent(__VLS_34, new __VLS_34({}));
        const __VLS_36 = __VLS_35({}, ...__VLS_functionalComponentArgsRest(__VLS_35));
        var __VLS_33;
        (__VLS_ctx.$t('dashboard.rename'));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ onClick: (...[$event]) => {
                    __VLS_ctx.handleCommand('delete', chat);
                } },
            ...{ class: "item" },
        });
        const __VLS_38 = {}.ElIcon;
        /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
        // @ts-ignore
        const __VLS_39 = __VLS_asFunctionalComponent(__VLS_38, new __VLS_38({
            size: "16",
        }));
        const __VLS_40 = __VLS_39({
            size: "16",
        }, ...__VLS_functionalComponentArgsRest(__VLS_39));
        __VLS_41.slots.default;
        const __VLS_42 = {}.delIcon;
        /** @type {[typeof __VLS_components.DelIcon, typeof __VLS_components.delIcon, typeof __VLS_components.DelIcon, typeof __VLS_components.delIcon, ]} */ ;
        // @ts-ignore
        const __VLS_43 = __VLS_asFunctionalComponent(__VLS_42, new __VLS_42({}));
        const __VLS_44 = __VLS_43({}, ...__VLS_functionalComponentArgsRest(__VLS_43));
        var __VLS_41;
        (__VLS_ctx.$t('dashboard.delete'));
        var __VLS_17;
    }
}
var __VLS_3;
const __VLS_46 = {}.ElDialog;
/** @type {[typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ]} */ ;
// @ts-ignore
const __VLS_47 = __VLS_asFunctionalComponent(__VLS_46, new __VLS_46({
    modelValue: (__VLS_ctx.dialogVisiblePassword),
    title: (__VLS_ctx.$t('qa.rename_conversation_title')),
    width: "420",
    beforeClose: (__VLS_ctx.handleClosePassword),
    appendToBody: true,
}));
const __VLS_48 = __VLS_47({
    modelValue: (__VLS_ctx.dialogVisiblePassword),
    title: (__VLS_ctx.$t('qa.rename_conversation_title')),
    width: "420",
    beforeClose: (__VLS_ctx.handleClosePassword),
    appendToBody: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_47));
__VLS_49.slots.default;
const __VLS_50 = {}.ElForm;
/** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
// @ts-ignore
const __VLS_51 = __VLS_asFunctionalComponent(__VLS_50, new __VLS_50({
    ...{ 'onSubmit': {} },
    ref: "passwordRef",
    model: (__VLS_ctx.password),
    labelWidth: "180px",
    labelPosition: "top",
    rules: (__VLS_ctx.passwordRules),
    ...{ class: "form-content_error" },
}));
const __VLS_52 = __VLS_51({
    ...{ 'onSubmit': {} },
    ref: "passwordRef",
    model: (__VLS_ctx.password),
    labelWidth: "180px",
    labelPosition: "top",
    rules: (__VLS_ctx.passwordRules),
    ...{ class: "form-content_error" },
}, ...__VLS_functionalComponentArgsRest(__VLS_51));
let __VLS_54;
let __VLS_55;
let __VLS_56;
const __VLS_57 = {
    onSubmit: () => { }
};
/** @type {typeof __VLS_ctx.passwordRef} */ ;
var __VLS_58 = {};
__VLS_53.slots.default;
const __VLS_60 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
    prop: "name",
    label: (__VLS_ctx.t('qa.conversation_title')),
}));
const __VLS_62 = __VLS_61({
    prop: "name",
    label: (__VLS_ctx.t('qa.conversation_title')),
}, ...__VLS_functionalComponentArgsRest(__VLS_61));
__VLS_63.slots.default;
const __VLS_64 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
    modelValue: (__VLS_ctx.password.name),
    maxlength: "20",
    placeholder: (__VLS_ctx.$t('datasource.please_enter') + __VLS_ctx.$t('common.empty') + __VLS_ctx.$t('qa.conversation_title')),
    clearable: true,
    autocomplete: "off",
}));
const __VLS_66 = __VLS_65({
    modelValue: (__VLS_ctx.password.name),
    maxlength: "20",
    placeholder: (__VLS_ctx.$t('datasource.please_enter') + __VLS_ctx.$t('common.empty') + __VLS_ctx.$t('qa.conversation_title')),
    clearable: true,
    autocomplete: "off",
}, ...__VLS_functionalComponentArgsRest(__VLS_65));
var __VLS_63;
var __VLS_53;
{
    const { footer: __VLS_thisSlot } = __VLS_49.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "dialog-footer" },
    });
    const __VLS_68 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
        ...{ 'onClick': {} },
        secondary: true,
    }));
    const __VLS_70 = __VLS_69({
        ...{ 'onClick': {} },
        secondary: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_69));
    let __VLS_72;
    let __VLS_73;
    let __VLS_74;
    const __VLS_75 = {
        onClick: (__VLS_ctx.handleClosePassword)
    };
    __VLS_71.slots.default;
    (__VLS_ctx.$t('common.cancel'));
    var __VLS_71;
    const __VLS_76 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_78 = __VLS_77({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_77));
    let __VLS_80;
    let __VLS_81;
    let __VLS_82;
    const __VLS_83 = {
        onClick: (__VLS_ctx.handleConfirmPassword)
    };
    __VLS_79.slots.default;
    (__VLS_ctx.$t('common.save'));
    var __VLS_79;
}
var __VLS_49;
/** @type {__VLS_StyleScopedClasses['chat-list-inner']} */ ;
/** @type {__VLS_StyleScopedClasses['group']} */ ;
/** @type {__VLS_StyleScopedClasses['group-title']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-list-item']} */ ;
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
var __VLS_5 = __VLS_4, __VLS_59 = __VLS_58;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            icon_more_outlined: icon_more_outlined,
            icon_expand_down_filled: icon_expand_down_filled,
            rename: rename,
            delIcon: delIcon,
            t: t,
            expandMap: expandMap,
            computedChatList: computedChatList,
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
