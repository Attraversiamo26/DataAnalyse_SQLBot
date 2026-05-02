import { ref, onMounted, watch } from 'vue';
import { Chart } from '@antv/g2';
const props = defineProps({
    data: {
        type: Array,
        default: () => [],
    },
    chartType: {
        type: String,
        default: 'bar',
    },
    xField: {
        type: String,
        default: 'x',
    },
    yField: {
        type: String,
        default: 'y',
    },
    title: {
        type: String,
        default: '',
    },
});
const chartRef = ref(null);
let chart = null;
const createChart = () => {
    if (!chartRef.value)
        return;
    // 销毁旧图表
    if (chart) {
        chart.destroy();
    }
    // 创建新图表
    chart = new Chart({
        container: chartRef.value,
        width: chartRef.value.clientWidth,
        height: 400,
    });
    // 设置数据
    chart.data(props.data);
    // 设置标题
    if (props.title) {
        chart.title(props.title);
    }
    // 根据图表类型设置配置
    switch (props.chartType) {
        case 'bar':
            chart
                .interval()
                .encode('x', props.xField)
                .encode('y', props.yField)
                .encode('color', props.xField);
            break;
        case 'line':
            chart.line().encode('x', props.xField).encode('y', props.yField).encode('color', props.xField);
            break;
        case 'scatter':
            chart
                .point()
                .encode('x', props.xField)
                .encode('y', props.yField)
                .encode('color', props.xField);
            break;
        case 'pie':
            chart
                .interval()
                .encode('x', props.xField)
                .encode('y', props.yField)
                .encode('color', props.xField)
                .label({ text: (datum) => datum[props.xField] });
            // 饼图使用默认配置
            break;
        case 'heatmap':
            chart.rect().encode('x', props.xField).encode('y', props.yField).encode('color', props.yField);
            break;
    }
    // 渲染图表
    chart.render();
};
onMounted(() => {
    createChart();
});
watch(() => props.data, () => {
    createChart();
}, { deep: true });
watch(() => props.chartType, () => {
    createChart();
});
watch(() => props.xField, () => {
    createChart();
});
watch(() => props.yField, () => {
    createChart();
});
watch(() => props.title, () => {
    createChart();
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "chart-container" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ref: "chartRef",
    ...{ class: "chart" },
});
/** @type {typeof __VLS_ctx.chartRef} */ ;
/** @type {__VLS_StyleScopedClasses['chart-container']} */ ;
/** @type {__VLS_StyleScopedClasses['chart']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            chartRef: chartRef,
        };
    },
    props: {
        data: {
            type: Array,
            default: () => [],
        },
        chartType: {
            type: String,
            default: 'bar',
        },
        xField: {
            type: String,
            default: 'x',
        },
        yField: {
            type: String,
            default: 'y',
        },
        title: {
            type: String,
            default: '',
        },
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    props: {
        data: {
            type: Array,
            default: () => [],
        },
        chartType: {
            type: String,
            default: 'bar',
        },
        xField: {
            type: String,
            default: 'x',
        },
        yField: {
            type: String,
            default: 'y',
        },
        title: {
            type: String,
            default: '',
        },
    },
});
; /* PartiallyEnd: #4569/main.vue */
