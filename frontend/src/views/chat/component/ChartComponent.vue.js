import { computed, nextTick, onMounted, onUnmounted, watch } from 'vue';
import { getChartInstance } from '@/views/chat/component/index.ts';
import { useEmitt } from '@/utils/useEmitt.ts';
const params = withDefaults(defineProps(), {
    data: () => [],
    columns: () => [],
    x: () => [],
    y: () => [],
    series: () => [],
    multiQuotaName: undefined,
    showLabel: false,
});
const chartId = computed(() => {
    return 'chart-component-' + params.id;
});
const axis = computed(() => {
    const _list = [];
    params.columns.forEach((column) => {
        _list.push({ name: column.name, value: column.value });
    });
    params.x.forEach((column) => {
        _list.push({ name: column.name, value: column.value, type: 'x' });
    });
    params.y.forEach((column) => {
        _list.push({
            name: column.name,
            value: column.value,
            type: 'y',
            'multi-quota': column['multi-quota'],
        });
    });
    params.series.forEach((column) => {
        _list.push({ name: column.name, value: column.value, type: 'series' });
    });
    if (params.multiQuotaName) {
        _list.push({
            name: params.multiQuotaName,
            value: params.multiQuotaName,
            type: 'other-info',
            hidden: true,
        });
    }
    return _list;
});
let chartInstance;
function renderChart() {
    chartInstance = getChartInstance(params.type, chartId.value);
    if (chartInstance) {
        chartInstance.showLabel = params.showLabel;
        chartInstance.init(axis.value, params.data);
        chartInstance.render();
    }
}
watch(() => params.showLabel, () => {
    renderChart();
});
function destroyChart() {
    if (chartInstance) {
        chartInstance.destroy();
        chartInstance = undefined;
    }
}
function getExcelData() {
    return {
        axis: axis.value,
        data: params.data,
    };
}
useEmitt({
    name: 'view-render-all',
    callback: renderChart,
});
useEmitt({
    name: `view-render-${params.id}`,
    callback: renderChart,
});
const __VLS_exposed = {
    renderChart,
    destroyChart,
    getExcelData,
};
defineExpose(__VLS_exposed);
onMounted(() => {
    nextTick(() => {
        renderChart();
    });
});
onUnmounted(() => {
    destroyChart();
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    data: () => [],
    columns: () => [],
    x: () => [],
    y: () => [],
    series: () => [],
    multiQuotaName: undefined,
    showLabel: false,
});
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    id: (__VLS_ctx.chartId),
    ...{ class: "chart-container" },
});
/** @type {__VLS_StyleScopedClasses['chart-container']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            chartId: chartId,
        };
    },
    __typeProps: {},
    props: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {
            ...__VLS_exposed,
        };
    },
    __typeProps: {},
    props: {},
});
; /* PartiallyEnd: #4569/main.vue */
