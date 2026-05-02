import ChartComponent from '@/views/chat/component/ChartComponent.vue';
import { computed, nextTick, ref } from 'vue';
import { useI18n } from 'vue-i18n';
const props = defineProps();
const { t } = useI18n();
const chartObject = computed(() => {
    if (props.message?.record?.chart) {
        return JSON.parse(props.message.record.chart);
    }
    return {};
});
const xAxis = computed(() => {
    const axis = chartObject.value?.axis;
    if (axis?.x) {
        return [axis.x];
    }
    return [];
});
const yAxis = computed(() => {
    const axis = chartObject.value?.axis;
    if (!axis?.y) {
        return [];
    }
    const y = axis.y;
    const multiQuotaValues = axis['multi-quota']?.value || [];
    // 统一处理为数组
    const yArray = Array.isArray(y) ? [...y] : [{ ...y }];
    // 标记 multi-quota
    return yArray.map((item) => ({
        ...item,
        'multi-quota': multiQuotaValues.includes(item.value),
    }));
});
const series = computed(() => {
    const axis = chartObject.value?.axis;
    if (axis?.series) {
        return [axis.series];
    }
    return [];
});
const multiQuotaName = computed(() => {
    return chartObject.value?.axis?.['multi-quota']?.name;
});
const chartRef = ref();
function onTypeChange() {
    nextTick(() => {
        chartRef.value?.destroyChart();
        chartRef.value?.renderChart();
    });
}
function getViewInfo() {
    return {
        chart: {
            columns: chartObject.value?.columns,
            type: props.chartType,
            xAxis: xAxis.value,
            yAxis: yAxis.value,
            series: series.value,
            title: chartObject.value.title,
        },
        data: { data: props.data },
    };
}
function getExcelData() {
    return chartRef.value?.getExcelData();
}
const __VLS_exposed = {
    onTypeChange,
    getViewInfo,
    getExcelData,
};
defineExpose(__VLS_exposed);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
if (__VLS_ctx.message.record?.chart) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "chart-base-container" },
    });
    if (__VLS_ctx.message.record.id && __VLS_ctx.data?.length > 0) {
        /** @type {[typeof ChartComponent, ]} */ ;
        // @ts-ignore
        const __VLS_0 = __VLS_asFunctionalComponent(ChartComponent, new ChartComponent({
            id: (__VLS_ctx.id ?? 'default_chat_id'),
            ref: "chartRef",
            type: (__VLS_ctx.chartType),
            columns: (__VLS_ctx.chartObject?.columns),
            x: (__VLS_ctx.xAxis),
            y: (__VLS_ctx.yAxis),
            series: (__VLS_ctx.series),
            data: (__VLS_ctx.data),
            multiQuotaName: (__VLS_ctx.multiQuotaName),
            showLabel: (__VLS_ctx.showLabel),
        }));
        const __VLS_1 = __VLS_0({
            id: (__VLS_ctx.id ?? 'default_chat_id'),
            ref: "chartRef",
            type: (__VLS_ctx.chartType),
            columns: (__VLS_ctx.chartObject?.columns),
            x: (__VLS_ctx.xAxis),
            y: (__VLS_ctx.yAxis),
            series: (__VLS_ctx.series),
            data: (__VLS_ctx.data),
            multiQuotaName: (__VLS_ctx.multiQuotaName),
            showLabel: (__VLS_ctx.showLabel),
        }, ...__VLS_functionalComponentArgsRest(__VLS_0));
        /** @type {typeof __VLS_ctx.chartRef} */ ;
        var __VLS_3 = {};
        var __VLS_2;
    }
    else {
        const __VLS_5 = {}.ElEmpty;
        /** @type {[typeof __VLS_components.ElEmpty, typeof __VLS_components.elEmpty, ]} */ ;
        // @ts-ignore
        const __VLS_6 = __VLS_asFunctionalComponent(__VLS_5, new __VLS_5({
            description: (__VLS_ctx.loadingData ? __VLS_ctx.t('chat.loading_data') : __VLS_ctx.t('chat.no_data')),
        }));
        const __VLS_7 = __VLS_6({
            description: (__VLS_ctx.loadingData ? __VLS_ctx.t('chat.loading_data') : __VLS_ctx.t('chat.no_data')),
        }, ...__VLS_functionalComponentArgsRest(__VLS_6));
    }
}
/** @type {__VLS_StyleScopedClasses['chart-base-container']} */ ;
// @ts-ignore
var __VLS_4 = __VLS_3;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            ChartComponent: ChartComponent,
            t: t,
            chartObject: chartObject,
            xAxis: xAxis,
            yAxis: yAxis,
            series: series,
            multiQuotaName: multiQuotaName,
            chartRef: chartRef,
        };
    },
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {
            ...__VLS_exposed,
        };
    },
    __typeProps: {},
});
; /* PartiallyEnd: #4569/main.vue */
