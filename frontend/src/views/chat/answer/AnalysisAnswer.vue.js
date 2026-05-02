import BaseAnswer from './BaseAnswer.vue';
import { chatApi, ChatInfo } from '@/api/chat.ts';
import { computed, nextTick, onBeforeUnmount, ref, withDefaults, defineProps, defineEmits } from 'vue';
import MdComponent from '@/views/chat/component/MdComponent.vue';
import { ElTag, ElStatistic, ElTable, ElTableColumn, ElCard, ElCollapse, ElCollapseItem } from 'element-plus';
const props = withDefaults(defineProps(), {
    chatList: () => [],
    currentChatId: undefined,
    currentChat: () => new ChatInfo(),
    message: undefined,
    loading: false,
});
const emits = defineEmits([
    'finish',
    'error',
    'stop',
    'update:loading',
    'update:chatList',
    'update:currentChat',
    'update:currentChatId',
]);
const index = computed(() => {
    if (props.message?.index) {
        return props.message.index;
    }
    if (props.message?.index === 0) {
        return 0;
    }
    return -1;
});
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
const _loading = computed({
    get() {
        return props.loading;
    },
    set(v) {
        emits('update:loading', v);
    },
});
const stopFlag = ref(false);
const parsedAnalysisResult = computed(() => {
    const analysisResult = props.message?.record?.data || props.message?.record?.analysis;
    if (!analysisResult)
        return {};
    try {
        return typeof analysisResult === 'string'
            ? JSON.parse(analysisResult)
            : analysisResult;
    }
    catch (error) {
        console.error('解析分析结果失败:', error);
        return {};
    }
});
const analysisType = computed(() => parsedAnalysisResult.value.analysis_type || '');
const isDescriptiveAnalysis = computed(() => analysisType.value === 'descriptive');
const isCorrelationAnalysis = computed(() => analysisType.value === 'correlation');
const isDistributionAnalysis = computed(() => analysisType.value === 'distribution');
const isAnomalyAnalysis = computed(() => analysisType.value === 'anomaly');
const isTrendAnalysis = computed(() => analysisType.value === 'trend');
const isTimeSeriesAnalysis = computed(() => analysisType.value === 'time_series');
const isPredictionAnalysis = computed(() => analysisType.value === 'prediction');
const isClusteringAnalysis = computed(() => analysisType.value === 'clustering');
const isRegressionAnalysis = computed(() => analysisType.value === 'regression');
const isClassificationAnalysis = computed(() => analysisType.value === 'classification');
const analysisTypeLabel = computed(() => {
    const typeLabels = {
        'descriptive': '描述性统计分析',
        'correlation': '相关性分析',
        'distribution': '分布分析',
        'anomaly': '异常检测分析',
        'trend': '趋势分析',
        'time_series': '时间序列分析',
        'prediction': '预测分析',
        'clustering': '聚类分析',
        'regression': '回归分析',
        'classification': '分类分析'
    };
    return typeLabels[analysisType.value] || analysisType.value;
});
const correlationColumns = computed(() => {
    if (!parsedAnalysisResult.value.columns)
        return [];
    return parsedAnalysisResult.value.columns;
});
const correlationMatrixData = computed(() => {
    if (!parsedAnalysisResult.value.correlation_matrix)
        return [];
    const matrix = parsedAnalysisResult.value.correlation_matrix;
    return Object.entries(matrix).map(([column, values]) => ({
        column,
        ...values
    }));
});
const formatStatKey = (key) => {
    const keyMap = {
        'mean': '均值',
        'std': '标准差',
        'min': '最小值',
        'max': '最大值',
        'median': '中位数',
        'count': '计数',
        'unique': '唯一值',
        'top': '众数',
        'freq': '众数频率',
        'skew': '偏度',
        'kurt': '峰度',
        'sum': '总和',
        '25%': '25%分位数',
        '50%': '中位数',
        '75%': '75%分位数',
        'variance': '方差'
    };
    return keyMap[key] || key;
};
const getCorrelationClass = (value) => {
    if (value > 0.7)
        return 'correlation-high-positive';
    if (value > 0.3)
        return 'correlation-moderate-positive';
    if (value > -0.3)
        return 'correlation-weak';
    if (value > -0.7)
        return 'correlation-moderate-negative';
    return 'correlation-high-negative';
};
const sendMessage = async () => {
    stopFlag.value = false;
    _loading.value = true;
    if (index.value < 0) {
        _loading.value = false;
        return;
    }
    const currentRecord = _currentChat.value.records[index.value];
    let error = false;
    if (_currentChatId.value === undefined || currentRecord.analysis_record_id === undefined) {
        error = true;
    }
    if (error) {
        _loading.value = false;
        emits('error', currentRecord.id || null);
        return;
    }
    try {
        const controller = new AbortController();
        const response = await chatApi.analysis(currentRecord.analysis_record_id, controller);
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let analysis_answer = '';
        let analysis_answer_thinking = '';
        let tempResult = '';
        while (true) {
            if (stopFlag.value) {
                controller.abort();
                _loading.value = false;
                break;
            }
            const { done, value } = await reader.read();
            if (done) {
                _loading.value = false;
                break;
            }
            let chunk = decoder.decode(value, { stream: true });
            tempResult += chunk;
            const split = tempResult.match(/data:.*}\n\n/g);
            if (split) {
                chunk = split.join('');
                tempResult = tempResult.replace(chunk, '');
            }
            else {
                continue;
            }
            if (chunk && chunk.startsWith('data:{')) {
                if (split) {
                    for (const str of split) {
                        let data;
                        try {
                            data = JSON.parse(str.replace('data:{', '{'));
                        }
                        catch (err) {
                            console.error('JSON string:', str);
                            throw err;
                        }
                        if (data.code && data.code !== 200) {
                            ElMessage({
                                message: data.msg,
                                type: 'error',
                                showClose: true,
                            });
                            _loading.value = false;
                            return;
                        }
                        switch (data.type) {
                            case 'id':
                                currentRecord.id = data.id;
                                _currentChat.value.records[index.value].id = data.id;
                                break;
                            case 'info':
                                console.info(data.msg);
                                break;
                            case 'error':
                                currentRecord.error = data.content;
                                emits('error', currentRecord.id || null);
                                break;
                            case 'analysis-result':
                                analysis_answer += data.content;
                                analysis_answer_thinking += data.reasoning_content;
                                _currentChat.value.records[index.value].analysis = analysis_answer;
                                _currentChat.value.records[index.value].analysis_thinking = analysis_answer_thinking;
                                break;
                            case 'analysis_finish':
                                emits('finish', currentRecord.id);
                                break;
                        }
                        await nextTick();
                    }
                }
            }
        }
    }
    catch (error) {
        if (!currentRecord.error) {
            currentRecord.error = '';
        }
        if (currentRecord.error.trim().length !== 0) {
            currentRecord.error = currentRecord.error + '\n';
        }
        currentRecord.error = currentRecord.error + 'Error:' + error;
        console.error('Error:', error);
        emits('error', currentRecord.id || null);
    }
    finally {
        _loading.value = false;
    }
};
function stop() {
    stopFlag.value = true;
    _loading.value = false;
    emits('stop');
}
onBeforeUnmount(() => {
    stop();
});
const __VLS_exposed = { sendMessage, index: () => index.value, chatList: () => _chatList.value, stop };
defineExpose(__VLS_exposed);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    chatList: () => [],
    currentChatId: undefined,
    currentChat: () => new ChatInfo(),
    message: undefined,
    loading: false,
});
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
if (__VLS_ctx.message) {
    /** @type {[typeof BaseAnswer, typeof BaseAnswer, ]} */ ;
    // @ts-ignore
    const __VLS_0 = __VLS_asFunctionalComponent(BaseAnswer, new BaseAnswer({
        message: (__VLS_ctx.message),
        reasoningName: (['analysis_thinking']),
        loading: (__VLS_ctx._loading),
    }));
    const __VLS_1 = __VLS_0({
        message: (__VLS_ctx.message),
        reasoningName: (['analysis_thinking']),
        loading: (__VLS_ctx._loading),
    }, ...__VLS_functionalComponentArgsRest(__VLS_0));
    var __VLS_3 = {};
    __VLS_2.slots.default;
    if (__VLS_ctx.parsedAnalysisResult && (__VLS_ctx.parsedAnalysisResult.analysis_type || __VLS_ctx.parsedAnalysisResult.charts || __VLS_ctx.parsedAnalysisResult.stats || __VLS_ctx.parsedAnalysisResult.anomalies || __VLS_ctx.parsedAnalysisResult.correlation_matrix || __VLS_ctx.parsedAnalysisResult.distributions || __VLS_ctx.parsedAnalysisResult.predictions || __VLS_ctx.parsedAnalysisResult.clusters || __VLS_ctx.parsedAnalysisResult.regression || __VLS_ctx.parsedAnalysisResult.classification || __VLS_ctx.parsedAnalysisResult.time_series || __VLS_ctx.parsedAnalysisResult.trends)) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "analysis-result-container" },
            ...{ style: {} },
        });
        if (__VLS_ctx.parsedAnalysisResult.analysis_type || __VLS_ctx.parsedAnalysisResult.columns) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "analysis-header" },
                ...{ style: {} },
            });
            if (__VLS_ctx.parsedAnalysisResult.analysis_type) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ style: {} },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({
                    ...{ style: {} },
                });
                (__VLS_ctx.analysisTypeLabel || __VLS_ctx.parsedAnalysisResult.analysis_type);
            }
            if (__VLS_ctx.parsedAnalysisResult.columns && __VLS_ctx.parsedAnalysisResult.columns.length > 0) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
                __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
                (__VLS_ctx.parsedAnalysisResult.columns.join(', '));
            }
        }
        if (__VLS_ctx.isDescriptiveAnalysis && __VLS_ctx.parsedAnalysisResult.stats) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "descriptive-result" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
                ...{ style: {} },
            });
            for (const [stats, column] of __VLS_getVForSourceType((__VLS_ctx.parsedAnalysisResult.stats))) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    key: (column),
                    ...{ class: "column-stats" },
                    ...{ style: {} },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({
                    ...{ style: {} },
                });
                (column);
                const __VLS_4 = {}.ElCard;
                /** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.ElCard, ]} */ ;
                // @ts-ignore
                const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
                    ...{ style: {} },
                }));
                const __VLS_6 = __VLS_5({
                    ...{ style: {} },
                }, ...__VLS_functionalComponentArgsRest(__VLS_5));
                __VLS_7.slots.default;
                const __VLS_8 = {}.ElTable;
                /** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.ElTable, ]} */ ;
                // @ts-ignore
                const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
                    data: ([stats]),
                    ...{ style: {} },
                }));
                const __VLS_10 = __VLS_9({
                    data: ([stats]),
                    ...{ style: {} },
                }, ...__VLS_functionalComponentArgsRest(__VLS_9));
                __VLS_11.slots.default;
                for (const [_, key] of __VLS_getVForSourceType((stats))) {
                    const __VLS_12 = {}.ElTableColumn;
                    /** @type {[typeof __VLS_components.ElTableColumn, ]} */ ;
                    // @ts-ignore
                    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
                        key: (String(key)),
                        prop: (String(key)),
                        label: (__VLS_ctx.formatStatKey(String(key))),
                        ...{ style: {} },
                    }));
                    const __VLS_14 = __VLS_13({
                        key: (String(key)),
                        prop: (String(key)),
                        label: (__VLS_ctx.formatStatKey(String(key))),
                        ...{ style: {} },
                    }, ...__VLS_functionalComponentArgsRest(__VLS_13));
                }
                var __VLS_11;
                var __VLS_7;
                if (__VLS_ctx.parsedAnalysisResult.charts && __VLS_ctx.parsedAnalysisResult.charts[column]) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                        ...{ class: "chart-container" },
                        ...{ style: {} },
                    });
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
                        src: (__VLS_ctx.parsedAnalysisResult.charts[column]),
                        alt: (`${column}统计图表`),
                        ...{ style: {} },
                    });
                }
            }
        }
        else if (__VLS_ctx.isCorrelationAnalysis) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "correlation-result" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
                ...{ style: {} },
            });
            const __VLS_16 = {}.ElCard;
            /** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.ElCard, ]} */ ;
            // @ts-ignore
            const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
                ...{ style: {} },
            }));
            const __VLS_18 = __VLS_17({
                ...{ style: {} },
            }, ...__VLS_functionalComponentArgsRest(__VLS_17));
            __VLS_19.slots.default;
            const __VLS_20 = {}.ElTable;
            /** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.ElTable, ]} */ ;
            // @ts-ignore
            const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
                data: (__VLS_ctx.correlationMatrixData),
                ...{ style: {} },
            }));
            const __VLS_22 = __VLS_21({
                data: (__VLS_ctx.correlationMatrixData),
                ...{ style: {} },
            }, ...__VLS_functionalComponentArgsRest(__VLS_21));
            __VLS_23.slots.default;
            const __VLS_24 = {}.ElTableColumn;
            /** @type {[typeof __VLS_components.ElTableColumn, ]} */ ;
            // @ts-ignore
            const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
                prop: "column",
                label: "列名",
                width: "120",
            }));
            const __VLS_26 = __VLS_25({
                prop: "column",
                label: "列名",
                width: "120",
            }, ...__VLS_functionalComponentArgsRest(__VLS_25));
            for (const [col] of __VLS_getVForSourceType((__VLS_ctx.correlationColumns))) {
                const __VLS_28 = {}.ElTableColumn;
                /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.ElTableColumn, ]} */ ;
                // @ts-ignore
                const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
                    key: (col),
                    prop: (col),
                    label: (col),
                }));
                const __VLS_30 = __VLS_29({
                    key: (col),
                    prop: (col),
                    label: (col),
                }, ...__VLS_functionalComponentArgsRest(__VLS_29));
                __VLS_31.slots.default;
                {
                    const { default: __VLS_thisSlot } = __VLS_31.slots;
                    const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                        ...{ class: (__VLS_ctx.getCorrelationClass(scope.row[col])) },
                        ...{ style: {} },
                    });
                    (scope.row[col]?.toFixed(4) || 'N/A');
                }
                var __VLS_31;
            }
            var __VLS_23;
            var __VLS_19;
            if (__VLS_ctx.parsedAnalysisResult.charts && __VLS_ctx.parsedAnalysisResult.charts.correlation_matrix) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "chart-container" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
                    src: (__VLS_ctx.parsedAnalysisResult.charts.correlation_matrix),
                    alt: "相关性矩阵热力图",
                    ...{ style: {} },
                });
            }
        }
        else if (__VLS_ctx.isDistributionAnalysis && __VLS_ctx.parsedAnalysisResult.distributions) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "distribution-result" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
                ...{ style: {} },
            });
            for (const [dist, column] of __VLS_getVForSourceType((__VLS_ctx.parsedAnalysisResult.distributions))) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    key: (column),
                    ...{ class: "column-distribution" },
                    ...{ style: {} },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({
                    ...{ style: {} },
                });
                (column);
                const __VLS_32 = {}.ElCard;
                /** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.ElCard, ]} */ ;
                // @ts-ignore
                const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
                    ...{ style: {} },
                }));
                const __VLS_34 = __VLS_33({
                    ...{ style: {} },
                }, ...__VLS_functionalComponentArgsRest(__VLS_33));
                __VLS_35.slots.default;
                const __VLS_36 = {}.ElCollapse;
                /** @type {[typeof __VLS_components.ElCollapse, typeof __VLS_components.ElCollapse, ]} */ ;
                // @ts-ignore
                const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({}));
                const __VLS_38 = __VLS_37({}, ...__VLS_functionalComponentArgsRest(__VLS_37));
                __VLS_39.slots.default;
                const __VLS_40 = {}.ElCollapseItem;
                /** @type {[typeof __VLS_components.ElCollapseItem, typeof __VLS_components.ElCollapseItem, ]} */ ;
                // @ts-ignore
                const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
                    title: "分位数",
                }));
                const __VLS_42 = __VLS_41({
                    title: "分位数",
                }, ...__VLS_functionalComponentArgsRest(__VLS_41));
                __VLS_43.slots.default;
                const __VLS_44 = {}.ElTable;
                /** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.ElTable, ]} */ ;
                // @ts-ignore
                const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
                    data: ([dist.quantiles]),
                    ...{ style: {} },
                }));
                const __VLS_46 = __VLS_45({
                    data: ([dist.quantiles]),
                    ...{ style: {} },
                }, ...__VLS_functionalComponentArgsRest(__VLS_45));
                __VLS_47.slots.default;
                for (const [_, key] of __VLS_getVForSourceType((dist.quantiles))) {
                    const __VLS_48 = {}.ElTableColumn;
                    /** @type {[typeof __VLS_components.ElTableColumn, ]} */ ;
                    // @ts-ignore
                    const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
                        key: (String(key)),
                        prop: (String(key)),
                        label: (`${String(key)}分位数`),
                    }));
                    const __VLS_50 = __VLS_49({
                        key: (String(key)),
                        prop: (String(key)),
                        label: (`${String(key)}分位数`),
                    }, ...__VLS_functionalComponentArgsRest(__VLS_49));
                }
                var __VLS_47;
                var __VLS_43;
                const __VLS_52 = {}.ElCollapseItem;
                /** @type {[typeof __VLS_components.ElCollapseItem, typeof __VLS_components.ElCollapseItem, ]} */ ;
                // @ts-ignore
                const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
                    title: "值分布",
                }));
                const __VLS_54 = __VLS_53({
                    title: "值分布",
                }, ...__VLS_functionalComponentArgsRest(__VLS_53));
                __VLS_55.slots.default;
                const __VLS_56 = {}.ElTable;
                /** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.ElTable, ]} */ ;
                // @ts-ignore
                const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
                    data: (Object.entries(dist.value_counts).map(([value, count]) => ({ value, count }))),
                    ...{ style: {} },
                }));
                const __VLS_58 = __VLS_57({
                    data: (Object.entries(dist.value_counts).map(([value, count]) => ({ value, count }))),
                    ...{ style: {} },
                }, ...__VLS_functionalComponentArgsRest(__VLS_57));
                __VLS_59.slots.default;
                const __VLS_60 = {}.ElTableColumn;
                /** @type {[typeof __VLS_components.ElTableColumn, ]} */ ;
                // @ts-ignore
                const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
                    prop: "value",
                    label: "值",
                }));
                const __VLS_62 = __VLS_61({
                    prop: "value",
                    label: "值",
                }, ...__VLS_functionalComponentArgsRest(__VLS_61));
                const __VLS_64 = {}.ElTableColumn;
                /** @type {[typeof __VLS_components.ElTableColumn, ]} */ ;
                // @ts-ignore
                const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
                    prop: "count",
                    label: "计数",
                }));
                const __VLS_66 = __VLS_65({
                    prop: "count",
                    label: "计数",
                }, ...__VLS_functionalComponentArgsRest(__VLS_65));
                var __VLS_59;
                var __VLS_55;
                var __VLS_39;
                var __VLS_35;
                if (__VLS_ctx.parsedAnalysisResult.charts && __VLS_ctx.parsedAnalysisResult.charts[column]) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                        ...{ class: "chart-container" },
                        ...{ style: {} },
                    });
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
                        src: (__VLS_ctx.parsedAnalysisResult.charts[column]),
                        alt: (`${column}分布图`),
                        ...{ style: {} },
                    });
                }
            }
        }
        else if (__VLS_ctx.isAnomalyAnalysis && __VLS_ctx.parsedAnalysisResult.anomalies) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "anomaly-result" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
                ...{ style: {} },
            });
            for (const [anomaly, column] of __VLS_getVForSourceType((__VLS_ctx.parsedAnalysisResult.anomalies))) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    key: (column),
                    ...{ class: "column-anomaly" },
                    ...{ style: {} },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({
                    ...{ style: {} },
                });
                (column);
                const __VLS_68 = {}.ElCard;
                /** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.ElCard, ]} */ ;
                // @ts-ignore
                const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
                    ...{ class: "anomaly-info-card" },
                    ...{ style: {} },
                }));
                const __VLS_70 = __VLS_69({
                    ...{ class: "anomaly-info-card" },
                    ...{ style: {} },
                }, ...__VLS_functionalComponentArgsRest(__VLS_69));
                __VLS_71.slots.default;
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "anomaly-stats" },
                    ...{ style: {} },
                });
                const __VLS_72 = {}.ElStatistic;
                /** @type {[typeof __VLS_components.ElStatistic, ]} */ ;
                // @ts-ignore
                const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
                    title: "下限值",
                    value: (anomaly.lower_bound),
                    precision: (2),
                }));
                const __VLS_74 = __VLS_73({
                    title: "下限值",
                    value: (anomaly.lower_bound),
                    precision: (2),
                }, ...__VLS_functionalComponentArgsRest(__VLS_73));
                const __VLS_76 = {}.ElStatistic;
                /** @type {[typeof __VLS_components.ElStatistic, ]} */ ;
                // @ts-ignore
                const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
                    title: "上限值",
                    value: (anomaly.upper_bound),
                    precision: (2),
                }));
                const __VLS_78 = __VLS_77({
                    title: "上限值",
                    value: (anomaly.upper_bound),
                    precision: (2),
                }, ...__VLS_functionalComponentArgsRest(__VLS_77));
                const __VLS_80 = {}.ElStatistic;
                /** @type {[typeof __VLS_components.ElStatistic, ]} */ ;
                // @ts-ignore
                const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
                    title: "异常值数量",
                    value: (anomaly.outlier_count),
                }));
                const __VLS_82 = __VLS_81({
                    title: "异常值数量",
                    value: (anomaly.outlier_count),
                }, ...__VLS_functionalComponentArgsRest(__VLS_81));
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "anomaly-values" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.h5, __VLS_intrinsicElements.h5)({
                    ...{ style: {} },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "outlier-tags" },
                    ...{ style: {} },
                });
                for (const [val, idx] of __VLS_getVForSourceType((anomaly.outliers.slice(0, 20)))) {
                    const __VLS_84 = {}.ElTag;
                    /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.ElTag, ]} */ ;
                    // @ts-ignore
                    const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({
                        key: (idx),
                        type: "danger",
                        size: "small",
                    }));
                    const __VLS_86 = __VLS_85({
                        key: (idx),
                        type: "danger",
                        size: "small",
                    }, ...__VLS_functionalComponentArgsRest(__VLS_85));
                    __VLS_87.slots.default;
                    (val);
                    var __VLS_87;
                }
                if (anomaly.outliers.length > 20) {
                    const __VLS_88 = {}.ElTag;
                    /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.ElTag, ]} */ ;
                    // @ts-ignore
                    const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({
                        type: "info",
                        size: "small",
                    }));
                    const __VLS_90 = __VLS_89({
                        type: "info",
                        size: "small",
                    }, ...__VLS_functionalComponentArgsRest(__VLS_89));
                    __VLS_91.slots.default;
                    (anomaly.outliers.length - 20);
                    var __VLS_91;
                }
                var __VLS_71;
                if (__VLS_ctx.parsedAnalysisResult.charts && __VLS_ctx.parsedAnalysisResult.charts[column]) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                        ...{ class: "chart-container" },
                        ...{ style: {} },
                    });
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
                        src: (__VLS_ctx.parsedAnalysisResult.charts[column]),
                        alt: (`${column}箱线图`),
                        ...{ style: {} },
                    });
                }
            }
        }
        else if (__VLS_ctx.isTrendAnalysis && __VLS_ctx.parsedAnalysisResult.trends) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "trend-result" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
                ...{ style: {} },
            });
            for (const [_, column] of __VLS_getVForSourceType((__VLS_ctx.parsedAnalysisResult.trends))) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    key: (column),
                    ...{ class: "column-trend" },
                    ...{ style: {} },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({
                    ...{ style: {} },
                });
                (column);
                if (__VLS_ctx.parsedAnalysisResult.charts && __VLS_ctx.parsedAnalysisResult.charts[column]) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                        ...{ class: "chart-container" },
                    });
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
                        src: (__VLS_ctx.parsedAnalysisResult.charts[column]),
                        alt: (`${column}趋势图`),
                        ...{ style: {} },
                    });
                }
            }
        }
        else if (__VLS_ctx.isTimeSeriesAnalysis && __VLS_ctx.parsedAnalysisResult.time_series) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "time-series-result" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
                ...{ style: {} },
            });
            for (const [ts, column] of __VLS_getVForSourceType((__VLS_ctx.parsedAnalysisResult.time_series))) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    key: (column),
                    ...{ class: "column-time-series" },
                    ...{ style: {} },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({
                    ...{ style: {} },
                });
                (column);
                const __VLS_92 = {}.ElCard;
                /** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.ElCard, ]} */ ;
                // @ts-ignore
                const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({
                    ...{ style: {} },
                }));
                const __VLS_94 = __VLS_93({
                    ...{ style: {} },
                }, ...__VLS_functionalComponentArgsRest(__VLS_93));
                __VLS_95.slots.default;
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "ts-stats" },
                    ...{ style: {} },
                });
                const __VLS_96 = {}.ElStatistic;
                /** @type {[typeof __VLS_components.ElStatistic, ]} */ ;
                // @ts-ignore
                const __VLS_97 = __VLS_asFunctionalComponent(__VLS_96, new __VLS_96({
                    title: "均值",
                    value: (ts.mean),
                    precision: (2),
                }));
                const __VLS_98 = __VLS_97({
                    title: "均值",
                    value: (ts.mean),
                    precision: (2),
                }, ...__VLS_functionalComponentArgsRest(__VLS_97));
                const __VLS_100 = {}.ElStatistic;
                /** @type {[typeof __VLS_components.ElStatistic, ]} */ ;
                // @ts-ignore
                const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({
                    title: "标准差",
                    value: (ts.std),
                    precision: (2),
                }));
                const __VLS_102 = __VLS_101({
                    title: "标准差",
                    value: (ts.std),
                    precision: (2),
                }, ...__VLS_functionalComponentArgsRest(__VLS_101));
                var __VLS_95;
                if (__VLS_ctx.parsedAnalysisResult.charts && __VLS_ctx.parsedAnalysisResult.charts[column]) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                        ...{ class: "chart-container" },
                        ...{ style: {} },
                    });
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
                        src: (__VLS_ctx.parsedAnalysisResult.charts[column]),
                        alt: (`${column}时间序列图`),
                        ...{ style: {} },
                    });
                }
            }
        }
        else if (__VLS_ctx.isPredictionAnalysis && __VLS_ctx.parsedAnalysisResult.predictions) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "prediction-result" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
                ...{ style: {} },
            });
            const __VLS_104 = {}.ElCard;
            /** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.ElCard, ]} */ ;
            // @ts-ignore
            const __VLS_105 = __VLS_asFunctionalComponent(__VLS_104, new __VLS_104({
                ...{ style: {} },
            }));
            const __VLS_106 = __VLS_105({
                ...{ style: {} },
            }, ...__VLS_functionalComponentArgsRest(__VLS_105));
            __VLS_107.slots.default;
            if (__VLS_ctx.parsedAnalysisResult.predictions.model) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "model-info" },
                });
                const __VLS_108 = {}.ElTable;
                /** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.ElTable, ]} */ ;
                // @ts-ignore
                const __VLS_109 = __VLS_asFunctionalComponent(__VLS_108, new __VLS_108({
                    data: ([{
                            model: __VLS_ctx.parsedAnalysisResult.predictions.model,
                            target_column: __VLS_ctx.parsedAnalysisResult.predictions.target_column,
                            feature_columns: __VLS_ctx.parsedAnalysisResult.predictions.feature_columns?.join(', ') || '-',
                            mse: __VLS_ctx.parsedAnalysisResult.predictions.mse?.toFixed(4) || '-',
                            r2: __VLS_ctx.parsedAnalysisResult.predictions.r2?.toFixed(4) || '-'
                        }]),
                    ...{ style: {} },
                }));
                const __VLS_110 = __VLS_109({
                    data: ([{
                            model: __VLS_ctx.parsedAnalysisResult.predictions.model,
                            target_column: __VLS_ctx.parsedAnalysisResult.predictions.target_column,
                            feature_columns: __VLS_ctx.parsedAnalysisResult.predictions.feature_columns?.join(', ') || '-',
                            mse: __VLS_ctx.parsedAnalysisResult.predictions.mse?.toFixed(4) || '-',
                            r2: __VLS_ctx.parsedAnalysisResult.predictions.r2?.toFixed(4) || '-'
                        }]),
                    ...{ style: {} },
                }, ...__VLS_functionalComponentArgsRest(__VLS_109));
                __VLS_111.slots.default;
                const __VLS_112 = {}.ElTableColumn;
                /** @type {[typeof __VLS_components.ElTableColumn, ]} */ ;
                // @ts-ignore
                const __VLS_113 = __VLS_asFunctionalComponent(__VLS_112, new __VLS_112({
                    prop: "model",
                    label: "模型",
                }));
                const __VLS_114 = __VLS_113({
                    prop: "model",
                    label: "模型",
                }, ...__VLS_functionalComponentArgsRest(__VLS_113));
                const __VLS_116 = {}.ElTableColumn;
                /** @type {[typeof __VLS_components.ElTableColumn, ]} */ ;
                // @ts-ignore
                const __VLS_117 = __VLS_asFunctionalComponent(__VLS_116, new __VLS_116({
                    prop: "target_column",
                    label: "目标列",
                }));
                const __VLS_118 = __VLS_117({
                    prop: "target_column",
                    label: "目标列",
                }, ...__VLS_functionalComponentArgsRest(__VLS_117));
                const __VLS_120 = {}.ElTableColumn;
                /** @type {[typeof __VLS_components.ElTableColumn, ]} */ ;
                // @ts-ignore
                const __VLS_121 = __VLS_asFunctionalComponent(__VLS_120, new __VLS_120({
                    prop: "feature_columns",
                    label: "特征列",
                }));
                const __VLS_122 = __VLS_121({
                    prop: "feature_columns",
                    label: "特征列",
                }, ...__VLS_functionalComponentArgsRest(__VLS_121));
                const __VLS_124 = {}.ElTableColumn;
                /** @type {[typeof __VLS_components.ElTableColumn, ]} */ ;
                // @ts-ignore
                const __VLS_125 = __VLS_asFunctionalComponent(__VLS_124, new __VLS_124({
                    prop: "mse",
                    label: "均方误差",
                }));
                const __VLS_126 = __VLS_125({
                    prop: "mse",
                    label: "均方误差",
                }, ...__VLS_functionalComponentArgsRest(__VLS_125));
                const __VLS_128 = {}.ElTableColumn;
                /** @type {[typeof __VLS_components.ElTableColumn, ]} */ ;
                // @ts-ignore
                const __VLS_129 = __VLS_asFunctionalComponent(__VLS_128, new __VLS_128({
                    prop: "r2",
                    label: "R²分数",
                }));
                const __VLS_130 = __VLS_129({
                    prop: "r2",
                    label: "R²分数",
                }, ...__VLS_functionalComponentArgsRest(__VLS_129));
                var __VLS_111;
            }
            else if (__VLS_ctx.parsedAnalysisResult.predictions.error) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "error-message" },
                    ...{ style: {} },
                });
                (__VLS_ctx.parsedAnalysisResult.predictions.error);
            }
            var __VLS_107;
            if (__VLS_ctx.parsedAnalysisResult.charts && __VLS_ctx.parsedAnalysisResult.charts.prediction) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "chart-container" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
                    src: (__VLS_ctx.parsedAnalysisResult.charts.prediction),
                    alt: "预测图表",
                    ...{ style: {} },
                });
            }
        }
        else if (__VLS_ctx.isClusteringAnalysis && __VLS_ctx.parsedAnalysisResult.clusters) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "clustering-result" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
                ...{ style: {} },
            });
            const __VLS_132 = {}.ElCard;
            /** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.ElCard, ]} */ ;
            // @ts-ignore
            const __VLS_133 = __VLS_asFunctionalComponent(__VLS_132, new __VLS_132({
                ...{ style: {} },
            }));
            const __VLS_134 = __VLS_133({
                ...{ style: {} },
            }, ...__VLS_functionalComponentArgsRest(__VLS_133));
            __VLS_135.slots.default;
            if (__VLS_ctx.parsedAnalysisResult.clusters.model) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "model-info" },
                });
                const __VLS_136 = {}.ElTable;
                /** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.ElTable, ]} */ ;
                // @ts-ignore
                const __VLS_137 = __VLS_asFunctionalComponent(__VLS_136, new __VLS_136({
                    data: ([{
                            model: __VLS_ctx.parsedAnalysisResult.clusters.model,
                            n_clusters: __VLS_ctx.parsedAnalysisResult.clusters.n_clusters,
                            cluster_columns: __VLS_ctx.parsedAnalysisResult.clusters.cluster_columns?.join(', ') || '-',
                            cluster_centers: JSON.stringify(__VLS_ctx.parsedAnalysisResult.clusters.cluster_centers, null, 2),
                            cluster_counts: JSON.stringify(__VLS_ctx.parsedAnalysisResult.clusters.cluster_counts, null, 2)
                        }]),
                    ...{ style: {} },
                }));
                const __VLS_138 = __VLS_137({
                    data: ([{
                            model: __VLS_ctx.parsedAnalysisResult.clusters.model,
                            n_clusters: __VLS_ctx.parsedAnalysisResult.clusters.n_clusters,
                            cluster_columns: __VLS_ctx.parsedAnalysisResult.clusters.cluster_columns?.join(', ') || '-',
                            cluster_centers: JSON.stringify(__VLS_ctx.parsedAnalysisResult.clusters.cluster_centers, null, 2),
                            cluster_counts: JSON.stringify(__VLS_ctx.parsedAnalysisResult.clusters.cluster_counts, null, 2)
                        }]),
                    ...{ style: {} },
                }, ...__VLS_functionalComponentArgsRest(__VLS_137));
                __VLS_139.slots.default;
                const __VLS_140 = {}.ElTableColumn;
                /** @type {[typeof __VLS_components.ElTableColumn, ]} */ ;
                // @ts-ignore
                const __VLS_141 = __VLS_asFunctionalComponent(__VLS_140, new __VLS_140({
                    prop: "model",
                    label: "模型",
                }));
                const __VLS_142 = __VLS_141({
                    prop: "model",
                    label: "模型",
                }, ...__VLS_functionalComponentArgsRest(__VLS_141));
                const __VLS_144 = {}.ElTableColumn;
                /** @type {[typeof __VLS_components.ElTableColumn, ]} */ ;
                // @ts-ignore
                const __VLS_145 = __VLS_asFunctionalComponent(__VLS_144, new __VLS_144({
                    prop: "n_clusters",
                    label: "聚类数量",
                }));
                const __VLS_146 = __VLS_145({
                    prop: "n_clusters",
                    label: "聚类数量",
                }, ...__VLS_functionalComponentArgsRest(__VLS_145));
                const __VLS_148 = {}.ElTableColumn;
                /** @type {[typeof __VLS_components.ElTableColumn, ]} */ ;
                // @ts-ignore
                const __VLS_149 = __VLS_asFunctionalComponent(__VLS_148, new __VLS_148({
                    prop: "cluster_columns",
                    label: "聚类列",
                }));
                const __VLS_150 = __VLS_149({
                    prop: "cluster_columns",
                    label: "聚类列",
                }, ...__VLS_functionalComponentArgsRest(__VLS_149));
                const __VLS_152 = {}.ElTableColumn;
                /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.ElTableColumn, ]} */ ;
                // @ts-ignore
                const __VLS_153 = __VLS_asFunctionalComponent(__VLS_152, new __VLS_152({
                    prop: "cluster_centers",
                    label: "聚类中心",
                }));
                const __VLS_154 = __VLS_153({
                    prop: "cluster_centers",
                    label: "聚类中心",
                }, ...__VLS_functionalComponentArgsRest(__VLS_153));
                __VLS_155.slots.default;
                {
                    const { default: __VLS_thisSlot } = __VLS_155.slots;
                    const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.pre, __VLS_intrinsicElements.pre)({
                        ...{ style: {} },
                    });
                    (scope.row.cluster_centers);
                }
                var __VLS_155;
                const __VLS_156 = {}.ElTableColumn;
                /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.ElTableColumn, ]} */ ;
                // @ts-ignore
                const __VLS_157 = __VLS_asFunctionalComponent(__VLS_156, new __VLS_156({
                    prop: "cluster_counts",
                    label: "聚类计数",
                }));
                const __VLS_158 = __VLS_157({
                    prop: "cluster_counts",
                    label: "聚类计数",
                }, ...__VLS_functionalComponentArgsRest(__VLS_157));
                __VLS_159.slots.default;
                {
                    const { default: __VLS_thisSlot } = __VLS_159.slots;
                    const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.pre, __VLS_intrinsicElements.pre)({
                        ...{ style: {} },
                    });
                    (scope.row.cluster_counts);
                }
                var __VLS_159;
                var __VLS_139;
            }
            else if (__VLS_ctx.parsedAnalysisResult.clusters.error) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "error-message" },
                    ...{ style: {} },
                });
                (__VLS_ctx.parsedAnalysisResult.clusters.error);
            }
            var __VLS_135;
            if (__VLS_ctx.parsedAnalysisResult.charts && __VLS_ctx.parsedAnalysisResult.charts.clustering) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "chart-container" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
                    src: (__VLS_ctx.parsedAnalysisResult.charts.clustering),
                    alt: "聚类图表",
                    ...{ style: {} },
                });
            }
        }
        else if (__VLS_ctx.isRegressionAnalysis && __VLS_ctx.parsedAnalysisResult.regression) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "regression-result" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
                ...{ style: {} },
            });
            const __VLS_160 = {}.ElCard;
            /** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.ElCard, ]} */ ;
            // @ts-ignore
            const __VLS_161 = __VLS_asFunctionalComponent(__VLS_160, new __VLS_160({
                ...{ style: {} },
            }));
            const __VLS_162 = __VLS_161({
                ...{ style: {} },
            }, ...__VLS_functionalComponentArgsRest(__VLS_161));
            __VLS_163.slots.default;
            if (__VLS_ctx.parsedAnalysisResult.regression.model) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "model-info" },
                });
                const __VLS_164 = {}.ElTable;
                /** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.ElTable, ]} */ ;
                // @ts-ignore
                const __VLS_165 = __VLS_asFunctionalComponent(__VLS_164, new __VLS_164({
                    data: ([{
                            model: __VLS_ctx.parsedAnalysisResult.regression.model,
                            target_column: __VLS_ctx.parsedAnalysisResult.regression.target_column,
                            feature_columns: __VLS_ctx.parsedAnalysisResult.regression.feature_columns?.join(', ') || '-',
                            mse: __VLS_ctx.parsedAnalysisResult.regression.mse?.toFixed(4) || '-',
                            r2: __VLS_ctx.parsedAnalysisResult.regression.r2?.toFixed(4) || '-'
                        }]),
                    ...{ style: {} },
                }));
                const __VLS_166 = __VLS_165({
                    data: ([{
                            model: __VLS_ctx.parsedAnalysisResult.regression.model,
                            target_column: __VLS_ctx.parsedAnalysisResult.regression.target_column,
                            feature_columns: __VLS_ctx.parsedAnalysisResult.regression.feature_columns?.join(', ') || '-',
                            mse: __VLS_ctx.parsedAnalysisResult.regression.mse?.toFixed(4) || '-',
                            r2: __VLS_ctx.parsedAnalysisResult.regression.r2?.toFixed(4) || '-'
                        }]),
                    ...{ style: {} },
                }, ...__VLS_functionalComponentArgsRest(__VLS_165));
                __VLS_167.slots.default;
                const __VLS_168 = {}.ElTableColumn;
                /** @type {[typeof __VLS_components.ElTableColumn, ]} */ ;
                // @ts-ignore
                const __VLS_169 = __VLS_asFunctionalComponent(__VLS_168, new __VLS_168({
                    prop: "model",
                    label: "模型",
                }));
                const __VLS_170 = __VLS_169({
                    prop: "model",
                    label: "模型",
                }, ...__VLS_functionalComponentArgsRest(__VLS_169));
                const __VLS_172 = {}.ElTableColumn;
                /** @type {[typeof __VLS_components.ElTableColumn, ]} */ ;
                // @ts-ignore
                const __VLS_173 = __VLS_asFunctionalComponent(__VLS_172, new __VLS_172({
                    prop: "target_column",
                    label: "目标列",
                }));
                const __VLS_174 = __VLS_173({
                    prop: "target_column",
                    label: "目标列",
                }, ...__VLS_functionalComponentArgsRest(__VLS_173));
                const __VLS_176 = {}.ElTableColumn;
                /** @type {[typeof __VLS_components.ElTableColumn, ]} */ ;
                // @ts-ignore
                const __VLS_177 = __VLS_asFunctionalComponent(__VLS_176, new __VLS_176({
                    prop: "feature_columns",
                    label: "特征列",
                }));
                const __VLS_178 = __VLS_177({
                    prop: "feature_columns",
                    label: "特征列",
                }, ...__VLS_functionalComponentArgsRest(__VLS_177));
                const __VLS_180 = {}.ElTableColumn;
                /** @type {[typeof __VLS_components.ElTableColumn, ]} */ ;
                // @ts-ignore
                const __VLS_181 = __VLS_asFunctionalComponent(__VLS_180, new __VLS_180({
                    prop: "mse",
                    label: "均方误差",
                }));
                const __VLS_182 = __VLS_181({
                    prop: "mse",
                    label: "均方误差",
                }, ...__VLS_functionalComponentArgsRest(__VLS_181));
                const __VLS_184 = {}.ElTableColumn;
                /** @type {[typeof __VLS_components.ElTableColumn, ]} */ ;
                // @ts-ignore
                const __VLS_185 = __VLS_asFunctionalComponent(__VLS_184, new __VLS_184({
                    prop: "r2",
                    label: "R²分数",
                }));
                const __VLS_186 = __VLS_185({
                    prop: "r2",
                    label: "R²分数",
                }, ...__VLS_functionalComponentArgsRest(__VLS_185));
                var __VLS_167;
            }
            else if (__VLS_ctx.parsedAnalysisResult.regression.error) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "error-message" },
                    ...{ style: {} },
                });
                (__VLS_ctx.parsedAnalysisResult.regression.error);
            }
            var __VLS_163;
            if (__VLS_ctx.parsedAnalysisResult.charts && __VLS_ctx.parsedAnalysisResult.charts.regression) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "chart-container" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
                    src: (__VLS_ctx.parsedAnalysisResult.charts.regression),
                    alt: "回归图表",
                    ...{ style: {} },
                });
            }
        }
        else if (__VLS_ctx.isClassificationAnalysis && __VLS_ctx.parsedAnalysisResult.classification) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "classification-result" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
                ...{ style: {} },
            });
            const __VLS_188 = {}.ElCard;
            /** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.ElCard, ]} */ ;
            // @ts-ignore
            const __VLS_189 = __VLS_asFunctionalComponent(__VLS_188, new __VLS_188({
                ...{ style: {} },
            }));
            const __VLS_190 = __VLS_189({
                ...{ style: {} },
            }, ...__VLS_functionalComponentArgsRest(__VLS_189));
            __VLS_191.slots.default;
            if (__VLS_ctx.parsedAnalysisResult.classification.model) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "model-info" },
                });
                const __VLS_192 = {}.ElTable;
                /** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.ElTable, ]} */ ;
                // @ts-ignore
                const __VLS_193 = __VLS_asFunctionalComponent(__VLS_192, new __VLS_192({
                    data: ([{
                            model: __VLS_ctx.parsedAnalysisResult.classification.model,
                            target_column: __VLS_ctx.parsedAnalysisResult.classification.target_column,
                            feature_columns: __VLS_ctx.parsedAnalysisResult.classification.feature_columns?.join(', ') || '-',
                            accuracy: __VLS_ctx.parsedAnalysisResult.classification.accuracy?.toFixed(4) || '-',
                            precision: __VLS_ctx.parsedAnalysisResult.classification.precision?.toFixed(4) || '-',
                            recall: __VLS_ctx.parsedAnalysisResult.classification.recall?.toFixed(4) || '-',
                            f1_score: __VLS_ctx.parsedAnalysisResult.classification.f1_score?.toFixed(4) || '-'
                        }]),
                    ...{ style: {} },
                }));
                const __VLS_194 = __VLS_193({
                    data: ([{
                            model: __VLS_ctx.parsedAnalysisResult.classification.model,
                            target_column: __VLS_ctx.parsedAnalysisResult.classification.target_column,
                            feature_columns: __VLS_ctx.parsedAnalysisResult.classification.feature_columns?.join(', ') || '-',
                            accuracy: __VLS_ctx.parsedAnalysisResult.classification.accuracy?.toFixed(4) || '-',
                            precision: __VLS_ctx.parsedAnalysisResult.classification.precision?.toFixed(4) || '-',
                            recall: __VLS_ctx.parsedAnalysisResult.classification.recall?.toFixed(4) || '-',
                            f1_score: __VLS_ctx.parsedAnalysisResult.classification.f1_score?.toFixed(4) || '-'
                        }]),
                    ...{ style: {} },
                }, ...__VLS_functionalComponentArgsRest(__VLS_193));
                __VLS_195.slots.default;
                const __VLS_196 = {}.ElTableColumn;
                /** @type {[typeof __VLS_components.ElTableColumn, ]} */ ;
                // @ts-ignore
                const __VLS_197 = __VLS_asFunctionalComponent(__VLS_196, new __VLS_196({
                    prop: "model",
                    label: "模型",
                }));
                const __VLS_198 = __VLS_197({
                    prop: "model",
                    label: "模型",
                }, ...__VLS_functionalComponentArgsRest(__VLS_197));
                const __VLS_200 = {}.ElTableColumn;
                /** @type {[typeof __VLS_components.ElTableColumn, ]} */ ;
                // @ts-ignore
                const __VLS_201 = __VLS_asFunctionalComponent(__VLS_200, new __VLS_200({
                    prop: "target_column",
                    label: "目标列",
                }));
                const __VLS_202 = __VLS_201({
                    prop: "target_column",
                    label: "目标列",
                }, ...__VLS_functionalComponentArgsRest(__VLS_201));
                const __VLS_204 = {}.ElTableColumn;
                /** @type {[typeof __VLS_components.ElTableColumn, ]} */ ;
                // @ts-ignore
                const __VLS_205 = __VLS_asFunctionalComponent(__VLS_204, new __VLS_204({
                    prop: "feature_columns",
                    label: "特征列",
                }));
                const __VLS_206 = __VLS_205({
                    prop: "feature_columns",
                    label: "特征列",
                }, ...__VLS_functionalComponentArgsRest(__VLS_205));
                const __VLS_208 = {}.ElTableColumn;
                /** @type {[typeof __VLS_components.ElTableColumn, ]} */ ;
                // @ts-ignore
                const __VLS_209 = __VLS_asFunctionalComponent(__VLS_208, new __VLS_208({
                    prop: "accuracy",
                    label: "准确率",
                }));
                const __VLS_210 = __VLS_209({
                    prop: "accuracy",
                    label: "准确率",
                }, ...__VLS_functionalComponentArgsRest(__VLS_209));
                const __VLS_212 = {}.ElTableColumn;
                /** @type {[typeof __VLS_components.ElTableColumn, ]} */ ;
                // @ts-ignore
                const __VLS_213 = __VLS_asFunctionalComponent(__VLS_212, new __VLS_212({
                    prop: "precision",
                    label: "精确率",
                }));
                const __VLS_214 = __VLS_213({
                    prop: "precision",
                    label: "精确率",
                }, ...__VLS_functionalComponentArgsRest(__VLS_213));
                const __VLS_216 = {}.ElTableColumn;
                /** @type {[typeof __VLS_components.ElTableColumn, ]} */ ;
                // @ts-ignore
                const __VLS_217 = __VLS_asFunctionalComponent(__VLS_216, new __VLS_216({
                    prop: "recall",
                    label: "召回率",
                }));
                const __VLS_218 = __VLS_217({
                    prop: "recall",
                    label: "召回率",
                }, ...__VLS_functionalComponentArgsRest(__VLS_217));
                const __VLS_220 = {}.ElTableColumn;
                /** @type {[typeof __VLS_components.ElTableColumn, ]} */ ;
                // @ts-ignore
                const __VLS_221 = __VLS_asFunctionalComponent(__VLS_220, new __VLS_220({
                    prop: "f1_score",
                    label: "F1分数",
                }));
                const __VLS_222 = __VLS_221({
                    prop: "f1_score",
                    label: "F1分数",
                }, ...__VLS_functionalComponentArgsRest(__VLS_221));
                var __VLS_195;
            }
            else if (__VLS_ctx.parsedAnalysisResult.classification.error) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "error-message" },
                    ...{ style: {} },
                });
                (__VLS_ctx.parsedAnalysisResult.classification.error);
            }
            var __VLS_191;
            if (__VLS_ctx.parsedAnalysisResult.charts && __VLS_ctx.parsedAnalysisResult.charts.classification) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "chart-container" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
                    src: (__VLS_ctx.parsedAnalysisResult.charts.classification),
                    alt: "分类图表",
                    ...{ style: {} },
                });
            }
        }
        else if (__VLS_ctx.parsedAnalysisResult && Object.keys(__VLS_ctx.parsedAnalysisResult).length > 0) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "generic-analysis-result" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
                ...{ style: {} },
            });
            if (__VLS_ctx.parsedAnalysisResult.stats) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "stats-section" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({
                    ...{ style: {} },
                });
                const __VLS_224 = {}.ElCard;
                /** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.ElCard, ]} */ ;
                // @ts-ignore
                const __VLS_225 = __VLS_asFunctionalComponent(__VLS_224, new __VLS_224({
                    ...{ style: {} },
                }));
                const __VLS_226 = __VLS_225({
                    ...{ style: {} },
                }, ...__VLS_functionalComponentArgsRest(__VLS_225));
                __VLS_227.slots.default;
                for (const [stats, column] of __VLS_getVForSourceType((__VLS_ctx.parsedAnalysisResult.stats))) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                        key: (column),
                        ...{ class: "column-stats" },
                        ...{ style: {} },
                    });
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.h5, __VLS_intrinsicElements.h5)({});
                    (column);
                    const __VLS_228 = {}.ElTable;
                    /** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.ElTable, ]} */ ;
                    // @ts-ignore
                    const __VLS_229 = __VLS_asFunctionalComponent(__VLS_228, new __VLS_228({
                        data: ([stats]),
                        ...{ style: {} },
                    }));
                    const __VLS_230 = __VLS_229({
                        data: ([stats]),
                        ...{ style: {} },
                    }, ...__VLS_functionalComponentArgsRest(__VLS_229));
                    __VLS_231.slots.default;
                    for (const [_, key] of __VLS_getVForSourceType((stats))) {
                        const __VLS_232 = {}.ElTableColumn;
                        /** @type {[typeof __VLS_components.ElTableColumn, ]} */ ;
                        // @ts-ignore
                        const __VLS_233 = __VLS_asFunctionalComponent(__VLS_232, new __VLS_232({
                            key: (String(key)),
                            prop: (String(key)),
                            label: (__VLS_ctx.formatStatKey(String(key))),
                        }));
                        const __VLS_234 = __VLS_233({
                            key: (String(key)),
                            prop: (String(key)),
                            label: (__VLS_ctx.formatStatKey(String(key))),
                        }, ...__VLS_functionalComponentArgsRest(__VLS_233));
                    }
                    var __VLS_231;
                }
                var __VLS_227;
            }
            if (__VLS_ctx.parsedAnalysisResult.anomalies) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "anomalies-section" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({
                    ...{ style: {} },
                });
                const __VLS_236 = {}.ElCard;
                /** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.ElCard, ]} */ ;
                // @ts-ignore
                const __VLS_237 = __VLS_asFunctionalComponent(__VLS_236, new __VLS_236({
                    ...{ style: {} },
                }));
                const __VLS_238 = __VLS_237({
                    ...{ style: {} },
                }, ...__VLS_functionalComponentArgsRest(__VLS_237));
                __VLS_239.slots.default;
                for (const [anomaly, column] of __VLS_getVForSourceType((__VLS_ctx.parsedAnalysisResult.anomalies))) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                        key: (column),
                        ...{ class: "column-anomaly" },
                        ...{ style: {} },
                    });
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.h5, __VLS_intrinsicElements.h5)({});
                    (column);
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                        ...{ style: {} },
                    });
                    const __VLS_240 = {}.ElStatistic;
                    /** @type {[typeof __VLS_components.ElStatistic, ]} */ ;
                    // @ts-ignore
                    const __VLS_241 = __VLS_asFunctionalComponent(__VLS_240, new __VLS_240({
                        title: "下限值",
                        value: (anomaly.lower_bound),
                        precision: (2),
                    }));
                    const __VLS_242 = __VLS_241({
                        title: "下限值",
                        value: (anomaly.lower_bound),
                        precision: (2),
                    }, ...__VLS_functionalComponentArgsRest(__VLS_241));
                    const __VLS_244 = {}.ElStatistic;
                    /** @type {[typeof __VLS_components.ElStatistic, ]} */ ;
                    // @ts-ignore
                    const __VLS_245 = __VLS_asFunctionalComponent(__VLS_244, new __VLS_244({
                        title: "上限值",
                        value: (anomaly.upper_bound),
                        precision: (2),
                    }));
                    const __VLS_246 = __VLS_245({
                        title: "上限值",
                        value: (anomaly.upper_bound),
                        precision: (2),
                    }, ...__VLS_functionalComponentArgsRest(__VLS_245));
                    const __VLS_248 = {}.ElStatistic;
                    /** @type {[typeof __VLS_components.ElStatistic, ]} */ ;
                    // @ts-ignore
                    const __VLS_249 = __VLS_asFunctionalComponent(__VLS_248, new __VLS_248({
                        title: "异常值数量",
                        value: (anomaly.outlier_count),
                    }));
                    const __VLS_250 = __VLS_249({
                        title: "异常值数量",
                        value: (anomaly.outlier_count),
                    }, ...__VLS_functionalComponentArgsRest(__VLS_249));
                }
                var __VLS_239;
            }
            if (__VLS_ctx.parsedAnalysisResult.correlation_matrix) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "correlation-section" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({
                    ...{ style: {} },
                });
                const __VLS_252 = {}.ElCard;
                /** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.ElCard, ]} */ ;
                // @ts-ignore
                const __VLS_253 = __VLS_asFunctionalComponent(__VLS_252, new __VLS_252({
                    ...{ style: {} },
                }));
                const __VLS_254 = __VLS_253({
                    ...{ style: {} },
                }, ...__VLS_functionalComponentArgsRest(__VLS_253));
                __VLS_255.slots.default;
                const __VLS_256 = {}.ElTable;
                /** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.ElTable, ]} */ ;
                // @ts-ignore
                const __VLS_257 = __VLS_asFunctionalComponent(__VLS_256, new __VLS_256({
                    data: (__VLS_ctx.correlationMatrixData),
                    ...{ style: {} },
                }));
                const __VLS_258 = __VLS_257({
                    data: (__VLS_ctx.correlationMatrixData),
                    ...{ style: {} },
                }, ...__VLS_functionalComponentArgsRest(__VLS_257));
                __VLS_259.slots.default;
                const __VLS_260 = {}.ElTableColumn;
                /** @type {[typeof __VLS_components.ElTableColumn, ]} */ ;
                // @ts-ignore
                const __VLS_261 = __VLS_asFunctionalComponent(__VLS_260, new __VLS_260({
                    prop: "column",
                    label: "列名",
                    width: "120",
                }));
                const __VLS_262 = __VLS_261({
                    prop: "column",
                    label: "列名",
                    width: "120",
                }, ...__VLS_functionalComponentArgsRest(__VLS_261));
                for (const [col] of __VLS_getVForSourceType((__VLS_ctx.correlationColumns))) {
                    const __VLS_264 = {}.ElTableColumn;
                    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.ElTableColumn, ]} */ ;
                    // @ts-ignore
                    const __VLS_265 = __VLS_asFunctionalComponent(__VLS_264, new __VLS_264({
                        key: (col),
                        prop: (col),
                        label: (col),
                    }));
                    const __VLS_266 = __VLS_265({
                        key: (col),
                        prop: (col),
                        label: (col),
                    }, ...__VLS_functionalComponentArgsRest(__VLS_265));
                    __VLS_267.slots.default;
                    {
                        const { default: __VLS_thisSlot } = __VLS_267.slots;
                        const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
                        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                            ...{ class: (__VLS_ctx.getCorrelationClass(scope.row[col])) },
                            ...{ style: {} },
                        });
                        (scope.row[col]?.toFixed(4) || 'N/A');
                    }
                    var __VLS_267;
                }
                var __VLS_259;
                var __VLS_255;
            }
            if (__VLS_ctx.parsedAnalysisResult.distributions) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "distributions-section" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({
                    ...{ style: {} },
                });
                const __VLS_268 = {}.ElCard;
                /** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.ElCard, ]} */ ;
                // @ts-ignore
                const __VLS_269 = __VLS_asFunctionalComponent(__VLS_268, new __VLS_268({
                    ...{ style: {} },
                }));
                const __VLS_270 = __VLS_269({
                    ...{ style: {} },
                }, ...__VLS_functionalComponentArgsRest(__VLS_269));
                __VLS_271.slots.default;
                const __VLS_272 = {}.ElCollapse;
                /** @type {[typeof __VLS_components.ElCollapse, typeof __VLS_components.ElCollapse, ]} */ ;
                // @ts-ignore
                const __VLS_273 = __VLS_asFunctionalComponent(__VLS_272, new __VLS_272({}));
                const __VLS_274 = __VLS_273({}, ...__VLS_functionalComponentArgsRest(__VLS_273));
                __VLS_275.slots.default;
                for (const [dist, column] of __VLS_getVForSourceType((__VLS_ctx.parsedAnalysisResult.distributions))) {
                    const __VLS_276 = {}.ElCollapseItem;
                    /** @type {[typeof __VLS_components.ElCollapseItem, typeof __VLS_components.ElCollapseItem, ]} */ ;
                    // @ts-ignore
                    const __VLS_277 = __VLS_asFunctionalComponent(__VLS_276, new __VLS_276({
                        key: (String(column)),
                        title: (String(column)),
                    }));
                    const __VLS_278 = __VLS_277({
                        key: (String(column)),
                        title: (String(column)),
                    }, ...__VLS_functionalComponentArgsRest(__VLS_277));
                    __VLS_279.slots.default;
                    const __VLS_280 = {}.ElTable;
                    /** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.ElTable, ]} */ ;
                    // @ts-ignore
                    const __VLS_281 = __VLS_asFunctionalComponent(__VLS_280, new __VLS_280({
                        data: ([dist.quantiles]),
                        ...{ style: {} },
                    }));
                    const __VLS_282 = __VLS_281({
                        data: ([dist.quantiles]),
                        ...{ style: {} },
                    }, ...__VLS_functionalComponentArgsRest(__VLS_281));
                    __VLS_283.slots.default;
                    for (const [_, key] of __VLS_getVForSourceType((dist.quantiles))) {
                        const __VLS_284 = {}.ElTableColumn;
                        /** @type {[typeof __VLS_components.ElTableColumn, ]} */ ;
                        // @ts-ignore
                        const __VLS_285 = __VLS_asFunctionalComponent(__VLS_284, new __VLS_284({
                            key: (String(key)),
                            prop: (String(key)),
                            label: (`${String(key)}分位数`),
                        }));
                        const __VLS_286 = __VLS_285({
                            key: (String(key)),
                            prop: (String(key)),
                            label: (`${String(key)}分位数`),
                        }, ...__VLS_functionalComponentArgsRest(__VLS_285));
                    }
                    var __VLS_283;
                    var __VLS_279;
                }
                var __VLS_275;
                var __VLS_271;
            }
            if (__VLS_ctx.parsedAnalysisResult.predictions) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "predictions-section" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({
                    ...{ style: {} },
                });
                const __VLS_288 = {}.ElCard;
                /** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.ElCard, ]} */ ;
                // @ts-ignore
                const __VLS_289 = __VLS_asFunctionalComponent(__VLS_288, new __VLS_288({
                    ...{ style: {} },
                }));
                const __VLS_290 = __VLS_289({
                    ...{ style: {} },
                }, ...__VLS_functionalComponentArgsRest(__VLS_289));
                __VLS_291.slots.default;
                __VLS_asFunctionalElement(__VLS_intrinsicElements.pre, __VLS_intrinsicElements.pre)({
                    ...{ style: {} },
                });
                (JSON.stringify(__VLS_ctx.parsedAnalysisResult.predictions, null, 2));
                var __VLS_291;
            }
            if (__VLS_ctx.parsedAnalysisResult.clusters) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "clusters-section" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({
                    ...{ style: {} },
                });
                const __VLS_292 = {}.ElCard;
                /** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.ElCard, ]} */ ;
                // @ts-ignore
                const __VLS_293 = __VLS_asFunctionalComponent(__VLS_292, new __VLS_292({
                    ...{ style: {} },
                }));
                const __VLS_294 = __VLS_293({
                    ...{ style: {} },
                }, ...__VLS_functionalComponentArgsRest(__VLS_293));
                __VLS_295.slots.default;
                __VLS_asFunctionalElement(__VLS_intrinsicElements.pre, __VLS_intrinsicElements.pre)({
                    ...{ style: {} },
                });
                (JSON.stringify(__VLS_ctx.parsedAnalysisResult.clusters, null, 2));
                var __VLS_295;
            }
            if (__VLS_ctx.parsedAnalysisResult.regression) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "regression-section" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({
                    ...{ style: {} },
                });
                const __VLS_296 = {}.ElCard;
                /** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.ElCard, ]} */ ;
                // @ts-ignore
                const __VLS_297 = __VLS_asFunctionalComponent(__VLS_296, new __VLS_296({
                    ...{ style: {} },
                }));
                const __VLS_298 = __VLS_297({
                    ...{ style: {} },
                }, ...__VLS_functionalComponentArgsRest(__VLS_297));
                __VLS_299.slots.default;
                __VLS_asFunctionalElement(__VLS_intrinsicElements.pre, __VLS_intrinsicElements.pre)({
                    ...{ style: {} },
                });
                (JSON.stringify(__VLS_ctx.parsedAnalysisResult.regression, null, 2));
                var __VLS_299;
            }
            if (__VLS_ctx.parsedAnalysisResult.classification) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "classification-section" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({
                    ...{ style: {} },
                });
                const __VLS_300 = {}.ElCard;
                /** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.ElCard, ]} */ ;
                // @ts-ignore
                const __VLS_301 = __VLS_asFunctionalComponent(__VLS_300, new __VLS_300({
                    ...{ style: {} },
                }));
                const __VLS_302 = __VLS_301({
                    ...{ style: {} },
                }, ...__VLS_functionalComponentArgsRest(__VLS_301));
                __VLS_303.slots.default;
                __VLS_asFunctionalElement(__VLS_intrinsicElements.pre, __VLS_intrinsicElements.pre)({
                    ...{ style: {} },
                });
                (JSON.stringify(__VLS_ctx.parsedAnalysisResult.classification, null, 2));
                var __VLS_303;
            }
            if (__VLS_ctx.parsedAnalysisResult.time_series) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "time-series-section" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({
                    ...{ style: {} },
                });
                const __VLS_304 = {}.ElCard;
                /** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.ElCard, ]} */ ;
                // @ts-ignore
                const __VLS_305 = __VLS_asFunctionalComponent(__VLS_304, new __VLS_304({
                    ...{ style: {} },
                }));
                const __VLS_306 = __VLS_305({
                    ...{ style: {} },
                }, ...__VLS_functionalComponentArgsRest(__VLS_305));
                __VLS_307.slots.default;
                __VLS_asFunctionalElement(__VLS_intrinsicElements.pre, __VLS_intrinsicElements.pre)({
                    ...{ style: {} },
                });
                (JSON.stringify(__VLS_ctx.parsedAnalysisResult.time_series, null, 2));
                var __VLS_307;
            }
            if (__VLS_ctx.parsedAnalysisResult.trends) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "trends-section" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({
                    ...{ style: {} },
                });
                const __VLS_308 = {}.ElCard;
                /** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.ElCard, ]} */ ;
                // @ts-ignore
                const __VLS_309 = __VLS_asFunctionalComponent(__VLS_308, new __VLS_308({
                    ...{ style: {} },
                }));
                const __VLS_310 = __VLS_309({
                    ...{ style: {} },
                }, ...__VLS_functionalComponentArgsRest(__VLS_309));
                __VLS_311.slots.default;
                __VLS_asFunctionalElement(__VLS_intrinsicElements.pre, __VLS_intrinsicElements.pre)({
                    ...{ style: {} },
                });
                (JSON.stringify(__VLS_ctx.parsedAnalysisResult.trends, null, 2));
                var __VLS_311;
            }
            if (__VLS_ctx.parsedAnalysisResult.charts && Object.keys(__VLS_ctx.parsedAnalysisResult.charts).length > 0) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "charts-section" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({
                    ...{ style: {} },
                });
                for (const [chart, key] of __VLS_getVForSourceType((__VLS_ctx.parsedAnalysisResult.charts))) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                        key: (String(key)),
                        ...{ class: "chart-container" },
                        ...{ style: {} },
                    });
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.h5, __VLS_intrinsicElements.h5)({
                        ...{ style: {} },
                    });
                    (String(key));
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
                        src: (chart),
                        alt: (String(key)),
                        ...{ style: {} },
                    });
                }
            }
            if (!__VLS_ctx.parsedAnalysisResult.stats && !__VLS_ctx.parsedAnalysisResult.anomalies && !__VLS_ctx.parsedAnalysisResult.correlation_matrix &&
                !__VLS_ctx.parsedAnalysisResult.distributions && !__VLS_ctx.parsedAnalysisResult.predictions && !__VLS_ctx.parsedAnalysisResult.clusters &&
                !__VLS_ctx.parsedAnalysisResult.regression && !__VLS_ctx.parsedAnalysisResult.classification && !__VLS_ctx.parsedAnalysisResult.time_series &&
                !__VLS_ctx.parsedAnalysisResult.trends && !__VLS_ctx.parsedAnalysisResult.charts) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "fallback-section" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.pre, __VLS_intrinsicElements.pre)({
                    ...{ style: {} },
                });
                (JSON.stringify(__VLS_ctx.parsedAnalysisResult, null, 2));
            }
        }
    }
    if (__VLS_ctx.message.record?.analysis) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "analysis-report" },
            ...{ style: {} },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
            ...{ style: {} },
        });
        /** @type {[typeof MdComponent, ]} */ ;
        // @ts-ignore
        const __VLS_312 = __VLS_asFunctionalComponent(MdComponent, new MdComponent({
            message: (__VLS_ctx.message.record.analysis),
        }));
        const __VLS_313 = __VLS_312({
            message: (__VLS_ctx.message.record.analysis),
        }, ...__VLS_functionalComponentArgsRest(__VLS_312));
    }
    var __VLS_315 = {};
    {
        const { tool: __VLS_thisSlot } = __VLS_2.slots;
        var __VLS_317 = {};
    }
    {
        const { footer: __VLS_thisSlot } = __VLS_2.slots;
        var __VLS_319 = {};
    }
    var __VLS_2;
}
/** @type {__VLS_StyleScopedClasses['analysis-result-container']} */ ;
/** @type {__VLS_StyleScopedClasses['analysis-header']} */ ;
/** @type {__VLS_StyleScopedClasses['descriptive-result']} */ ;
/** @type {__VLS_StyleScopedClasses['column-stats']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-container']} */ ;
/** @type {__VLS_StyleScopedClasses['correlation-result']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-container']} */ ;
/** @type {__VLS_StyleScopedClasses['distribution-result']} */ ;
/** @type {__VLS_StyleScopedClasses['column-distribution']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-container']} */ ;
/** @type {__VLS_StyleScopedClasses['anomaly-result']} */ ;
/** @type {__VLS_StyleScopedClasses['column-anomaly']} */ ;
/** @type {__VLS_StyleScopedClasses['anomaly-info-card']} */ ;
/** @type {__VLS_StyleScopedClasses['anomaly-stats']} */ ;
/** @type {__VLS_StyleScopedClasses['anomaly-values']} */ ;
/** @type {__VLS_StyleScopedClasses['outlier-tags']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-container']} */ ;
/** @type {__VLS_StyleScopedClasses['trend-result']} */ ;
/** @type {__VLS_StyleScopedClasses['column-trend']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-container']} */ ;
/** @type {__VLS_StyleScopedClasses['time-series-result']} */ ;
/** @type {__VLS_StyleScopedClasses['column-time-series']} */ ;
/** @type {__VLS_StyleScopedClasses['ts-stats']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-container']} */ ;
/** @type {__VLS_StyleScopedClasses['prediction-result']} */ ;
/** @type {__VLS_StyleScopedClasses['model-info']} */ ;
/** @type {__VLS_StyleScopedClasses['error-message']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-container']} */ ;
/** @type {__VLS_StyleScopedClasses['clustering-result']} */ ;
/** @type {__VLS_StyleScopedClasses['model-info']} */ ;
/** @type {__VLS_StyleScopedClasses['error-message']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-container']} */ ;
/** @type {__VLS_StyleScopedClasses['regression-result']} */ ;
/** @type {__VLS_StyleScopedClasses['model-info']} */ ;
/** @type {__VLS_StyleScopedClasses['error-message']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-container']} */ ;
/** @type {__VLS_StyleScopedClasses['classification-result']} */ ;
/** @type {__VLS_StyleScopedClasses['model-info']} */ ;
/** @type {__VLS_StyleScopedClasses['error-message']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-container']} */ ;
/** @type {__VLS_StyleScopedClasses['generic-analysis-result']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-section']} */ ;
/** @type {__VLS_StyleScopedClasses['column-stats']} */ ;
/** @type {__VLS_StyleScopedClasses['anomalies-section']} */ ;
/** @type {__VLS_StyleScopedClasses['column-anomaly']} */ ;
/** @type {__VLS_StyleScopedClasses['correlation-section']} */ ;
/** @type {__VLS_StyleScopedClasses['distributions-section']} */ ;
/** @type {__VLS_StyleScopedClasses['predictions-section']} */ ;
/** @type {__VLS_StyleScopedClasses['clusters-section']} */ ;
/** @type {__VLS_StyleScopedClasses['regression-section']} */ ;
/** @type {__VLS_StyleScopedClasses['classification-section']} */ ;
/** @type {__VLS_StyleScopedClasses['time-series-section']} */ ;
/** @type {__VLS_StyleScopedClasses['trends-section']} */ ;
/** @type {__VLS_StyleScopedClasses['charts-section']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-container']} */ ;
/** @type {__VLS_StyleScopedClasses['fallback-section']} */ ;
/** @type {__VLS_StyleScopedClasses['analysis-report']} */ ;
// @ts-ignore
var __VLS_316 = __VLS_315, __VLS_318 = __VLS_317, __VLS_320 = __VLS_319;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            BaseAnswer: BaseAnswer,
            MdComponent: MdComponent,
            ElTag: ElTag,
            ElStatistic: ElStatistic,
            ElTable: ElTable,
            ElTableColumn: ElTableColumn,
            ElCard: ElCard,
            ElCollapse: ElCollapse,
            ElCollapseItem: ElCollapseItem,
            _loading: _loading,
            parsedAnalysisResult: parsedAnalysisResult,
            isDescriptiveAnalysis: isDescriptiveAnalysis,
            isCorrelationAnalysis: isCorrelationAnalysis,
            isDistributionAnalysis: isDistributionAnalysis,
            isAnomalyAnalysis: isAnomalyAnalysis,
            isTrendAnalysis: isTrendAnalysis,
            isTimeSeriesAnalysis: isTimeSeriesAnalysis,
            isPredictionAnalysis: isPredictionAnalysis,
            isClusteringAnalysis: isClusteringAnalysis,
            isRegressionAnalysis: isRegressionAnalysis,
            isClassificationAnalysis: isClassificationAnalysis,
            analysisTypeLabel: analysisTypeLabel,
            correlationColumns: correlationColumns,
            correlationMatrixData: correlationMatrixData,
            formatStatKey: formatStatKey,
            getCorrelationClass: getCorrelationClass,
        };
    },
    emits: {},
    __typeProps: {},
    props: {},
});
const __VLS_component = (await import('vue')).defineComponent({
    setup() {
        return {
            ...__VLS_exposed,
        };
    },
    emits: {},
    __typeProps: {},
    props: {},
});
export default {};
; /* PartiallyEnd: #4569/main.vue */
