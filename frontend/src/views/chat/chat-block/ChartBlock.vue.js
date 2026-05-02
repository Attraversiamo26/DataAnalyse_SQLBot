import DisplayChartBlock from '@/views/chat/component/DisplayChartBlock.vue';
import ChartPopover from '@/views/chat/chat-block/ChartPopover.vue';
import { computed, ref, watch } from 'vue';
import { useClipboard } from '@vueuse/core';
import { concat } from 'lodash-es';
import ICON_BAR from '@/assets/svg/chart/icon_bar_outlined.svg';
import ICON_COLUMN from '@/assets/svg/chart/icon_dashboard_outlined.svg';
import ICON_LINE from '@/assets/svg/chart/icon_chart-line.svg';
import ICON_PIE from '@/assets/svg/chart/icon_pie_outlined.svg';
import ICON_TABLE from '@/assets/svg/chart/icon_form_outlined.svg';
import icon_sql_outlined from '@/assets/svg/icon_sql_outlined.svg';
import icon_export_outlined from '@/assets/svg/icon_export_outlined.svg';
import icon_file_image_colorful from '@/assets/svg/icon_file-image_colorful.svg';
import icon_file_excel_colorful from '@/assets/svg/icon_file-excel_colorful.svg';
import icon_into_item_outlined from '@/assets/svg/icon_into-item_outlined.svg';
import icon_window_max_outlined from '@/assets/svg/icon_window-max_outlined.svg';
import icon_window_mini_outlined from '@/assets/svg/icon_window-mini_outlined.svg';
import icon_copy_outlined from '@/assets/svg/icon_copy_outlined.svg';
import ICON_STYLE from '@/assets/svg/icon_style-set_outlined.svg';
import { useI18n } from 'vue-i18n';
import SQLComponent from '@/views/chat/component/SQLComponent.vue';
import { useAssistantStore } from '@/stores/assistant';
import AddViewDashboard from '@/views/dashboard/common/AddViewDashboard.vue';
import html2canvas from 'html2canvas';
import { chatApi } from '@/api/chat';
const props = withDefaults(defineProps(), {
    recordId: undefined,
    isPredict: false,
    chatType: undefined,
    enlarge: false,
    loadingData: false,
});
const { copy } = useClipboard({ legacy: true });
const loading = ref(false);
const { t } = useI18n();
const addViewRef = ref(null);
const emits = defineEmits(['exitFullScreen']);
const dataObject = computed(() => {
    if (props.message?.record?.data) {
        if (typeof props.message?.record?.data === 'string') {
            return JSON.parse(props.message.record.data);
        }
        else {
            return props.message.record.data;
        }
    }
    return {};
});
const assistantStore = useAssistantStore();
const isCompletePage = computed(() => !assistantStore.getAssistant || assistantStore.getEmbedded);
const isAssistant = computed(() => assistantStore.getAssistant);
const chartId = computed(() => props.message?.record?.id + (props.enlarge ? '-fullscreen' : ''));
const data = computed(() => {
    if (props.isPredict) {
        let _list = [];
        if (props.message?.record?.predict_data &&
            typeof props.message?.record?.predict_data === 'string') {
            if (props.message?.record?.predict_data.length > 0 &&
                props.message?.record?.predict_data.trim().startsWith('[') &&
                props.message?.record?.predict_data.trim().endsWith(']')) {
                try {
                    _list = JSON.parse(props.message?.record?.predict_data);
                }
                catch (e) {
                    console.error(e);
                }
            }
        }
        else {
            if (props.message?.record?.predict_data?.length > 0) {
                _list = props.message?.record?.predict_data;
            }
        }
        if (_list.length == 0) {
            return _list;
        }
        if (dataObject.value.data && dataObject.value.data?.length > 0) {
            return concat(dataObject.value.data, _list);
        }
        return _list;
    }
    else {
        return dataObject.value.data;
    }
});
const chartRef = ref();
const chartObject = computed(() => {
    if (props.message?.record?.chart) {
        return JSON.parse(props.message.record.chart);
    }
    return {};
});
const currentChartType = ref(props.chatType ?? chartObject.value.type ?? 'table');
const chartType = computed({
    get() {
        if (currentChartType.value) {
            return currentChartType.value;
        }
        return props.chatType ?? chartObject.value.type ?? 'table';
    },
    set(v) {
        currentChartType.value = v;
    },
});
const chartTypeList = computed(() => {
    const _list = [];
    if (chartObject.value) {
        switch (chartObject.value.type) {
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
function onTypeChange(val) {
    chartType.value = val;
    chartRef.value?.onTypeChange();
}
function reloadChart() {
    chartRef.value?.onTypeChange();
}
const dialogVisible = ref(false);
function openFullScreen() {
    dialogVisible.value = true;
}
function closeFullScreen() {
    emits('exitFullScreen');
}
function onExitFullScreen() {
    dialogVisible.value = false;
}
const sqlShow = ref(false);
function showSql() {
    sqlShow.value = true;
}
const showLabel = ref(false);
function addToDashboard() {
    const recordeInfo = {
        id: '1-1',
        data: {
            data: data.value,
        },
        sql: props.message?.record?.sql,
        datasource: props.message?.record?.datasource,
        chart: {},
    };
    // @ts-expect-error eslint-disable-next-line @typescript-eslint/ban-ts-comment
    const chartBaseInfo = JSON.parse(props.message?.record?.chart);
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
    }
    // @ts-expect-error eslint-disable-next-line @typescript-eslint/ban-ts-comment
    addViewRef.value?.optInit(recordeInfo);
}
function copyText() {
    if (props.message?.record?.sql) {
        copy(props.message.record.sql).then(() => {
            ElMessage.success(t('embedded.copy_successful'));
        });
    }
}
const exportRef = ref();
function exportToExcel() {
    if (chartRef.value && props.recordId) {
        loading.value = true;
        chatApi
            .export2Excel(props.recordId, props.message?.record?.chat_id || 0)
            .then((res) => {
            const blob = new Blob([res], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `${chartObject.value.title ?? 'Excel'}.xlsx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        })
            .catch(async (error) => {
            if (error.response) {
                try {
                    let text = await error.response.data.text();
                    try {
                        text = JSON.parse(text);
                    }
                    finally {
                        ElMessage({
                            message: text,
                            type: 'error',
                            showClose: true,
                        });
                    }
                }
                catch (e) {
                    console.error('Error processing error response:', e);
                }
            }
            else {
                console.error('Other error:', error);
                ElMessage({
                    message: error,
                    type: 'error',
                    showClose: true,
                });
            }
        })
            .finally(() => {
            loading.value = false;
        });
        exportRef.value?.hide();
    }
}
function exportToImage() {
    const obj = document.getElementById('chart-component-' + chartId.value);
    if (obj) {
        html2canvas(obj).then((canvas) => {
            canvas.toBlob(function (blob) {
                if (blob) {
                    const link = document.createElement('a');
                    link.download = (chartObject.value.title ?? 'chart') + '.png'; // Specify filename
                    link.href = URL.createObjectURL(blob);
                    document.body.appendChild(link); // Append to body to make it clickable
                    link.click(); // Programmatically click the link
                    document.body.removeChild(link); // Clean up
                    URL.revokeObjectURL(link.href); // Release the object URL
                }
            }, 'image/png');
        });
    }
    exportRef.value?.hide();
}
const __VLS_exposed = {
    reloadChart,
};
defineExpose(__VLS_exposed);
watch(() => chartObject.value?.type, (val) => {
    if (val) {
        currentChartType.value = val;
    }
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    recordId: undefined,
    isPredict: false,
    chatType: undefined,
    enlarge: false,
    loadingData: false,
});
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['header-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['ed-select__wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['ed-select__caret']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-block']} */ ;
/** @type {__VLS_StyleScopedClasses['input-icon']} */ ;
// CSS variable injection 
// CSS variable injection end 
if (!__VLS_ctx.message.isTyping &&
    ((!__VLS_ctx.isPredict && (__VLS_ctx.message?.record?.sql || __VLS_ctx.message?.record?.chart)) ||
        (__VLS_ctx.isPredict && __VLS_ctx.message?.record?.chart && __VLS_ctx.data.length > 0))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "chart-component-container" },
        ...{ class: ({ 'full-screen': __VLS_ctx.enlarge }) },
    });
    __VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, modifiers: { fullscreen: true, lock: true, }, value: (__VLS_ctx.loading) }, null, null);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "header-bar" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "title" },
    });
    (__VLS_ctx.chartObject.title);
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
        offset: (8),
        content: (__VLS_ctx.t('chat.type')),
        placement: "top",
    }));
    const __VLS_2 = __VLS_1({
        effect: "dark",
        offset: (8),
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
        offset: (8),
        content: (__VLS_ctx.t('chat.chart_type.table')),
        placement: "top",
    }));
    const __VLS_13 = __VLS_12({
        effect: "dark",
        offset: (8),
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
    if (__VLS_ctx.currentChartType !== 'table') {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "chart-select-container" },
        });
        const __VLS_31 = {}.ElTooltip;
        /** @type {[typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ]} */ ;
        // @ts-ignore
        const __VLS_32 = __VLS_asFunctionalComponent(__VLS_31, new __VLS_31({
            effect: "dark",
            offset: (8),
            content: (__VLS_ctx.showLabel ? __VLS_ctx.t('chat.hide_label') : __VLS_ctx.t('chat.show_label')),
            placement: "top",
        }));
        const __VLS_33 = __VLS_32({
            effect: "dark",
            offset: (8),
            content: (__VLS_ctx.showLabel ? __VLS_ctx.t('chat.hide_label') : __VLS_ctx.t('chat.show_label')),
            placement: "top",
        }, ...__VLS_functionalComponentArgsRest(__VLS_32));
        __VLS_34.slots.default;
        const __VLS_35 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_36 = __VLS_asFunctionalComponent(__VLS_35, new __VLS_35({
            ...{ 'onClick': {} },
            ...{ class: "tool-btn" },
            ...{ class: ({ 'chart-active': __VLS_ctx.showLabel }) },
            text: true,
        }));
        const __VLS_37 = __VLS_36({
            ...{ 'onClick': {} },
            ...{ class: "tool-btn" },
            ...{ class: ({ 'chart-active': __VLS_ctx.showLabel }) },
            text: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_36));
        let __VLS_39;
        let __VLS_40;
        let __VLS_41;
        const __VLS_42 = {
            onClick: (...[$event]) => {
                if (!(!__VLS_ctx.message.isTyping &&
                    ((!__VLS_ctx.isPredict && (__VLS_ctx.message?.record?.sql || __VLS_ctx.message?.record?.chart)) ||
                        (__VLS_ctx.isPredict && __VLS_ctx.message?.record?.chart && __VLS_ctx.data.length > 0))))
                    return;
                if (!(__VLS_ctx.currentChartType !== 'table'))
                    return;
                __VLS_ctx.showLabel = !__VLS_ctx.showLabel;
            }
        };
        __VLS_38.slots.default;
        const __VLS_43 = {}.ElIcon;
        /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
        // @ts-ignore
        const __VLS_44 = __VLS_asFunctionalComponent(__VLS_43, new __VLS_43({
            size: "16",
        }));
        const __VLS_45 = __VLS_44({
            size: "16",
        }, ...__VLS_functionalComponentArgsRest(__VLS_44));
        __VLS_46.slots.default;
        const __VLS_47 = {}.ICON_STYLE;
        /** @type {[typeof __VLS_components.ICON_STYLE, ]} */ ;
        // @ts-ignore
        const __VLS_48 = __VLS_asFunctionalComponent(__VLS_47, new __VLS_47({}));
        const __VLS_49 = __VLS_48({}, ...__VLS_functionalComponentArgsRest(__VLS_48));
        var __VLS_46;
        var __VLS_38;
        var __VLS_34;
    }
    if (__VLS_ctx.message?.record?.sql) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        const __VLS_51 = {}.ElTooltip;
        /** @type {[typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ]} */ ;
        // @ts-ignore
        const __VLS_52 = __VLS_asFunctionalComponent(__VLS_51, new __VLS_51({
            effect: "dark",
            offset: (8),
            content: (__VLS_ctx.t('chat.show_sql')),
            placement: "top",
        }));
        const __VLS_53 = __VLS_52({
            effect: "dark",
            offset: (8),
            content: (__VLS_ctx.t('chat.show_sql')),
            placement: "top",
        }, ...__VLS_functionalComponentArgsRest(__VLS_52));
        __VLS_54.slots.default;
        const __VLS_55 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_56 = __VLS_asFunctionalComponent(__VLS_55, new __VLS_55({
            ...{ 'onClick': {} },
            ...{ class: "tool-btn" },
            text: true,
        }));
        const __VLS_57 = __VLS_56({
            ...{ 'onClick': {} },
            ...{ class: "tool-btn" },
            text: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_56));
        let __VLS_59;
        let __VLS_60;
        let __VLS_61;
        const __VLS_62 = {
            onClick: (__VLS_ctx.showSql)
        };
        __VLS_58.slots.default;
        const __VLS_63 = {}.ElIcon;
        /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
        // @ts-ignore
        const __VLS_64 = __VLS_asFunctionalComponent(__VLS_63, new __VLS_63({
            size: "16",
        }));
        const __VLS_65 = __VLS_64({
            size: "16",
        }, ...__VLS_functionalComponentArgsRest(__VLS_64));
        __VLS_66.slots.default;
        const __VLS_67 = {}.icon_sql_outlined;
        /** @type {[typeof __VLS_components.Icon_sql_outlined, typeof __VLS_components.icon_sql_outlined, ]} */ ;
        // @ts-ignore
        const __VLS_68 = __VLS_asFunctionalComponent(__VLS_67, new __VLS_67({}));
        const __VLS_69 = __VLS_68({}, ...__VLS_functionalComponentArgsRest(__VLS_68));
        var __VLS_66;
        var __VLS_58;
        var __VLS_54;
    }
    if (__VLS_ctx.message?.record?.chart) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        const __VLS_71 = {}.ElPopover;
        /** @type {[typeof __VLS_components.ElPopover, typeof __VLS_components.elPopover, typeof __VLS_components.ElPopover, typeof __VLS_components.elPopover, ]} */ ;
        // @ts-ignore
        const __VLS_72 = __VLS_asFunctionalComponent(__VLS_71, new __VLS_71({
            ref: "exportRef",
            trigger: "click",
            popperClass: "export_to_select",
            placement: "bottom",
        }));
        const __VLS_73 = __VLS_72({
            ref: "exportRef",
            trigger: "click",
            popperClass: "export_to_select",
            placement: "bottom",
        }, ...__VLS_functionalComponentArgsRest(__VLS_72));
        /** @type {typeof __VLS_ctx.exportRef} */ ;
        var __VLS_75 = {};
        __VLS_74.slots.default;
        {
            const { reference: __VLS_thisSlot } = __VLS_74.slots;
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
            const __VLS_77 = {}.ElTooltip;
            /** @type {[typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ]} */ ;
            // @ts-ignore
            const __VLS_78 = __VLS_asFunctionalComponent(__VLS_77, new __VLS_77({
                effect: "dark",
                offset: (8),
                content: (__VLS_ctx.t('chat.export_to')),
                placement: "top",
            }));
            const __VLS_79 = __VLS_78({
                effect: "dark",
                offset: (8),
                content: (__VLS_ctx.t('chat.export_to')),
                placement: "top",
            }, ...__VLS_functionalComponentArgsRest(__VLS_78));
            __VLS_80.slots.default;
            const __VLS_81 = {}.ElButton;
            /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
            // @ts-ignore
            const __VLS_82 = __VLS_asFunctionalComponent(__VLS_81, new __VLS_81({
                ...{ class: "tool-btn" },
                text: true,
            }));
            const __VLS_83 = __VLS_82({
                ...{ class: "tool-btn" },
                text: true,
            }, ...__VLS_functionalComponentArgsRest(__VLS_82));
            __VLS_84.slots.default;
            const __VLS_85 = {}.ElIcon;
            /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
            // @ts-ignore
            const __VLS_86 = __VLS_asFunctionalComponent(__VLS_85, new __VLS_85({
                size: "16",
            }));
            const __VLS_87 = __VLS_86({
                size: "16",
            }, ...__VLS_functionalComponentArgsRest(__VLS_86));
            __VLS_88.slots.default;
            const __VLS_89 = {}.icon_export_outlined;
            /** @type {[typeof __VLS_components.Icon_export_outlined, typeof __VLS_components.icon_export_outlined, ]} */ ;
            // @ts-ignore
            const __VLS_90 = __VLS_asFunctionalComponent(__VLS_89, new __VLS_89({}));
            const __VLS_91 = __VLS_90({}, ...__VLS_functionalComponentArgsRest(__VLS_90));
            var __VLS_88;
            var __VLS_84;
            var __VLS_80;
        }
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "popover" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "popover-content" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "title" },
        });
        (__VLS_ctx.t('chat.export_to'));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ onClick: (__VLS_ctx.exportToExcel) },
            ...{ class: "popover-item" },
        });
        const __VLS_93 = {}.ElIcon;
        /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
        // @ts-ignore
        const __VLS_94 = __VLS_asFunctionalComponent(__VLS_93, new __VLS_93({
            size: "16",
        }));
        const __VLS_95 = __VLS_94({
            size: "16",
        }, ...__VLS_functionalComponentArgsRest(__VLS_94));
        __VLS_96.slots.default;
        const __VLS_97 = {}.icon_file_excel_colorful;
        /** @type {[typeof __VLS_components.Icon_file_excel_colorful, typeof __VLS_components.icon_file_excel_colorful, ]} */ ;
        // @ts-ignore
        const __VLS_98 = __VLS_asFunctionalComponent(__VLS_97, new __VLS_97({}));
        const __VLS_99 = __VLS_98({}, ...__VLS_functionalComponentArgsRest(__VLS_98));
        var __VLS_96;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "model-name" },
        });
        (__VLS_ctx.t('chat.excel'));
        if (__VLS_ctx.currentChartType !== 'table') {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ onClick: (__VLS_ctx.exportToImage) },
                ...{ class: "popover-item" },
            });
            const __VLS_101 = {}.ElIcon;
            /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
            // @ts-ignore
            const __VLS_102 = __VLS_asFunctionalComponent(__VLS_101, new __VLS_101({
                size: "16",
            }));
            const __VLS_103 = __VLS_102({
                size: "16",
            }, ...__VLS_functionalComponentArgsRest(__VLS_102));
            __VLS_104.slots.default;
            const __VLS_105 = {}.icon_file_image_colorful;
            /** @type {[typeof __VLS_components.Icon_file_image_colorful, typeof __VLS_components.icon_file_image_colorful, ]} */ ;
            // @ts-ignore
            const __VLS_106 = __VLS_asFunctionalComponent(__VLS_105, new __VLS_105({}));
            const __VLS_107 = __VLS_106({}, ...__VLS_functionalComponentArgsRest(__VLS_106));
            var __VLS_104;
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "model-name" },
            });
            (__VLS_ctx.t('chat.picture'));
        }
        var __VLS_74;
    }
    if (__VLS_ctx.message?.record?.chart && !__VLS_ctx.isAssistant) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        const __VLS_109 = {}.ElTooltip;
        /** @type {[typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ]} */ ;
        // @ts-ignore
        const __VLS_110 = __VLS_asFunctionalComponent(__VLS_109, new __VLS_109({
            effect: "dark",
            content: (__VLS_ctx.t('chat.add_to_dashboard')),
            placement: "top",
        }));
        const __VLS_111 = __VLS_110({
            effect: "dark",
            content: (__VLS_ctx.t('chat.add_to_dashboard')),
            placement: "top",
        }, ...__VLS_functionalComponentArgsRest(__VLS_110));
        __VLS_112.slots.default;
        const __VLS_113 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_114 = __VLS_asFunctionalComponent(__VLS_113, new __VLS_113({
            ...{ 'onClick': {} },
            ...{ class: "tool-btn" },
            text: true,
        }));
        const __VLS_115 = __VLS_114({
            ...{ 'onClick': {} },
            ...{ class: "tool-btn" },
            text: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_114));
        let __VLS_117;
        let __VLS_118;
        let __VLS_119;
        const __VLS_120 = {
            onClick: (__VLS_ctx.addToDashboard)
        };
        __VLS_116.slots.default;
        const __VLS_121 = {}.ElIcon;
        /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
        // @ts-ignore
        const __VLS_122 = __VLS_asFunctionalComponent(__VLS_121, new __VLS_121({
            size: "16",
        }));
        const __VLS_123 = __VLS_122({
            size: "16",
        }, ...__VLS_functionalComponentArgsRest(__VLS_122));
        __VLS_124.slots.default;
        const __VLS_125 = {}.icon_into_item_outlined;
        /** @type {[typeof __VLS_components.Icon_into_item_outlined, typeof __VLS_components.icon_into_item_outlined, ]} */ ;
        // @ts-ignore
        const __VLS_126 = __VLS_asFunctionalComponent(__VLS_125, new __VLS_125({}));
        const __VLS_127 = __VLS_126({}, ...__VLS_functionalComponentArgsRest(__VLS_126));
        var __VLS_124;
        var __VLS_116;
        var __VLS_112;
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div)({
        ...{ class: "divider" },
    });
    if (!__VLS_ctx.enlarge) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        const __VLS_129 = {}.ElTooltip;
        /** @type {[typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ]} */ ;
        // @ts-ignore
        const __VLS_130 = __VLS_asFunctionalComponent(__VLS_129, new __VLS_129({
            effect: "dark",
            offset: (8),
            content: (!__VLS_ctx.isCompletePage ? __VLS_ctx.$t('common.zoom_in') : __VLS_ctx.t('chat.full_screen')),
            placement: "top",
        }));
        const __VLS_131 = __VLS_130({
            effect: "dark",
            offset: (8),
            content: (!__VLS_ctx.isCompletePage ? __VLS_ctx.$t('common.zoom_in') : __VLS_ctx.t('chat.full_screen')),
            placement: "top",
        }, ...__VLS_functionalComponentArgsRest(__VLS_130));
        __VLS_132.slots.default;
        const __VLS_133 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_134 = __VLS_asFunctionalComponent(__VLS_133, new __VLS_133({
            ...{ 'onClick': {} },
            ...{ class: "tool-btn" },
            text: true,
        }));
        const __VLS_135 = __VLS_134({
            ...{ 'onClick': {} },
            ...{ class: "tool-btn" },
            text: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_134));
        let __VLS_137;
        let __VLS_138;
        let __VLS_139;
        const __VLS_140 = {
            onClick: (__VLS_ctx.openFullScreen)
        };
        __VLS_136.slots.default;
        const __VLS_141 = {}.ElIcon;
        /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
        // @ts-ignore
        const __VLS_142 = __VLS_asFunctionalComponent(__VLS_141, new __VLS_141({
            size: "16",
        }));
        const __VLS_143 = __VLS_142({
            size: "16",
        }, ...__VLS_functionalComponentArgsRest(__VLS_142));
        __VLS_144.slots.default;
        const __VLS_145 = {}.icon_window_max_outlined;
        /** @type {[typeof __VLS_components.Icon_window_max_outlined, typeof __VLS_components.icon_window_max_outlined, ]} */ ;
        // @ts-ignore
        const __VLS_146 = __VLS_asFunctionalComponent(__VLS_145, new __VLS_145({}));
        const __VLS_147 = __VLS_146({}, ...__VLS_functionalComponentArgsRest(__VLS_146));
        var __VLS_144;
        var __VLS_136;
        var __VLS_132;
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        const __VLS_149 = {}.ElTooltip;
        /** @type {[typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, typeof __VLS_components.ElTooltip, typeof __VLS_components.elTooltip, ]} */ ;
        // @ts-ignore
        const __VLS_150 = __VLS_asFunctionalComponent(__VLS_149, new __VLS_149({
            effect: "dark",
            offset: (8),
            content: (!__VLS_ctx.isCompletePage ? __VLS_ctx.$t('common.zoom_out') : __VLS_ctx.t('chat.exit_full_screen')),
            placement: "top",
        }));
        const __VLS_151 = __VLS_150({
            effect: "dark",
            offset: (8),
            content: (!__VLS_ctx.isCompletePage ? __VLS_ctx.$t('common.zoom_out') : __VLS_ctx.t('chat.exit_full_screen')),
            placement: "top",
        }, ...__VLS_functionalComponentArgsRest(__VLS_150));
        __VLS_152.slots.default;
        const __VLS_153 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_154 = __VLS_asFunctionalComponent(__VLS_153, new __VLS_153({
            ...{ 'onClick': {} },
            ...{ class: "tool-btn" },
            text: true,
        }));
        const __VLS_155 = __VLS_154({
            ...{ 'onClick': {} },
            ...{ class: "tool-btn" },
            text: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_154));
        let __VLS_157;
        let __VLS_158;
        let __VLS_159;
        const __VLS_160 = {
            onClick: (__VLS_ctx.closeFullScreen)
        };
        __VLS_156.slots.default;
        const __VLS_161 = {}.ElIcon;
        /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
        // @ts-ignore
        const __VLS_162 = __VLS_asFunctionalComponent(__VLS_161, new __VLS_161({
            size: "16",
        }));
        const __VLS_163 = __VLS_162({
            size: "16",
        }, ...__VLS_functionalComponentArgsRest(__VLS_162));
        __VLS_164.slots.default;
        const __VLS_165 = {}.icon_window_mini_outlined;
        /** @type {[typeof __VLS_components.Icon_window_mini_outlined, typeof __VLS_components.icon_window_mini_outlined, ]} */ ;
        // @ts-ignore
        const __VLS_166 = __VLS_asFunctionalComponent(__VLS_165, new __VLS_165({}));
        const __VLS_167 = __VLS_166({}, ...__VLS_functionalComponentArgsRest(__VLS_166));
        var __VLS_164;
        var __VLS_156;
        var __VLS_152;
    }
    if (__VLS_ctx.message?.record?.chart) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "chart-block" },
        });
        /** @type {[typeof DisplayChartBlock, ]} */ ;
        // @ts-ignore
        const __VLS_169 = __VLS_asFunctionalComponent(DisplayChartBlock, new DisplayChartBlock({
            id: (__VLS_ctx.chartId),
            ref: "chartRef",
            chartType: (__VLS_ctx.chartType),
            message: (__VLS_ctx.message),
            data: (__VLS_ctx.data),
            loadingData: (__VLS_ctx.loadingData),
            showLabel: (__VLS_ctx.showLabel),
        }));
        const __VLS_170 = __VLS_169({
            id: (__VLS_ctx.chartId),
            ref: "chartRef",
            chartType: (__VLS_ctx.chartType),
            message: (__VLS_ctx.message),
            data: (__VLS_ctx.data),
            loadingData: (__VLS_ctx.loadingData),
            showLabel: (__VLS_ctx.showLabel),
        }, ...__VLS_functionalComponentArgsRest(__VLS_169));
        /** @type {typeof __VLS_ctx.chartRef} */ ;
        var __VLS_172 = {};
        var __VLS_171;
        if (__VLS_ctx.dataObject.limit) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "over-limit-hint" },
            });
            (__VLS_ctx.t('chat.data_over_limit', [__VLS_ctx.dataObject.limit]));
        }
    }
    /** @type {[typeof AddViewDashboard, typeof AddViewDashboard, ]} */ ;
    // @ts-ignore
    const __VLS_174 = __VLS_asFunctionalComponent(AddViewDashboard, new AddViewDashboard({
        ref: "addViewRef",
    }));
    const __VLS_175 = __VLS_174({
        ref: "addViewRef",
    }, ...__VLS_functionalComponentArgsRest(__VLS_174));
    /** @type {typeof __VLS_ctx.addViewRef} */ ;
    var __VLS_177 = {};
    var __VLS_176;
    if (!__VLS_ctx.enlarge) {
        const __VLS_179 = {}.ElDialog;
        /** @type {[typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ]} */ ;
        // @ts-ignore
        const __VLS_180 = __VLS_asFunctionalComponent(__VLS_179, new __VLS_179({
            modelValue: (__VLS_ctx.dialogVisible),
            fullscreen: true,
            showClose: (false),
            ...{ class: "chart-fullscreen-dialog" },
            headerClass: "chart-fullscreen-dialog-header",
            bodyClass: "chart-fullscreen-dialog-body",
        }));
        const __VLS_181 = __VLS_180({
            modelValue: (__VLS_ctx.dialogVisible),
            fullscreen: true,
            showClose: (false),
            ...{ class: "chart-fullscreen-dialog" },
            headerClass: "chart-fullscreen-dialog-header",
            bodyClass: "chart-fullscreen-dialog-body",
        }, ...__VLS_functionalComponentArgsRest(__VLS_180));
        __VLS_182.slots.default;
        if (__VLS_ctx.dialogVisible) {
            const __VLS_183 = {}.ChartBlock;
            /** @type {[typeof __VLS_components.ChartBlock, ]} */ ;
            // @ts-ignore
            const __VLS_184 = __VLS_asFunctionalComponent(__VLS_183, new __VLS_183({
                ...{ 'onExitFullScreen': {} },
                message: (__VLS_ctx.message),
                recordId: (__VLS_ctx.recordId),
                isPredict: (__VLS_ctx.isPredict),
                chatType: (__VLS_ctx.chartType),
                loadingData: (__VLS_ctx.loadingData),
                enlarge: true,
            }));
            const __VLS_185 = __VLS_184({
                ...{ 'onExitFullScreen': {} },
                message: (__VLS_ctx.message),
                recordId: (__VLS_ctx.recordId),
                isPredict: (__VLS_ctx.isPredict),
                chatType: (__VLS_ctx.chartType),
                loadingData: (__VLS_ctx.loadingData),
                enlarge: true,
            }, ...__VLS_functionalComponentArgsRest(__VLS_184));
            let __VLS_187;
            let __VLS_188;
            let __VLS_189;
            const __VLS_190 = {
                onExitFullScreen: (__VLS_ctx.onExitFullScreen)
            };
            var __VLS_186;
        }
        var __VLS_182;
    }
    const __VLS_191 = {}.ElDrawer;
    /** @type {[typeof __VLS_components.ElDrawer, typeof __VLS_components.elDrawer, typeof __VLS_components.ElDrawer, typeof __VLS_components.elDrawer, ]} */ ;
    // @ts-ignore
    const __VLS_192 = __VLS_asFunctionalComponent(__VLS_191, new __VLS_191({
        modelValue: (__VLS_ctx.sqlShow),
        size: (!__VLS_ctx.isCompletePage ? '100%' : '600px'),
        title: (__VLS_ctx.t('chat.show_sql')),
        direction: "rtl",
        bodyClass: "chart-sql-drawer-body",
    }));
    const __VLS_193 = __VLS_192({
        modelValue: (__VLS_ctx.sqlShow),
        size: (!__VLS_ctx.isCompletePage ? '100%' : '600px'),
        title: (__VLS_ctx.t('chat.show_sql')),
        direction: "rtl",
        bodyClass: "chart-sql-drawer-body",
    }, ...__VLS_functionalComponentArgsRest(__VLS_192));
    __VLS_194.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "sql-block" },
    });
    if (__VLS_ctx.message.record?.sql) {
        /** @type {[typeof SQLComponent, ]} */ ;
        // @ts-ignore
        const __VLS_195 = __VLS_asFunctionalComponent(SQLComponent, new SQLComponent({
            sql: (__VLS_ctx.message.record?.sql),
            ...{ style: {} },
        }));
        const __VLS_196 = __VLS_195({
            sql: (__VLS_ctx.message.record?.sql),
            ...{ style: {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_195));
    }
    if (__VLS_ctx.message.record?.sql) {
        const __VLS_198 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_199 = __VLS_asFunctionalComponent(__VLS_198, new __VLS_198({
            ...{ 'onClick': {} },
            circle: true,
            ...{ class: "input-icon" },
        }));
        const __VLS_200 = __VLS_199({
            ...{ 'onClick': {} },
            circle: true,
            ...{ class: "input-icon" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_199));
        let __VLS_202;
        let __VLS_203;
        let __VLS_204;
        const __VLS_205 = {
            onClick: (__VLS_ctx.copyText)
        };
        __VLS_201.slots.default;
        const __VLS_206 = {}.ElIcon;
        /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
        // @ts-ignore
        const __VLS_207 = __VLS_asFunctionalComponent(__VLS_206, new __VLS_206({
            size: "16",
        }));
        const __VLS_208 = __VLS_207({
            size: "16",
        }, ...__VLS_functionalComponentArgsRest(__VLS_207));
        __VLS_209.slots.default;
        const __VLS_210 = {}.icon_copy_outlined;
        /** @type {[typeof __VLS_components.Icon_copy_outlined, typeof __VLS_components.icon_copy_outlined, ]} */ ;
        // @ts-ignore
        const __VLS_211 = __VLS_asFunctionalComponent(__VLS_210, new __VLS_210({}));
        const __VLS_212 = __VLS_211({}, ...__VLS_functionalComponentArgsRest(__VLS_211));
        var __VLS_209;
        var __VLS_201;
    }
    var __VLS_194;
}
/** @type {__VLS_StyleScopedClasses['chart-component-container']} */ ;
/** @type {__VLS_StyleScopedClasses['full-screen']} */ ;
/** @type {__VLS_StyleScopedClasses['header-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['title']} */ ;
/** @type {__VLS_StyleScopedClasses['buttons-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-select-container']} */ ;
/** @type {__VLS_StyleScopedClasses['tool-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-active']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-select-container']} */ ;
/** @type {__VLS_StyleScopedClasses['tool-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-active']} */ ;
/** @type {__VLS_StyleScopedClasses['tool-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['tool-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['popover']} */ ;
/** @type {__VLS_StyleScopedClasses['popover-content']} */ ;
/** @type {__VLS_StyleScopedClasses['title']} */ ;
/** @type {__VLS_StyleScopedClasses['popover-item']} */ ;
/** @type {__VLS_StyleScopedClasses['model-name']} */ ;
/** @type {__VLS_StyleScopedClasses['popover-item']} */ ;
/** @type {__VLS_StyleScopedClasses['model-name']} */ ;
/** @type {__VLS_StyleScopedClasses['tool-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['divider']} */ ;
/** @type {__VLS_StyleScopedClasses['tool-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['tool-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-block']} */ ;
/** @type {__VLS_StyleScopedClasses['over-limit-hint']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-fullscreen-dialog']} */ ;
/** @type {__VLS_StyleScopedClasses['sql-block']} */ ;
/** @type {__VLS_StyleScopedClasses['input-icon']} */ ;
// @ts-ignore
var __VLS_76 = __VLS_75, __VLS_173 = __VLS_172, __VLS_178 = __VLS_177;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            DisplayChartBlock: DisplayChartBlock,
            ChartPopover: ChartPopover,
            ICON_TABLE: ICON_TABLE,
            icon_sql_outlined: icon_sql_outlined,
            icon_export_outlined: icon_export_outlined,
            icon_file_image_colorful: icon_file_image_colorful,
            icon_file_excel_colorful: icon_file_excel_colorful,
            icon_into_item_outlined: icon_into_item_outlined,
            icon_window_max_outlined: icon_window_max_outlined,
            icon_window_mini_outlined: icon_window_mini_outlined,
            icon_copy_outlined: icon_copy_outlined,
            ICON_STYLE: ICON_STYLE,
            SQLComponent: SQLComponent,
            AddViewDashboard: AddViewDashboard,
            loading: loading,
            t: t,
            addViewRef: addViewRef,
            dataObject: dataObject,
            isCompletePage: isCompletePage,
            isAssistant: isAssistant,
            chartId: chartId,
            data: data,
            chartRef: chartRef,
            chartObject: chartObject,
            currentChartType: currentChartType,
            chartType: chartType,
            chartTypeList: chartTypeList,
            changeTable: changeTable,
            onTypeChange: onTypeChange,
            dialogVisible: dialogVisible,
            openFullScreen: openFullScreen,
            closeFullScreen: closeFullScreen,
            onExitFullScreen: onExitFullScreen,
            sqlShow: sqlShow,
            showSql: showSql,
            showLabel: showLabel,
            addToDashboard: addToDashboard,
            copyText: copyText,
            exportRef: exportRef,
            exportToExcel: exportToExcel,
            exportToImage: exportToImage,
        };
    },
    emits: {},
    __typeProps: {},
    props: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {
            ...__VLS_exposed,
        };
    },
    emits: {},
    __typeProps: {},
    props: {},
});
; /* PartiallyEnd: #4569/main.vue */
