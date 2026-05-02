import { ref, onMounted, onUnmounted } from 'vue';
import icon_expand_right_filled from '@/assets/svg/icon_expand-right_filled.svg';
import gou_icon from '@/assets/svg/gou_icon.svg';
import icon_error from '@/assets/svg/icon_error.svg';
import icon_database_colorful from '@/assets/svg/icon_database_colorful.svg';
import icon_alarm_clock_colorful from '@/assets/svg/icon_alarm-clock_colorful.svg';
import { chatApi } from '@/api/chat.ts';
import { useI18n } from 'vue-i18n';
import { debounce } from 'lodash-es';
import LogTerm from './execution-component/LogTerm.vue';
import LogSQLSample from './execution-component/LogSQLSample.vue';
import LogCustomPrompt from './execution-component/LogCustomPrompt.vue';
import LogDataQuery from './execution-component/LogDataQuery.vue';
import LogChooseTable from './execution-component/LogChooseTable.vue';
import LogGeneratePicture from './execution-component/LogGeneratePicture.vue';
import LogWithAi from '@/views/chat/execution-component/LogWithAi.vue';
const { t } = useI18n();
const logHistory = ref({});
const dialogFormVisible = ref(false);
const expandIds = ref([]);
const drawerSize = ref('600px');
const handleExpand = (index) => {
    if (expandIds.value.includes(index)) {
        expandIds.value = expandIds.value.filter((ele) => ele !== index);
    }
    else {
        expandIds.value.push(index);
    }
};
function getLogList(recordId) {
    setDrawerSize();
    chatApi.get_chart_log_history(recordId).then((res) => {
        logHistory.value = chatApi.toChatLogHistory(res);
        dialogFormVisible.value = true;
    });
}
const setDrawerSize = debounce(() => {
    drawerSize.value = window.innerWidth < 500 ? '460px' : '600px';
}, 500);
onMounted(() => {
    window.addEventListener('resize', setDrawerSize);
});
onUnmounted(() => {
    window.removeEventListener('resize', setDrawerSize);
});
const __VLS_exposed = {
    getLogList,
};
defineExpose(__VLS_exposed);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
const __VLS_0 = {}.ElDrawer;
/** @type {[typeof __VLS_components.ElDrawer, typeof __VLS_components.elDrawer, typeof __VLS_components.ElDrawer, typeof __VLS_components.elDrawer, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    modelValue: (__VLS_ctx.dialogFormVisible),
    title: (__VLS_ctx.t('parameter.execution_details')),
    destroyOnClose: true,
    modalClass: "execution-details",
    size: (__VLS_ctx.drawerSize),
}));
const __VLS_2 = __VLS_1({
    modelValue: (__VLS_ctx.dialogFormVisible),
    title: (__VLS_ctx.t('parameter.execution_details')),
    destroyOnClose: true,
    modalClass: "execution-details",
    size: (__VLS_ctx.drawerSize),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
var __VLS_4 = {};
__VLS_3.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "title" },
});
(__VLS_ctx.t('parameter.overview'));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "overview" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "item" },
});
const __VLS_5 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_6 = __VLS_asFunctionalComponent(__VLS_5, new __VLS_5({
    size: "40",
}));
const __VLS_7 = __VLS_6({
    size: "40",
}, ...__VLS_functionalComponentArgsRest(__VLS_6));
__VLS_8.slots.default;
const __VLS_9 = {}.icon_database_colorful;
/** @type {[typeof __VLS_components.Icon_database_colorful, typeof __VLS_components.icon_database_colorful, typeof __VLS_components.Icon_database_colorful, typeof __VLS_components.icon_database_colorful, ]} */ ;
// @ts-ignore
const __VLS_10 = __VLS_asFunctionalComponent(__VLS_9, new __VLS_9({}));
const __VLS_11 = __VLS_10({}, ...__VLS_functionalComponentArgsRest(__VLS_10));
var __VLS_8;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "name" },
});
(__VLS_ctx.t('parameter.tokens_required'));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "value" },
});
(__VLS_ctx.logHistory.total_tokens);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "item" },
});
const __VLS_13 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_14 = __VLS_asFunctionalComponent(__VLS_13, new __VLS_13({
    size: "40",
}));
const __VLS_15 = __VLS_14({
    size: "40",
}, ...__VLS_functionalComponentArgsRest(__VLS_14));
__VLS_16.slots.default;
const __VLS_17 = {}.icon_alarm_clock_colorful;
/** @type {[typeof __VLS_components.Icon_alarm_clock_colorful, typeof __VLS_components.icon_alarm_clock_colorful, typeof __VLS_components.Icon_alarm_clock_colorful, typeof __VLS_components.icon_alarm_clock_colorful, ]} */ ;
// @ts-ignore
const __VLS_18 = __VLS_asFunctionalComponent(__VLS_17, new __VLS_17({}));
const __VLS_19 = __VLS_18({}, ...__VLS_functionalComponentArgsRest(__VLS_18));
var __VLS_16;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "name" },
});
(__VLS_ctx.t('parameter.time_execution'));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "value" },
});
(__VLS_ctx.logHistory.duration);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "title" },
});
(__VLS_ctx.t('parameter.execution_details'));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "list" },
});
for (const [ele, index] of __VLS_getVForSourceType((__VLS_ctx.logHistory.steps))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (ele.duration),
        ...{ class: "list-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.handleExpand(index);
            } },
        ...{ class: "header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "name" },
    });
    const __VLS_21 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_22 = __VLS_asFunctionalComponent(__VLS_21, new __VLS_21({
        ...{ class: "shrink" },
        ...{ class: (__VLS_ctx.expandIds.includes(index) && 'expand') },
        size: "10",
    }));
    const __VLS_23 = __VLS_22({
        ...{ class: "shrink" },
        ...{ class: (__VLS_ctx.expandIds.includes(index) && 'expand') },
        size: "10",
    }, ...__VLS_functionalComponentArgsRest(__VLS_22));
    __VLS_24.slots.default;
    const __VLS_25 = {}.icon_expand_right_filled;
    /** @type {[typeof __VLS_components.Icon_expand_right_filled, typeof __VLS_components.icon_expand_right_filled, typeof __VLS_components.Icon_expand_right_filled, typeof __VLS_components.icon_expand_right_filled, ]} */ ;
    // @ts-ignore
    const __VLS_26 = __VLS_asFunctionalComponent(__VLS_25, new __VLS_25({}));
    const __VLS_27 = __VLS_26({}, ...__VLS_functionalComponentArgsRest(__VLS_26));
    var __VLS_24;
    (ele.operate);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "status" },
    });
    if (ele.total_tokens && ele.total_tokens > 0) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "time" },
            ...{ style: {} },
        });
        (ele.total_tokens);
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "time" },
    });
    (ele.duration);
    const __VLS_29 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_30 = __VLS_asFunctionalComponent(__VLS_29, new __VLS_29({
        size: "16",
    }));
    const __VLS_31 = __VLS_30({
        size: "16",
    }, ...__VLS_functionalComponentArgsRest(__VLS_30));
    __VLS_32.slots.default;
    if (ele.error) {
        const __VLS_33 = {}.icon_error;
        /** @type {[typeof __VLS_components.Icon_error, typeof __VLS_components.icon_error, typeof __VLS_components.Icon_error, typeof __VLS_components.icon_error, ]} */ ;
        // @ts-ignore
        const __VLS_34 = __VLS_asFunctionalComponent(__VLS_33, new __VLS_33({}));
        const __VLS_35 = __VLS_34({}, ...__VLS_functionalComponentArgsRest(__VLS_34));
    }
    else {
        const __VLS_37 = {}.gou_icon;
        /** @type {[typeof __VLS_components.Gou_icon, typeof __VLS_components.gou_icon, typeof __VLS_components.Gou_icon, typeof __VLS_components.gou_icon, ]} */ ;
        // @ts-ignore
        const __VLS_38 = __VLS_asFunctionalComponent(__VLS_37, new __VLS_37({}));
        const __VLS_39 = __VLS_38({}, ...__VLS_functionalComponentArgsRest(__VLS_38));
    }
    var __VLS_32;
    if (__VLS_ctx.expandIds.includes(index)) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "content" },
        });
        if (ele.operate_key === 'FILTER_TERMS') {
            /** @type {[typeof LogTerm, ]} */ ;
            // @ts-ignore
            const __VLS_41 = __VLS_asFunctionalComponent(LogTerm, new LogTerm({
                item: (ele),
            }));
            const __VLS_42 = __VLS_41({
                item: (ele),
            }, ...__VLS_functionalComponentArgsRest(__VLS_41));
        }
        else if (ele.operate_key === 'FILTER_SQL_EXAMPLE') {
            /** @type {[typeof LogSQLSample, ]} */ ;
            // @ts-ignore
            const __VLS_44 = __VLS_asFunctionalComponent(LogSQLSample, new LogSQLSample({
                item: (ele),
            }));
            const __VLS_45 = __VLS_44({
                item: (ele),
            }, ...__VLS_functionalComponentArgsRest(__VLS_44));
        }
        else if (ele.operate_key === 'FILTER_CUSTOM_PROMPT') {
            /** @type {[typeof LogCustomPrompt, ]} */ ;
            // @ts-ignore
            const __VLS_47 = __VLS_asFunctionalComponent(LogCustomPrompt, new LogCustomPrompt({
                item: (ele),
            }));
            const __VLS_48 = __VLS_47({
                item: (ele),
            }, ...__VLS_functionalComponentArgsRest(__VLS_47));
        }
        else if (ele.operate_key === 'CHOOSE_TABLE') {
            /** @type {[typeof LogChooseTable, ]} */ ;
            // @ts-ignore
            const __VLS_50 = __VLS_asFunctionalComponent(LogChooseTable, new LogChooseTable({
                item: (ele),
            }));
            const __VLS_51 = __VLS_50({
                item: (ele),
            }, ...__VLS_functionalComponentArgsRest(__VLS_50));
        }
        else if (ele.operate_key === 'EXECUTE_SQL') {
            /** @type {[typeof LogDataQuery, ]} */ ;
            // @ts-ignore
            const __VLS_53 = __VLS_asFunctionalComponent(LogDataQuery, new LogDataQuery({
                item: (ele),
            }));
            const __VLS_54 = __VLS_53({
                item: (ele),
            }, ...__VLS_functionalComponentArgsRest(__VLS_53));
        }
        else if (ele.operate_key === 'GENERATE_PICTURE') {
            /** @type {[typeof LogGeneratePicture, ]} */ ;
            // @ts-ignore
            const __VLS_56 = __VLS_asFunctionalComponent(LogGeneratePicture, new LogGeneratePicture({
                item: (ele),
            }));
            const __VLS_57 = __VLS_56({
                item: (ele),
            }, ...__VLS_functionalComponentArgsRest(__VLS_56));
        }
        else {
            /** @type {[typeof LogWithAi, ]} */ ;
            // @ts-ignore
            const __VLS_59 = __VLS_asFunctionalComponent(LogWithAi, new LogWithAi({
                item: (ele),
            }));
            const __VLS_60 = __VLS_59({
                item: (ele),
            }, ...__VLS_functionalComponentArgsRest(__VLS_59));
        }
    }
}
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['title']} */ ;
/** @type {__VLS_StyleScopedClasses['overview']} */ ;
/** @type {__VLS_StyleScopedClasses['item']} */ ;
/** @type {__VLS_StyleScopedClasses['name']} */ ;
/** @type {__VLS_StyleScopedClasses['value']} */ ;
/** @type {__VLS_StyleScopedClasses['item']} */ ;
/** @type {__VLS_StyleScopedClasses['name']} */ ;
/** @type {__VLS_StyleScopedClasses['value']} */ ;
/** @type {__VLS_StyleScopedClasses['title']} */ ;
/** @type {__VLS_StyleScopedClasses['list']} */ ;
/** @type {__VLS_StyleScopedClasses['list-item']} */ ;
/** @type {__VLS_StyleScopedClasses['header']} */ ;
/** @type {__VLS_StyleScopedClasses['name']} */ ;
/** @type {__VLS_StyleScopedClasses['shrink']} */ ;
/** @type {__VLS_StyleScopedClasses['status']} */ ;
/** @type {__VLS_StyleScopedClasses['time']} */ ;
/** @type {__VLS_StyleScopedClasses['time']} */ ;
/** @type {__VLS_StyleScopedClasses['content']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            icon_expand_right_filled: icon_expand_right_filled,
            gou_icon: gou_icon,
            icon_error: icon_error,
            icon_database_colorful: icon_database_colorful,
            icon_alarm_clock_colorful: icon_alarm_clock_colorful,
            LogTerm: LogTerm,
            LogSQLSample: LogSQLSample,
            LogCustomPrompt: LogCustomPrompt,
            LogDataQuery: LogDataQuery,
            LogChooseTable: LogChooseTable,
            LogGeneratePicture: LogGeneratePicture,
            LogWithAi: LogWithAi,
            t: t,
            logHistory: logHistory,
            dialogFormVisible: dialogFormVisible,
            expandIds: expandIds,
            drawerSize: drawerSize,
            handleExpand: handleExpand,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {
            ...__VLS_exposed,
        };
    },
});
; /* PartiallyEnd: #4569/main.vue */
