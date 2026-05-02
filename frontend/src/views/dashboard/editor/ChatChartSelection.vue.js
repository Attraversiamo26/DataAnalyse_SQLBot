import { computed, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { chatApi, ChatInfo } from '@/api/chat.ts';
import DashboardChatList from '@/views/dashboard/editor/DashboardChatList.vue';
import ChartSelection from '@/views/dashboard/editor/ChartSelection.vue';
import { concat } from 'lodash-es';
const dialogShow = ref(false);
const { t } = useI18n();
const selectComponentCount = computed(() => state.curMultiplexingComponents.length);
const state = reactive({
    curMultiplexingComponents: [],
});
const loading = ref(false);
const chatList = ref([]);
const currentChatId = ref();
const currentChat = ref(new ChatInfo());
const chartInfoList = ref([]);
const emits = defineEmits(['addChatChart']);
function selectChange(value, viewInfo) {
    if (value) {
        // @ts-expect-error eslint-disable-next-line @typescript-eslint/ban-ts-comment
        state.curMultiplexingComponents.push(viewInfo);
    }
    else {
        state.curMultiplexingComponents = state.curMultiplexingComponents.filter(
        // @ts-expect-error eslint-disable-next-line @typescript-eslint/ban-ts-comment
        (component) => component.id !== viewInfo.id);
    }
}
const getData = (record) => {
    const recordData = record.data;
    if (record?.predict_record_id !== undefined && record?.predict_record_id !== null) {
        let _list = [];
        if (record?.predict_data && typeof record?.predict_data === 'string') {
            if (record?.predict_data.length > 0 &&
                record?.predict_data.trim().startsWith('[') &&
                record?.predict_data.trim().endsWith(']')) {
                try {
                    _list = JSON.parse(record?.predict_data);
                }
                catch (e) {
                    console.error(e);
                }
            }
        }
        else {
            if (record?.predict_data.length > 0) {
                _list = record?.predict_data;
            }
        }
        if (_list.length == 0) {
            return _list;
        }
        if (recordData.data && recordData.data.length > 0) {
            recordData.data = concat(recordData.data, _list);
        }
        else {
            recordData.data = _list;
        }
        return recordData;
    }
    else {
        return recordData;
    }
};
function adaptorChartInfoList(chatInfo) {
    chartInfoList.value = [];
    if (chatInfo && chatInfo.records) {
        chatInfo.records.forEach((record) => {
            const data = getData(record);
            if (((record?.analysis_record_id === undefined || record?.analysis_record_id === null) &&
                (record?.predict_record_id === undefined || record?.predict_record_id === null) &&
                (record?.sql || record?.chart)) ||
                (record?.predict_record_id !== undefined &&
                    record?.predict_record_id !== null &&
                    data?.data?.length > 0)) {
                const recordeInfo = {
                    id: chatInfo.id + '_' + record.id,
                    sql: record.sql,
                    datasource: record.datasource,
                    data: data,
                    chart: {},
                };
                const chartBaseInfo = JSON.parse(record.chart);
                if (chartBaseInfo) {
                    let yAxis = [];
                    const axis = chartBaseInfo?.axis;
                    if (!axis?.y) {
                        yAxis = [];
                    }
                    else {
                        const y = axis.y;
                        const multiQuotaValues = axis['multi-quota']?.value || [];
                        // 统一处理为数组
                        const yArray = Array.isArray(y) ? [...y] : [{ ...y }];
                        // 标记 multi-quota
                        yAxis = yArray.map((item) => ({
                            ...item,
                            'multi-quota': multiQuotaValues.includes(item.value),
                        }));
                    }
                    recordeInfo['chart'] = {
                        type: chartBaseInfo?.type,
                        title: chartBaseInfo?.title,
                        columns: chartBaseInfo?.columns,
                        xAxis: axis?.x ? [axis?.x] : [],
                        yAxis: yAxis,
                        series: axis?.series ? [axis?.series] : [],
                        multiQuotaName: axis?.['multi-quota']?.name,
                    };
                    chartInfoList.value.push(recordeInfo);
                }
            }
        });
    }
}
function onClickHistory(chat) {
    currentChat.value = new ChatInfo(chat);
    if (chat !== undefined && chat.id !== undefined && !loading.value) {
        currentChatId.value = chat.id;
        loading.value = true;
        chatApi
            .get_with_Data(chat.id)
            .then((res) => {
            const info = chatApi.toChatInfo(res);
            if (info) {
                currentChat.value = info;
                adaptorChartInfoList(info);
                state.curMultiplexingComponents = [];
            }
        })
            .finally(() => {
            loading.value = false;
        });
    }
}
function getChatList() {
    loading.value = true;
    chatApi
        .list()
        .then((res) => {
        chatList.value = chatApi.toChatInfoList(res);
    })
        .finally(() => {
        loading.value = false;
    });
}
const dialogInit = () => {
    dialogShow.value = true;
    currentChatId.value = undefined;
    state.curMultiplexingComponents = [];
    chartInfoList.value = [];
    getChatList();
};
const saveMultiplexing = () => {
    dialogShow.value = false;
    if (state.curMultiplexingComponents.length > 0) {
        emits('addChatChart', state.curMultiplexingComponents);
    }
};
const handleClose = () => { };
const __VLS_exposed = {
    dialogInit,
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
    ...{ 'onClosed': {} },
    modelValue: (__VLS_ctx.dialogShow),
    direction: "btt",
    size: "90%",
    trigger: "click",
    title: (__VLS_ctx.t('dashboard.add_chart')),
    modalClass: "custom-drawer",
    destroyOnClose: (true),
}));
const __VLS_2 = __VLS_1({
    ...{ 'onClosed': {} },
    modelValue: (__VLS_ctx.dialogShow),
    direction: "btt",
    size: "90%",
    trigger: "click",
    title: (__VLS_ctx.t('dashboard.add_chart')),
    modalClass: "custom-drawer",
    destroyOnClose: (true),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onClosed: (...[$event]) => {
        __VLS_ctx.handleClose();
    }
};
var __VLS_8 = {};
__VLS_3.slots.default;
const __VLS_9 = {}.ElContainer;
/** @type {[typeof __VLS_components.ElContainer, typeof __VLS_components.elContainer, typeof __VLS_components.ElContainer, typeof __VLS_components.elContainer, ]} */ ;
// @ts-ignore
const __VLS_10 = __VLS_asFunctionalComponent(__VLS_9, new __VLS_9({
    ...{ class: "chat-container" },
}));
const __VLS_11 = __VLS_10({
    ...{ class: "chat-container" },
}, ...__VLS_functionalComponentArgsRest(__VLS_10));
__VLS_12.slots.default;
const __VLS_13 = {}.ElAside;
/** @type {[typeof __VLS_components.ElAside, typeof __VLS_components.elAside, typeof __VLS_components.ElAside, typeof __VLS_components.elAside, ]} */ ;
// @ts-ignore
const __VLS_14 = __VLS_asFunctionalComponent(__VLS_13, new __VLS_13({
    ...{ class: "chat-container-left" },
}));
const __VLS_15 = __VLS_14({
    ...{ class: "chat-container-left" },
}, ...__VLS_functionalComponentArgsRest(__VLS_14));
__VLS_16.slots.default;
const __VLS_17 = {}.ElContainer;
/** @type {[typeof __VLS_components.ElContainer, typeof __VLS_components.elContainer, typeof __VLS_components.ElContainer, typeof __VLS_components.elContainer, ]} */ ;
// @ts-ignore
const __VLS_18 = __VLS_asFunctionalComponent(__VLS_17, new __VLS_17({
    ...{ class: "chat-container-right-container" },
}));
const __VLS_19 = __VLS_18({
    ...{ class: "chat-container-right-container" },
}, ...__VLS_functionalComponentArgsRest(__VLS_18));
__VLS_20.slots.default;
const __VLS_21 = {}.ElMain;
/** @type {[typeof __VLS_components.ElMain, typeof __VLS_components.elMain, typeof __VLS_components.ElMain, typeof __VLS_components.elMain, ]} */ ;
// @ts-ignore
const __VLS_22 = __VLS_asFunctionalComponent(__VLS_21, new __VLS_21({
    ...{ class: "chat-list" },
}));
const __VLS_23 = __VLS_22({
    ...{ class: "chat-list" },
}, ...__VLS_functionalComponentArgsRest(__VLS_22));
__VLS_24.slots.default;
/** @type {[typeof DashboardChatList, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(DashboardChatList, new DashboardChatList({
    ...{ 'onChatSelected': {} },
    loading: (__VLS_ctx.loading),
    currentChatId: (__VLS_ctx.currentChatId),
    chatList: (__VLS_ctx.chatList),
}));
const __VLS_26 = __VLS_25({
    ...{ 'onChatSelected': {} },
    loading: (__VLS_ctx.loading),
    currentChatId: (__VLS_ctx.currentChatId),
    chatList: (__VLS_ctx.chatList),
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
let __VLS_28;
let __VLS_29;
let __VLS_30;
const __VLS_31 = {
    onChatSelected: (__VLS_ctx.onClickHistory)
};
var __VLS_27;
var __VLS_24;
var __VLS_20;
var __VLS_16;
const __VLS_32 = {}.ElContainer;
/** @type {[typeof __VLS_components.ElContainer, typeof __VLS_components.elContainer, typeof __VLS_components.ElContainer, typeof __VLS_components.elContainer, ]} */ ;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
    loading: (__VLS_ctx.loading),
}));
const __VLS_34 = __VLS_33({
    loading: (__VLS_ctx.loading),
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
__VLS_35.slots.default;
if (!__VLS_ctx.loading) {
    const __VLS_36 = {}.ElMain;
    /** @type {[typeof __VLS_components.ElMain, typeof __VLS_components.elMain, typeof __VLS_components.ElMain, typeof __VLS_components.elMain, ]} */ ;
    // @ts-ignore
    const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
        ...{ class: "chat-record-list" },
    }));
    const __VLS_38 = __VLS_37({
        ...{ class: "chat-record-list" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_37));
    __VLS_39.slots.default;
    const __VLS_40 = {}.ElScrollbar;
    /** @type {[typeof __VLS_components.ElScrollbar, typeof __VLS_components.elScrollbar, typeof __VLS_components.ElScrollbar, typeof __VLS_components.elScrollbar, ]} */ ;
    // @ts-ignore
    const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
        ref: "chatListRef",
        ...{ style: {} },
    }));
    const __VLS_42 = __VLS_41({
        ref: "chatListRef",
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_41));
    /** @type {typeof __VLS_ctx.chatListRef} */ ;
    var __VLS_44 = {};
    __VLS_43.slots.default;
    for (const [viewInfo, index] of __VLS_getVForSourceType((__VLS_ctx.chartInfoList))) {
        /** @type {[typeof ChartSelection, typeof ChartSelection, ]} */ ;
        // @ts-ignore
        const __VLS_46 = __VLS_asFunctionalComponent(ChartSelection, new ChartSelection({
            key: (index),
            viewInfo: (viewInfo),
            selectChange: ((value) => __VLS_ctx.selectChange(value, viewInfo)),
        }));
        const __VLS_47 = __VLS_46({
            key: (index),
            viewInfo: (viewInfo),
            selectChange: ((value) => __VLS_ctx.selectChange(value, viewInfo)),
        }, ...__VLS_functionalComponentArgsRest(__VLS_46));
    }
    var __VLS_43;
    var __VLS_39;
}
var __VLS_35;
var __VLS_12;
{
    const { footer: __VLS_thisSlot } = __VLS_3.slots;
    const __VLS_49 = {}.ElRow;
    /** @type {[typeof __VLS_components.ElRow, typeof __VLS_components.elRow, typeof __VLS_components.ElRow, typeof __VLS_components.elRow, ]} */ ;
    // @ts-ignore
    const __VLS_50 = __VLS_asFunctionalComponent(__VLS_49, new __VLS_49({
        ...{ class: "multiplexing-footer" },
    }));
    const __VLS_51 = __VLS_50({
        ...{ class: "multiplexing-footer" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_50));
    __VLS_52.slots.default;
    const __VLS_53 = {}.ElCol;
    /** @type {[typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ]} */ ;
    // @ts-ignore
    const __VLS_54 = __VLS_asFunctionalComponent(__VLS_53, new __VLS_53({
        ...{ class: "adapt-count" },
    }));
    const __VLS_55 = __VLS_54({
        ...{ class: "adapt-count" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_54));
    __VLS_56.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.t('dashboard.chart_selected', [__VLS_ctx.selectComponentCount]));
    var __VLS_56;
    const __VLS_57 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_58 = __VLS_asFunctionalComponent(__VLS_57, new __VLS_57({
        ...{ 'onClick': {} },
        secondary: true,
        ...{ class: "close-button" },
    }));
    const __VLS_59 = __VLS_58({
        ...{ 'onClick': {} },
        secondary: true,
        ...{ class: "close-button" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_58));
    let __VLS_61;
    let __VLS_62;
    let __VLS_63;
    const __VLS_64 = {
        onClick: (...[$event]) => {
            __VLS_ctx.dialogShow = false;
        }
    };
    __VLS_60.slots.default;
    (__VLS_ctx.t('common.cancel'));
    var __VLS_60;
    const __VLS_65 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_66 = __VLS_asFunctionalComponent(__VLS_65, new __VLS_65({
        ...{ 'onClick': {} },
        type: "primary",
        disabled: (!__VLS_ctx.selectComponentCount),
        ...{ class: "confirm-button" },
    }));
    const __VLS_67 = __VLS_66({
        ...{ 'onClick': {} },
        type: "primary",
        disabled: (!__VLS_ctx.selectComponentCount),
        ...{ class: "confirm-button" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_66));
    let __VLS_69;
    let __VLS_70;
    let __VLS_71;
    const __VLS_72 = {
        onClick: (__VLS_ctx.saveMultiplexing)
    };
    __VLS_68.slots.default;
    (__VLS_ctx.t('common.confirm2'));
    var __VLS_68;
    var __VLS_52;
}
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['chat-container']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-container-left']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-container-right-container']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-list']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-record-list']} */ ;
/** @type {__VLS_StyleScopedClasses['multiplexing-footer']} */ ;
/** @type {__VLS_StyleScopedClasses['adapt-count']} */ ;
/** @type {__VLS_StyleScopedClasses['close-button']} */ ;
/** @type {__VLS_StyleScopedClasses['confirm-button']} */ ;
// @ts-ignore
var __VLS_45 = __VLS_44;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            DashboardChatList: DashboardChatList,
            ChartSelection: ChartSelection,
            dialogShow: dialogShow,
            t: t,
            selectComponentCount: selectComponentCount,
            loading: loading,
            chatList: chatList,
            currentChatId: currentChatId,
            chartInfoList: chartInfoList,
            selectChange: selectChange,
            onClickHistory: onClickHistory,
            saveMultiplexing: saveMultiplexing,
            handleClose: handleClose,
        };
    },
    emits: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {
            ...__VLS_exposed,
        };
    },
    emits: {},
});
; /* PartiallyEnd: #4569/main.vue */
