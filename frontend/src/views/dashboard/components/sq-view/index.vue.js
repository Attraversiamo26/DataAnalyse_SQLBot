import ChartComponent from '@/views/chat/component/ChartComponent.vue';
import icon_window_mini_outlined from '@/assets/svg/icon_window-mini_outlined.svg';
import SqViewDisplay from '@/views/dashboard/components/sq-view/index.vue';
const props = defineProps({
    viewInfo: {
        type: Object,
        required: true,
    },
    outerId: {
        type: String,
        required: false,
        default: null,
    },
    showPosition: {
        type: String,
        required: false,
        default: 'default',
    },
});
import { computed, nextTick, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import ChartPopover from '@/views/chat/chat-block/ChartPopover.vue';
import ICON_TABLE from '@/assets/svg/chart/icon_form_outlined.svg';
import ICON_COLUMN from '@/assets/svg/chart/icon_dashboard_outlined.svg';
import ICON_BAR from '@/assets/svg/chart/icon_bar_outlined.svg';
import ICON_LINE from '@/assets/svg/chart/icon_chart-line.svg';
import ICON_PIE from '@/assets/svg/chart/icon_pie_outlined.svg';
const { t } = useI18n();
const chartRef = ref(null);
const currentChartType = ref(undefined);
const renderChart = () => {
    //@ts-expect-error eslint-disable-next-line @typescript-eslint/no-unused-expressions
    chartRef.value?.destroyChart();
    //@ts-expect-error eslint-disable-next-line @typescript-eslint/no-unused-expressions
    chartRef.value?.renderChart();
};
const enlargeDialogVisible = ref(false);
const enlargeView = () => {
    enlargeDialogVisible.value = true;
};
const chartTypeList = computed(() => {
    const _list = [];
    if (props.viewInfo.chart) {
        switch (props.viewInfo.chart['sourceType']) {
            case 'table':
                break;
            case 'column':
            case 'bar':
            case 'line':
                _list.push({
                    value: 'column',
                    name: t('chat.chart_type.column'),
                    icon: ICON_COLUMN,
                });
                _list.push({
                    value: 'bar',
                    name: t('chat.chart_type.bar'),
                    icon: ICON_BAR,
                });
                _list.push({
                    value: 'line',
                    name: t('chat.chart_type.line'),
                    icon: ICON_LINE,
                });
                break;
            case 'pie':
                _list.push({
                    value: 'pie',
                    name: t('chat.chart_type.pie'),
                    icon: ICON_PIE,
                });
        }
    }
    return _list;
});
function changeTable() {
    onTypeChange('table');
}
const chartType = computed({
    get() {
        if (currentChartType.value) {
            return currentChartType.value;
        }
        return props.viewInfo.chart['sourceType'] ?? 'table';
    },
    set(v) {
        currentChartType.value = v;
    },
});
function onTypeChange(val) {
    chartType.value = val;
    // eslint-disable-next-line vue/no-mutating-props
    props.viewInfo.chart.type = val;
    nextTick(() => {
        //@ts-expect-error eslint-disable-next-line @typescript-eslint/no-unused-expressions
        chartRef.value?.destroyChart();
        //@ts-expect-error eslint-disable-next-line @typescript-eslint/no-unused-expressions
        chartRef.value?.renderChart();
    });
}
onMounted(() => {
    // eslint-disable-next-line vue/no-mutating-props
    props.viewInfo.chart['sourceType'] =
        props.viewInfo.chart['sourceType'] ?? props.viewInfo.chart.type;
});
const __VLS_exposed = {
    renderChart,
    enlargeView,
};
defineExpose(__VLS_exposed);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['ed-select__wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['ed-select__caret']} */ ;
/** @type {__VLS_StyleScopedClasses['buttons-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['divider']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-select-container']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-select']} */ ;
/** @type {__VLS_StyleScopedClasses['ed-select__wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['ed-select__caret']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "chart-base-container" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "header-bar" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "title" },
});
(__VLS_ctx.viewInfo.chart.title);
if (__VLS_ctx.showPosition === 'multiplexing') {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "buttons-bar" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "chart-select-container" },
    });
    const __VLS_0 = {}.ElTooltip;
    /** @type {[typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ]} */ ;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
        effect: "dark",
        content: (__VLS_ctx.t('chat.type')),
        placement: "top",
    }));
    const __VLS_2 = __VLS_1({
        effect: "dark",
        content: (__VLS_ctx.t('chat.type')),
        placement: "top",
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    __VLS_3.slots.default;
    if (__VLS_ctx.chartTypeList.length > 0) {
        /** @type {[typeof ChartPopover, typeof ChartPopover, ]} */ ;
        // @ts-ignore
        const __VLS_4 = __VLS_asFunctionalComponent(ChartPopover, new ChartPopover({
            ...{ 'onTypeChange': {} },
            chartTypeList: (__VLS_ctx.chartTypeList),
            chartType: (__VLS_ctx.chartType),
            title: (__VLS_ctx.t('chat.type')),
        }));
        const __VLS_5 = __VLS_4({
            ...{ 'onTypeChange': {} },
            chartTypeList: (__VLS_ctx.chartTypeList),
            chartType: (__VLS_ctx.chartType),
            title: (__VLS_ctx.t('chat.type')),
        }, ...__VLS_functionalComponentArgsRest(__VLS_4));
        let __VLS_7;
        let __VLS_8;
        let __VLS_9;
        const __VLS_10 = {
            onTypeChange: (__VLS_ctx.onTypeChange)
        };
        var __VLS_6;
    }
    var __VLS_3;
    const __VLS_11 = {}.ElTooltip;
    /** @type {[typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ]} */ ;
    // @ts-ignore
    const __VLS_12 = __VLS_asFunctionalComponent(__VLS_11, new __VLS_11({
        effect: "dark",
        content: (__VLS_ctx.t('chat.chart_type.table')),
        placement: "top",
    }));
    const __VLS_13 = __VLS_12({
        effect: "dark",
        content: (__VLS_ctx.t('chat.chart_type.table')),
        placement: "top",
    }, ...__VLS_functionalComponentArgsRest(__VLS_12));
    __VLS_14.slots.default;
    const __VLS_15 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_16 = __VLS_asFunctionalComponent(__VLS_15, new __VLS_15({
        ...{ 'onClick': {} },
        ...{ class: "tool-btn" },
        ...{ class: ({ 'chart-active': __VLS_ctx.currentChartType === 'table' }) },
        text: true,
    }));
    const __VLS_17 = __VLS_16({
        ...{ 'onClick': {} },
        ...{ class: "tool-btn" },
        ...{ class: ({ 'chart-active': __VLS_ctx.currentChartType === 'table' }) },
        text: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_16));
    let __VLS_19;
    let __VLS_20;
    let __VLS_21;
    const __VLS_22 = {
        onClick: (__VLS_ctx.changeTable)
    };
    __VLS_18.slots.default;
    const __VLS_23 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_24 = __VLS_asFunctionalComponent(__VLS_23, new __VLS_23({
        size: "16",
    }));
    const __VLS_25 = __VLS_24({
        size: "16",
    }, ...__VLS_functionalComponentArgsRest(__VLS_24));
    __VLS_26.slots.default;
    const __VLS_27 = {}.ICON_TABLE;
    /** @type {[typeof __VLS_components.ICON_TABLE, ]} */ ;
    // @ts-ignore
    const __VLS_28 = __VLS_asFunctionalComponent(__VLS_27, new __VLS_27({}));
    const __VLS_29 = __VLS_28({}, ...__VLS_functionalComponentArgsRest(__VLS_28));
    var __VLS_26;
    var __VLS_18;
    var __VLS_14;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div)({
        ...{ class: "divider" },
    });
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "chart-show-area" },
});
if (__VLS_ctx.viewInfo.status === 'failed') {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "error-info" },
    });
    (__VLS_ctx.viewInfo.message);
}
else if (__VLS_ctx.viewInfo.id) {
    /** @type {[typeof ChartComponent, ]} */ ;
    // @ts-ignore
    const __VLS_31 = __VLS_asFunctionalComponent(ChartComponent, new ChartComponent({
        id: (__VLS_ctx.outerId || __VLS_ctx.viewInfo.id),
        ref: "chartRef",
        type: (__VLS_ctx.chartType),
        columns: (__VLS_ctx.viewInfo.chart.columns),
        x: (__VLS_ctx.viewInfo.chart?.xAxis),
        y: (__VLS_ctx.viewInfo.chart?.yAxis),
        series: (__VLS_ctx.viewInfo.chart?.series),
        data: (__VLS_ctx.viewInfo.data?.data),
        multiQuotaName: (__VLS_ctx.viewInfo.chart?.multiQuotaName),
    }));
    const __VLS_32 = __VLS_31({
        id: (__VLS_ctx.outerId || __VLS_ctx.viewInfo.id),
        ref: "chartRef",
        type: (__VLS_ctx.chartType),
        columns: (__VLS_ctx.viewInfo.chart.columns),
        x: (__VLS_ctx.viewInfo.chart?.xAxis),
        y: (__VLS_ctx.viewInfo.chart?.yAxis),
        series: (__VLS_ctx.viewInfo.chart?.series),
        data: (__VLS_ctx.viewInfo.data?.data),
        multiQuotaName: (__VLS_ctx.viewInfo.chart?.multiQuotaName),
    }, ...__VLS_functionalComponentArgsRest(__VLS_31));
    /** @type {typeof __VLS_ctx.chartRef} */ ;
    var __VLS_34 = {};
    var __VLS_33;
}
if (__VLS_ctx.enlargeDialogVisible) {
    const __VLS_36 = {}.ElDialog;
    /** @type {[typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ]} */ ;
    // @ts-ignore
    const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
        modelValue: (__VLS_ctx.enlargeDialogVisible),
        fullscreen: true,
        showClose: (false),
        ...{ class: "chart-fullscreen-dialog-view" },
        headerClass: "chart-fullscreen-dialog-header-view",
        bodyClass: "chart-fullscreen-dialog-body-view",
    }));
    const __VLS_38 = __VLS_37({
        modelValue: (__VLS_ctx.enlargeDialogVisible),
        fullscreen: true,
        showClose: (false),
        ...{ class: "chart-fullscreen-dialog-view" },
        headerClass: "chart-fullscreen-dialog-header-view",
        bodyClass: "chart-fullscreen-dialog-body-view",
    }, ...__VLS_functionalComponentArgsRest(__VLS_37));
    __VLS_39.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ style: {} },
    });
    const __VLS_40 = {}.ElTooltip;
    /** @type {[typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ]} */ ;
    // @ts-ignore
    const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
        effect: "dark",
        content: (__VLS_ctx.t('dashboard.exit_preview')),
        placement: "top",
    }));
    const __VLS_42 = __VLS_41({
        effect: "dark",
        content: (__VLS_ctx.t('dashboard.exit_preview')),
        placement: "top",
    }, ...__VLS_functionalComponentArgsRest(__VLS_41));
    __VLS_43.slots.default;
    const __VLS_44 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
        ...{ 'onClick': {} },
        ...{ class: "tool-btn" },
        ...{ style: {} },
        text: true,
    }));
    const __VLS_46 = __VLS_45({
        ...{ 'onClick': {} },
        ...{ class: "tool-btn" },
        ...{ style: {} },
        text: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_45));
    let __VLS_48;
    let __VLS_49;
    let __VLS_50;
    const __VLS_51 = {
        onClick: (() => (__VLS_ctx.enlargeDialogVisible = false))
    };
    __VLS_47.slots.default;
    const __VLS_52 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
        size: "16",
    }));
    const __VLS_54 = __VLS_53({
        size: "16",
    }, ...__VLS_functionalComponentArgsRest(__VLS_53));
    __VLS_55.slots.default;
    const __VLS_56 = {}.icon_window_mini_outlined;
    /** @type {[typeof __VLS_components.Icon_window_mini_outlined, typeof __VLS_components.icon_window_mini_outlined, ]} */ ;
    // @ts-ignore
    const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({}));
    const __VLS_58 = __VLS_57({}, ...__VLS_functionalComponentArgsRest(__VLS_57));
    var __VLS_55;
    var __VLS_47;
    var __VLS_43;
    /** @type {[typeof SqViewDisplay, ]} */ ;
    // @ts-ignore
    const __VLS_60 = __VLS_asFunctionalComponent(SqViewDisplay, new SqViewDisplay({
        viewInfo: (__VLS_ctx.viewInfo),
        outerId: ('enlarge-' + __VLS_ctx.viewInfo.id),
    }));
    const __VLS_61 = __VLS_60({
        viewInfo: (__VLS_ctx.viewInfo),
        outerId: ('enlarge-' + __VLS_ctx.viewInfo.id),
    }, ...__VLS_functionalComponentArgsRest(__VLS_60));
    var __VLS_39;
}
/** @type {__VLS_StyleScopedClasses['chart-base-container']} */ ;
/** @type {__VLS_StyleScopedClasses['header-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['title']} */ ;
/** @type {__VLS_StyleScopedClasses['buttons-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-select-container']} */ ;
/** @type {__VLS_StyleScopedClasses['tool-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-active']} */ ;
/** @type {__VLS_StyleScopedClasses['divider']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-show-area']} */ ;
/** @type {__VLS_StyleScopedClasses['error-info']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-fullscreen-dialog-view']} */ ;
/** @type {__VLS_StyleScopedClasses['tool-btn']} */ ;
// @ts-ignore
var __VLS_35 = __VLS_34;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            ChartComponent: ChartComponent,
            icon_window_mini_outlined: icon_window_mini_outlined,
            SqViewDisplay: SqViewDisplay,
            ChartPopover: ChartPopover,
            ICON_TABLE: ICON_TABLE,
            t: t,
            chartRef: chartRef,
            currentChartType: currentChartType,
            enlargeDialogVisible: enlargeDialogVisible,
            chartTypeList: chartTypeList,
            changeTable: changeTable,
            chartType: chartType,
            onTypeChange: onTypeChange,
        };
    },
    props: {
        viewInfo: {
            type: Object,
            required: true,
        },
        outerId: {
            type: String,
            required: false,
            default: null,
        },
        showPosition: {
            type: String,
            required: false,
            default: 'default',
        },
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {
            ...__VLS_exposed,
        };
    },
    props: {
        viewInfo: {
            type: Object,
            required: true,
        },
        outerId: {
            type: String,
            required: false,
            default: null,
        },
        showPosition: {
            type: String,
            required: false,
            default: 'default',
        },
    },
});
; /* PartiallyEnd: #4569/main.vue */
