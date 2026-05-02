import { ref, reactive, onMounted, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { dataAgentApi } from '@/api/dataAgent';
import { ChartComponent } from '@/components/chart';
// 激活的标签页
const activeTab = ref('basic-stats');
// 聊天消息
const chatMessages = ref([]);
const chatInput = ref('');
// 数据源表单
const dataSourceForm = reactive({
    datasource_id: '',
    table_name: '',
    data: '',
});
// 分析表单
const analysisForm = reactive({
    analysis_type: '',
    selected_columns: [],
});
// 报告生成表单
const reportForm = reactive({
    name: '',
    analysis_result_ids: [],
    chat_record_ids: [],
});
// 分析结果
const analysisResult = ref(null);
const analysisResults = ref([]);
// 报告列表
const reports = ref([]);
// 数据基本统计结果
const basicStatsResult = ref(null);
// 分析类型列表
const analysisTypes = ref([]);
// 可用列列表
const availableColumns = ref([]);
// 数据源列表
const datasources = ref([]);
// 表列表
const tables = ref([]);
// 加载状态
const isLoadingDatasources = ref(false);
const isLoadingTables = ref(false);
// 过滤后的可用列列表（根据分析类型的数据类型要求）
const filteredColumns = computed(() => {
    if (!currentAnalysisType.value)
        return availableColumns.value;
    const requiredTypes = currentAnalysisType.value.column_types;
    return availableColumns.value.filter((column) => {
        // 映射前端列类型到后端定义的类型
        const columnType = column.type.toLowerCase();
        if (requiredTypes.includes('numeric')) {
            return ['int', 'float', 'double', 'decimal', 'number'].some((type) => columnType.includes(type));
        }
        if (requiredTypes.includes('datetime')) {
            return ['date', 'time', 'datetime', 'timestamp'].some((type) => columnType.includes(type));
        }
        if (requiredTypes.includes('string')) {
            return ['string', 'varchar', 'text', 'char', 'category'].some((type) => columnType.includes(type));
        }
        return requiredTypes.includes(columnType);
    });
});
// 生成的分析需求
const generatedRequirement = ref('');
// 图表相关变量
const chartData = ref([]);
const selectedChartType = ref('bar');
const chartXField = ref('x');
const chartYField = ref('y');
const chartTitle = ref('分析结果');
// 加载状态
const isAnalyzing = ref(false);
const isGenerating = ref(false);
const isLoadingBasicStats = ref(false);
const isLoadingAnalysisTypes = ref(false);
const isGeneratingRequirement = ref(false);
// 当前选择的分析类型
const currentAnalysisType = computed(() => {
    if (!analysisForm.analysis_type)
        return null;
    return analysisTypes.value.find((type) => type.id === analysisForm.analysis_type) || null;
});
// 发送消息
const sendMessage = () => {
    if (!chatInput.value.trim())
        return;
    // 添加用户消息
    chatMessages.value.push({
        role: 'user',
        content: chatInput.value,
        timestamp: new Date().toLocaleString(),
    });
    // 保存到分析表单
    dataSourceForm.data = chatInput.value;
    // 清空输入
    chatInput.value = '';
};
// 处理分析结果并转换为图表数据
const processAnalysisResult = (result) => {
    try {
        const data = JSON.parse(result);
        chartData.value = [];
        // 检查是否有图表数据
        if (data.charts && Object.keys(data.charts).length > 0) {
            // 处理图表数据（前端会通过其他方式展示base64图片）
            console.log('图表数据已生成:', data.charts);
        }
        if (data.analysis_type === 'descriptive' && data.stats) {
            // 处理描述性统计数据
            for (const [column, stats] of Object.entries(data.stats)) {
                if (typeof stats === 'object' && stats !== null) {
                    for (const [stat, value] of Object.entries(stats)) {
                        if (typeof value === 'number') {
                            chartData.value.push({
                                x: `${column}_${stat}`,
                                y: value,
                            });
                        }
                    }
                }
            }
            chartXField.value = 'x';
            chartYField.value = 'y';
            chartTitle.value = '描述性统计结果';
        }
        else if (data.analysis_type === 'correlation' && data.correlation_matrix) {
            // 处理相关性矩阵数据
            const matrix = data.correlation_matrix;
            for (const [col1, values] of Object.entries(matrix)) {
                if (typeof values === 'object' && values !== null) {
                    for (const [col2, value] of Object.entries(values)) {
                        if (typeof value === 'number' && col1 !== col2) {
                            chartData.value.push({
                                x: `${col1}-${col2}`,
                                y: value,
                            });
                        }
                    }
                }
            }
            chartXField.value = 'x';
            chartYField.value = 'y';
            chartTitle.value = '相关性分析结果';
        }
        else if (data.analysis_type === 'distribution' && data.distributions) {
            // 处理分布分析数据
            for (const [_, distribution] of Object.entries(data.distributions)) {
                if (typeof distribution === 'object' &&
                    distribution !== null &&
                    distribution.value_counts) {
                    for (const [value, count] of Object.entries(distribution.value_counts)) {
                        chartData.value.push({
                            x: value,
                            y: count,
                        });
                    }
                }
            }
            chartXField.value = 'x';
            chartYField.value = 'y';
            chartTitle.value = '分布分析结果';
        }
        else if (data.analysis_type === 'trend' && data.trends) {
            // 处理趋势分析数据
            for (const [column, trend] of Object.entries(data.trends)) {
                if (typeof trend === 'object' && trend !== null && trend.values) {
                    for (const item of trend.values) {
                        const timeField = trend.time_column;
                        if (timeField && item[timeField] && item[column]) {
                            chartData.value.push({
                                x: item[timeField],
                                y: item[column],
                            });
                        }
                    }
                }
            }
            chartXField.value = 'x';
            chartYField.value = 'y';
            chartTitle.value = '趋势分析结果';
        }
        else if (data.analysis_type === 'prediction' && data.predictions) {
            // 处理预测分析数据
            if (data.predictions.predictions) {
                for (let i = 0; i < data.predictions.predictions.length; i++) {
                    const [actual, predicted] = data.predictions.predictions[i];
                    chartData.value.push({
                        x: i,
                        y: actual,
                        predicted: predicted,
                    });
                }
            }
            chartXField.value = 'x';
            chartYField.value = 'y';
            chartTitle.value = '预测分析结果';
        }
        else if (data.analysis_type === 'classification' && data.classification) {
            // 处理分类分析数据
            const report = data.classification.report;
            if (report) {
                for (const [class_name, metrics] of Object.entries(report)) {
                    if (typeof metrics === 'object' && metrics !== null && 'f1-score' in metrics) {
                        chartData.value.push({
                            x: class_name,
                            y: metrics['f1-score'],
                        });
                    }
                }
            }
            chartXField.value = 'x';
            chartYField.value = 'y';
            chartTitle.value = '分类分析结果';
        }
        else if (data.analysis_type === 'anomaly' && data.anomalies) {
            // 处理异常检测数据
            for (const [column, anomaly] of Object.entries(data.anomalies)) {
                if (typeof anomaly === 'object' && anomaly !== null) {
                    chartData.value.push({
                        x: column,
                        y: anomaly.outlier_count,
                    });
                }
            }
            chartXField.value = 'x';
            chartYField.value = 'y';
            chartTitle.value = '异常检测结果';
        }
        else if (data.analysis_type === 'time_series' && data.time_series) {
            // 处理时间序列分析数据
            for (const [column, series] of Object.entries(data.time_series)) {
                if (typeof series === 'object' && series !== null && series.values) {
                    for (const item of series.values) {
                        const timeField = Object.keys(item)[0];
                        if (timeField && item[timeField] && item[column]) {
                            chartData.value.push({
                                x: item[timeField],
                                y: item[column],
                            });
                        }
                    }
                }
            }
            chartXField.value = 'x';
            chartYField.value = 'y';
            chartTitle.value = '时间序列分析结果';
        }
        else if (data.analysis_type === 'clustering' && data.clusters) {
            // 处理聚类分析数据
            const clusterCounts = data.clusters.cluster_counts;
            if (clusterCounts) {
                for (const [cluster, count] of Object.entries(clusterCounts)) {
                    chartData.value.push({
                        x: `Cluster ${cluster}`,
                        y: count,
                    });
                }
            }
            chartXField.value = 'x';
            chartYField.value = 'y';
            chartTitle.value = '聚类分析结果';
        }
    }
    catch (error) {
        console.error('处理分析结果失败:', error);
        chartData.value = [];
    }
};
// 执行数据分析
const analyzeData = async () => {
    if (!dataSourceForm.data) {
        ElMessage.warning('请输入分析需求');
        return;
    }
    isAnalyzing.value = true;
    try {
        const request = {
            query: dataSourceForm.data,
            data: dataSourceForm.data,
            datasource_id: dataSourceForm.datasource_id
                ? Number(dataSourceForm.datasource_id)
                : undefined,
            table_name: dataSourceForm.table_name,
            analysis_type: analysisForm.analysis_type,
            selected_columns: analysisForm.selected_columns,
        };
        const response = await dataAgentApi.analyzeData(request);
        analysisResult.value = response;
        if (response.success && response.result) {
            // 处理分析结果并转换为图表数据
            processAnalysisResult(response.result);
            // 添加系统回复
            chatMessages.value.push({
                role: 'system',
                content: response.report || '分析完成',
                timestamp: new Date().toLocaleString(),
            });
            // 刷新分析结果列表
            await loadAnalysisResults();
        }
        else {
            ElMessage.error(response.error || '分析失败');
        }
    }
    catch (error) {
        ElMessage.error('分析过程中出现错误');
        console.error('分析错误:', error);
    }
    finally {
        isAnalyzing.value = false;
    }
};
// 创建报告
const createReport = async () => {
    if (!reportForm.name || (!reportForm.analysis_result_ids && !reportForm.chat_record_ids)) {
        ElMessage.warning('请输入报告名称并选择分析结果或对话记录');
        return;
    }
    isGenerating.value = true;
    try {
        await dataAgentApi.createReport(reportForm);
        ElMessage.success('报告生成成功');
        // 刷新报告列表
        await loadReports();
    }
    catch (error) {
        ElMessage.error('报告生成过程中出现错误');
        console.error('报告生成错误:', error);
    }
    finally {
        isGenerating.value = false;
    }
};
// 查看分析结果
const viewAnalysisResult = async (analysisId) => {
    try {
        await dataAgentApi.getAnalysisResult(analysisId);
        // 这里可以显示详细的分析结果
        ElMessage.info('查看分析结果功能开发中');
    }
    catch (error) {
        ElMessage.error('获取分析结果失败');
        console.error('获取分析结果错误:', error);
    }
};
// 查看报告
const viewReport = async (reportId) => {
    try {
        await dataAgentApi.getReport(reportId);
        // 这里可以显示详细的报告
        ElMessage.info('查看报告功能开发中');
    }
    catch (error) {
        ElMessage.error('获取报告失败');
        console.error('获取报告错误:', error);
    }
};
// 加载分析结果列表
const loadAnalysisResults = async () => {
    try {
        const response = await dataAgentApi.getAnalysisResults();
        analysisResults.value = response.items;
    }
    catch (error) {
        console.error('加载分析结果失败:', error);
    }
};
// 加载报告列表
const loadReports = async () => {
    try {
        const response = await dataAgentApi.getReports();
        reports.value = response;
    }
    catch (error) {
        console.error('加载报告失败:', error);
    }
};
// 获取数据基本统计信息
const getBasicStats = async () => {
    if (!dataSourceForm.datasource_id || !dataSourceForm.table_name) {
        ElMessage.warning('请选择数据源和表名');
        return;
    }
    isLoadingBasicStats.value = true;
    try {
        const request = {
            datasource_id: Number(dataSourceForm.datasource_id),
            table_name: dataSourceForm.table_name,
        };
        const response = await dataAgentApi.getDataBasicStats(request);
        if (response.success) {
            basicStatsResult.value = response;
            // 更新可用列列表
            availableColumns.value = response.columns_info.map((col) => ({
                name: col.name,
                type: col.type,
            }));
        }
        else {
            ElMessage.error(response.error || '获取数据统计失败');
        }
    }
    catch (error) {
        ElMessage.error('获取数据统计过程中出现错误');
        console.error('获取数据统计错误:', error);
    }
    finally {
        isLoadingBasicStats.value = false;
    }
};
// 加载分析类型
const loadAnalysisTypes = async () => {
    isLoadingAnalysisTypes.value = true;
    try {
        const response = await dataAgentApi.getAnalysisTypes();
        analysisTypes.value = response;
    }
    catch (error) {
        console.error('加载分析类型失败:', error);
    }
    finally {
        isLoadingAnalysisTypes.value = false;
    }
};
// 处理分析类型变化
const handleAnalysisTypeChange = () => {
    // 清空之前选择的列
    analysisForm.selected_columns = [];
};
// 加载数据源列表
const loadDatasources = async () => {
    isLoadingDatasources.value = true;
    try {
        const response = await dataAgentApi.getDatasources();
        datasources.value = response;
    }
    catch (error) {
        console.error('加载数据源失败:', error);
        ElMessage.error('加载数据源失败');
    }
    finally {
        isLoadingDatasources.value = false;
    }
};
// 加载表列表
const loadTables = async (datasourceId) => {
    if (!datasourceId) {
        tables.value = [];
        return;
    }
    isLoadingTables.value = true;
    try {
        const response = await dataAgentApi.getTables(datasourceId);
        tables.value = response;
    }
    catch (error) {
        console.error('加载表列表失败:', error);
        ElMessage.error('加载表列表失败');
    }
    finally {
        isLoadingTables.value = false;
    }
};
// 处理数据源变化
const handleDatasourceChange = (datasourceId) => {
    // 清空表选择
    dataSourceForm.table_name = '';
    // 加载表列表
    if (datasourceId) {
        loadTables(Number(datasourceId));
    }
    else {
        tables.value = [];
    }
};
// 生成分析需求
const generateRequirement = async () => {
    if (!analysisForm.analysis_type || analysisForm.selected_columns.length === 0) {
        ElMessage.warning('请选择分析类型和列');
        return;
    }
    if (currentAnalysisType.value?.required_columns === 1 &&
        analysisForm.selected_columns.length !== 1) {
        ElMessage.warning('该分析类型需要选择一列');
        return;
    }
    if (currentAnalysisType.value?.required_columns === 2 &&
        analysisForm.selected_columns.length < 2) {
        ElMessage.warning('该分析类型需要选择至少两列');
        return;
    }
    isGeneratingRequirement.value = true;
    try {
        const request = {
            analysis_type: analysisForm.analysis_type,
            selected_columns: analysisForm.selected_columns,
            datasource_id: Number(dataSourceForm.datasource_id),
            table_name: dataSourceForm.table_name,
        };
        const response = await dataAgentApi.generateRequirement(request);
        if (response.success) {
            generatedRequirement.value = response.requirement;
        }
        else {
            ElMessage.error(response.error || '生成分析需求失败');
        }
    }
    catch (error) {
        ElMessage.error('生成分析需求过程中出现错误');
        console.error('生成分析需求错误:', error);
    }
    finally {
        isGeneratingRequirement.value = false;
    }
};
// 使用生成的分析需求
const useGeneratedRequirement = () => {
    if (generatedRequirement.value) {
        chatInput.value = generatedRequirement.value;
        dataSourceForm.data = generatedRequirement.value;
        activeTab.value = 'analysis';
    }
};
// 获取生成的图表数据
const getGeneratedCharts = () => {
    if (!analysisResult.value || !analysisResult.value.result)
        return {};
    try {
        const data = JSON.parse(analysisResult.value.result);
        if (data.charts && typeof data.charts === 'object') {
            return data.charts;
        }
    }
    catch (error) {
        console.error('解析图表数据失败:', error);
    }
    return {};
};
// 页面加载时获取数据
onMounted(async () => {
    await loadDatasources();
    await loadAnalysisResults();
    await loadReports();
    await loadAnalysisTypes();
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['message']} */ ;
/** @type {__VLS_StyleScopedClasses['message']} */ ;
/** @type {__VLS_StyleScopedClasses['message']} */ ;
/** @type {__VLS_StyleScopedClasses['user']} */ ;
/** @type {__VLS_StyleScopedClasses['message-content']} */ ;
/** @type {__VLS_StyleScopedClasses['message']} */ ;
/** @type {__VLS_StyleScopedClasses['system']} */ ;
/** @type {__VLS_StyleScopedClasses['message-content']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "data-agent-container" },
});
const __VLS_0 = {}.ElCard;
/** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ class: "data-agent-card" },
}));
const __VLS_2 = __VLS_1({
    ...{ class: "data-agent-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
{
    const { header: __VLS_thisSlot } = __VLS_3.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "card-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
}
const __VLS_4 = {}.ElTabs;
/** @type {[typeof __VLS_components.ElTabs, typeof __VLS_components.elTabs, typeof __VLS_components.ElTabs, typeof __VLS_components.elTabs, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    modelValue: (__VLS_ctx.activeTab),
    ...{ class: "data-agent-tabs" },
}));
const __VLS_6 = __VLS_5({
    modelValue: (__VLS_ctx.activeTab),
    ...{ class: "data-agent-tabs" },
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
__VLS_7.slots.default;
const __VLS_8 = {}.ElTabPane;
/** @type {[typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    label: "数据基本统计",
    name: "basic-stats",
}));
const __VLS_10 = __VLS_9({
    label: "数据基本统计",
    name: "basic-stats",
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
__VLS_11.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "basic-stats-section" },
});
const __VLS_12 = {}.ElForm;
/** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    model: (__VLS_ctx.dataSourceForm),
    labelWidth: "80px",
    ...{ class: "data-source-form" },
}));
const __VLS_14 = __VLS_13({
    model: (__VLS_ctx.dataSourceForm),
    labelWidth: "80px",
    ...{ class: "data-source-form" },
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
__VLS_15.slots.default;
const __VLS_16 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    label: "数据源",
}));
const __VLS_18 = __VLS_17({
    label: "数据源",
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
__VLS_19.slots.default;
const __VLS_20 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.dataSourceForm.datasource_id),
    placeholder: "请选择数据源",
    loading: (__VLS_ctx.isLoadingDatasources),
}));
const __VLS_22 = __VLS_21({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.dataSourceForm.datasource_id),
    placeholder: "请选择数据源",
    loading: (__VLS_ctx.isLoadingDatasources),
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
let __VLS_24;
let __VLS_25;
let __VLS_26;
const __VLS_27 = {
    onChange: (__VLS_ctx.handleDatasourceChange)
};
__VLS_23.slots.default;
for (const [datasource] of __VLS_getVForSourceType((__VLS_ctx.datasources))) {
    const __VLS_28 = {}.ElOption;
    /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
    // @ts-ignore
    const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
        key: (datasource.id),
        label: (datasource.name),
        value: (datasource.id),
    }));
    const __VLS_30 = __VLS_29({
        key: (datasource.id),
        label: (datasource.name),
        value: (datasource.id),
    }, ...__VLS_functionalComponentArgsRest(__VLS_29));
}
var __VLS_23;
var __VLS_19;
const __VLS_32 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
    label: "表名",
}));
const __VLS_34 = __VLS_33({
    label: "表名",
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
__VLS_35.slots.default;
const __VLS_36 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
    modelValue: (__VLS_ctx.dataSourceForm.table_name),
    placeholder: "请选择表名",
    loading: (__VLS_ctx.isLoadingTables),
}));
const __VLS_38 = __VLS_37({
    modelValue: (__VLS_ctx.dataSourceForm.table_name),
    placeholder: "请选择表名",
    loading: (__VLS_ctx.isLoadingTables),
}, ...__VLS_functionalComponentArgsRest(__VLS_37));
__VLS_39.slots.default;
for (const [table] of __VLS_getVForSourceType((__VLS_ctx.tables))) {
    const __VLS_40 = {}.ElOption;
    /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
    // @ts-ignore
    const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
        key: (table.id),
        label: (table.table_name),
        value: (table.table_name),
    }));
    const __VLS_42 = __VLS_41({
        key: (table.id),
        label: (table.table_name),
        value: (table.table_name),
    }, ...__VLS_functionalComponentArgsRest(__VLS_41));
}
var __VLS_39;
var __VLS_35;
const __VLS_44 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({}));
const __VLS_46 = __VLS_45({}, ...__VLS_functionalComponentArgsRest(__VLS_45));
__VLS_47.slots.default;
const __VLS_48 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
    ...{ 'onClick': {} },
    type: "primary",
    loading: (__VLS_ctx.isLoadingBasicStats),
}));
const __VLS_50 = __VLS_49({
    ...{ 'onClick': {} },
    type: "primary",
    loading: (__VLS_ctx.isLoadingBasicStats),
}, ...__VLS_functionalComponentArgsRest(__VLS_49));
let __VLS_52;
let __VLS_53;
let __VLS_54;
const __VLS_55 = {
    onClick: (__VLS_ctx.getBasicStats)
};
__VLS_51.slots.default;
(__VLS_ctx.isLoadingBasicStats ? '加载中...' : '获取数据统计');
var __VLS_51;
var __VLS_47;
var __VLS_15;
if (__VLS_ctx.basicStatsResult) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "basic-stats-result" },
    });
    const __VLS_56 = {}.ElDivider;
    /** @type {[typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, ]} */ ;
    // @ts-ignore
    const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
        contentPosition: "left",
    }));
    const __VLS_58 = __VLS_57({
        contentPosition: "left",
    }, ...__VLS_functionalComponentArgsRest(__VLS_57));
    __VLS_59.slots.default;
    var __VLS_59;
    const __VLS_60 = {}.ElCard;
    /** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
    // @ts-ignore
    const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
        ...{ class: "stats-card" },
    }));
    const __VLS_62 = __VLS_61({
        ...{ class: "stats-card" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_61));
    __VLS_63.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "stats-info" },
    });
    const __VLS_64 = {}.ElStatistic;
    /** @type {[typeof __VLS_components.ElStatistic, typeof __VLS_components.elStatistic, ]} */ ;
    // @ts-ignore
    const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
        title: "总行数",
        value: (__VLS_ctx.basicStatsResult.total_rows),
    }));
    const __VLS_66 = __VLS_65({
        title: "总行数",
        value: (__VLS_ctx.basicStatsResult.total_rows),
    }, ...__VLS_functionalComponentArgsRest(__VLS_65));
    const __VLS_68 = {}.ElStatistic;
    /** @type {[typeof __VLS_components.ElStatistic, typeof __VLS_components.elStatistic, ]} */ ;
    // @ts-ignore
    const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
        title: "总列数",
        value: (__VLS_ctx.basicStatsResult.total_columns),
    }));
    const __VLS_70 = __VLS_69({
        title: "总列数",
        value: (__VLS_ctx.basicStatsResult.total_columns),
    }, ...__VLS_functionalComponentArgsRest(__VLS_69));
    var __VLS_63;
    const __VLS_72 = {}.ElDivider;
    /** @type {[typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, ]} */ ;
    // @ts-ignore
    const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
        contentPosition: "left",
    }));
    const __VLS_74 = __VLS_73({
        contentPosition: "left",
    }, ...__VLS_functionalComponentArgsRest(__VLS_73));
    __VLS_75.slots.default;
    var __VLS_75;
    const __VLS_76 = {}.ElCard;
    /** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
    // @ts-ignore
    const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
        ...{ class: "columns-card" },
    }));
    const __VLS_78 = __VLS_77({
        ...{ class: "columns-card" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_77));
    __VLS_79.slots.default;
    const __VLS_80 = {}.ElTable;
    /** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
    // @ts-ignore
    const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
        data: (__VLS_ctx.basicStatsResult.columns_info),
        ...{ style: {} },
    }));
    const __VLS_82 = __VLS_81({
        data: (__VLS_ctx.basicStatsResult.columns_info),
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_81));
    __VLS_83.slots.default;
    const __VLS_84 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({
        prop: "name",
        label: "列名",
        width: "150",
    }));
    const __VLS_86 = __VLS_85({
        prop: "name",
        label: "列名",
        width: "150",
    }, ...__VLS_functionalComponentArgsRest(__VLS_85));
    const __VLS_88 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({
        prop: "type",
        label: "类型",
        width: "100",
    }));
    const __VLS_90 = __VLS_89({
        prop: "type",
        label: "类型",
        width: "100",
    }, ...__VLS_functionalComponentArgsRest(__VLS_89));
    const __VLS_92 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({
        prop: "dtype",
        label: "数据类型",
        width: "150",
    }));
    const __VLS_94 = __VLS_93({
        prop: "dtype",
        label: "数据类型",
        width: "150",
    }, ...__VLS_functionalComponentArgsRest(__VLS_93));
    const __VLS_96 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_97 = __VLS_asFunctionalComponent(__VLS_96, new __VLS_96({
        prop: "non_null_count",
        label: "非空值",
        width: "100",
    }));
    const __VLS_98 = __VLS_97({
        prop: "non_null_count",
        label: "非空值",
        width: "100",
    }, ...__VLS_functionalComponentArgsRest(__VLS_97));
    const __VLS_100 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({
        prop: "null_count",
        label: "空值",
        width: "100",
    }));
    const __VLS_102 = __VLS_101({
        prop: "null_count",
        label: "空值",
        width: "100",
    }, ...__VLS_functionalComponentArgsRest(__VLS_101));
    const __VLS_104 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_105 = __VLS_asFunctionalComponent(__VLS_104, new __VLS_104({
        prop: "null_percentage",
        label: "空值百分比",
        width: "120",
    }));
    const __VLS_106 = __VLS_105({
        prop: "null_percentage",
        label: "空值百分比",
        width: "120",
    }, ...__VLS_functionalComponentArgsRest(__VLS_105));
    __VLS_107.slots.default;
    {
        const { default: __VLS_thisSlot } = __VLS_107.slots;
        const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
        (scope.row.null_percentage);
    }
    var __VLS_107;
    var __VLS_83;
    var __VLS_79;
    const __VLS_108 = {}.ElDivider;
    /** @type {[typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, ]} */ ;
    // @ts-ignore
    const __VLS_109 = __VLS_asFunctionalComponent(__VLS_108, new __VLS_108({
        contentPosition: "left",
    }));
    const __VLS_110 = __VLS_109({
        contentPosition: "left",
    }, ...__VLS_functionalComponentArgsRest(__VLS_109));
    __VLS_111.slots.default;
    var __VLS_111;
    const __VLS_112 = {}.ElCard;
    /** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
    // @ts-ignore
    const __VLS_113 = __VLS_asFunctionalComponent(__VLS_112, new __VLS_112({
        ...{ class: "quality-card" },
    }));
    const __VLS_114 = __VLS_113({
        ...{ class: "quality-card" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_113));
    __VLS_115.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "quality-info" },
    });
    const __VLS_116 = {}.ElStatistic;
    /** @type {[typeof __VLS_components.ElStatistic, typeof __VLS_components.elStatistic, ]} */ ;
    // @ts-ignore
    const __VLS_117 = __VLS_asFunctionalComponent(__VLS_116, new __VLS_116({
        title: "空值总数",
        value: (__VLS_ctx.basicStatsResult.data_quality.null_values.total_null_count),
    }));
    const __VLS_118 = __VLS_117({
        title: "空值总数",
        value: (__VLS_ctx.basicStatsResult.data_quality.null_values.total_null_count),
    }, ...__VLS_functionalComponentArgsRest(__VLS_117));
    const __VLS_120 = {}.ElStatistic;
    /** @type {[typeof __VLS_components.ElStatistic, typeof __VLS_components.elStatistic, ]} */ ;
    // @ts-ignore
    const __VLS_121 = __VLS_asFunctionalComponent(__VLS_120, new __VLS_120({
        title: "空值百分比",
        value: (__VLS_ctx.basicStatsResult.data_quality.null_values.null_percentage),
        suffix: "%",
    }));
    const __VLS_122 = __VLS_121({
        title: "空值百分比",
        value: (__VLS_ctx.basicStatsResult.data_quality.null_values.null_percentage),
        suffix: "%",
    }, ...__VLS_functionalComponentArgsRest(__VLS_121));
    const __VLS_124 = {}.ElStatistic;
    /** @type {[typeof __VLS_components.ElStatistic, typeof __VLS_components.elStatistic, ]} */ ;
    // @ts-ignore
    const __VLS_125 = __VLS_asFunctionalComponent(__VLS_124, new __VLS_124({
        title: "重复行数",
        value: (__VLS_ctx.basicStatsResult.data_quality.duplicate_rows.total_duplicate_count),
    }));
    const __VLS_126 = __VLS_125({
        title: "重复行数",
        value: (__VLS_ctx.basicStatsResult.data_quality.duplicate_rows.total_duplicate_count),
    }, ...__VLS_functionalComponentArgsRest(__VLS_125));
    const __VLS_128 = {}.ElStatistic;
    /** @type {[typeof __VLS_components.ElStatistic, typeof __VLS_components.elStatistic, ]} */ ;
    // @ts-ignore
    const __VLS_129 = __VLS_asFunctionalComponent(__VLS_128, new __VLS_128({
        title: "重复行百分比",
        value: (__VLS_ctx.basicStatsResult.data_quality.duplicate_rows.duplicate_percentage),
        suffix: "%",
    }));
    const __VLS_130 = __VLS_129({
        title: "重复行百分比",
        value: (__VLS_ctx.basicStatsResult.data_quality.duplicate_rows.duplicate_percentage),
        suffix: "%",
    }, ...__VLS_functionalComponentArgsRest(__VLS_129));
    var __VLS_115;
    const __VLS_132 = {}.ElDivider;
    /** @type {[typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, ]} */ ;
    // @ts-ignore
    const __VLS_133 = __VLS_asFunctionalComponent(__VLS_132, new __VLS_132({
        contentPosition: "left",
    }));
    const __VLS_134 = __VLS_133({
        contentPosition: "left",
    }, ...__VLS_functionalComponentArgsRest(__VLS_133));
    __VLS_135.slots.default;
    var __VLS_135;
    const __VLS_136 = {}.ElCard;
    /** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
    // @ts-ignore
    const __VLS_137 = __VLS_asFunctionalComponent(__VLS_136, new __VLS_136({
        ...{ class: "sample-card" },
    }));
    const __VLS_138 = __VLS_137({
        ...{ class: "sample-card" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_137));
    __VLS_139.slots.default;
    if (__VLS_ctx.basicStatsResult.sample_data.length > 0) {
        const __VLS_140 = {}.ElTable;
        /** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
        // @ts-ignore
        const __VLS_141 = __VLS_asFunctionalComponent(__VLS_140, new __VLS_140({
            data: (__VLS_ctx.basicStatsResult.sample_data),
            ...{ style: {} },
        }));
        const __VLS_142 = __VLS_141({
            data: (__VLS_ctx.basicStatsResult.sample_data),
            ...{ style: {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_141));
        __VLS_143.slots.default;
        for (const [_, key] of __VLS_getVForSourceType((__VLS_ctx.basicStatsResult.sample_data[0]))) {
            const __VLS_144 = {}.ElTableColumn;
            /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
            // @ts-ignore
            const __VLS_145 = __VLS_asFunctionalComponent(__VLS_144, new __VLS_144({
                key: (key),
                prop: (key),
                label: (key),
            }));
            const __VLS_146 = __VLS_145({
                key: (key),
                prop: (key),
                label: (key),
            }, ...__VLS_functionalComponentArgsRest(__VLS_145));
        }
        var __VLS_143;
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "empty-sample" },
        });
    }
    var __VLS_139;
}
var __VLS_11;
const __VLS_148 = {}.ElTabPane;
/** @type {[typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, ]} */ ;
// @ts-ignore
const __VLS_149 = __VLS_asFunctionalComponent(__VLS_148, new __VLS_148({
    label: "数据分析",
    name: "analysis",
}));
const __VLS_150 = __VLS_149({
    label: "数据分析",
    name: "analysis",
}, ...__VLS_functionalComponentArgsRest(__VLS_149));
__VLS_151.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "analysis-section" },
});
const __VLS_152 = {}.ElDivider;
/** @type {[typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, ]} */ ;
// @ts-ignore
const __VLS_153 = __VLS_asFunctionalComponent(__VLS_152, new __VLS_152({
    contentPosition: "left",
}));
const __VLS_154 = __VLS_153({
    contentPosition: "left",
}, ...__VLS_functionalComponentArgsRest(__VLS_153));
__VLS_155.slots.default;
var __VLS_155;
const __VLS_156 = {}.ElCard;
/** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
// @ts-ignore
const __VLS_157 = __VLS_asFunctionalComponent(__VLS_156, new __VLS_156({
    ...{ class: "analysis-suggestion-card" },
}));
const __VLS_158 = __VLS_157({
    ...{ class: "analysis-suggestion-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_157));
__VLS_159.slots.default;
const __VLS_160 = {}.ElForm;
/** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
// @ts-ignore
const __VLS_161 = __VLS_asFunctionalComponent(__VLS_160, new __VLS_160({
    model: (__VLS_ctx.analysisForm),
    labelWidth: "100px",
    ...{ class: "analysis-form" },
}));
const __VLS_162 = __VLS_161({
    model: (__VLS_ctx.analysisForm),
    labelWidth: "100px",
    ...{ class: "analysis-form" },
}, ...__VLS_functionalComponentArgsRest(__VLS_161));
__VLS_163.slots.default;
const __VLS_164 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_165 = __VLS_asFunctionalComponent(__VLS_164, new __VLS_164({
    label: "分析类型",
}));
const __VLS_166 = __VLS_165({
    label: "分析类型",
}, ...__VLS_functionalComponentArgsRest(__VLS_165));
__VLS_167.slots.default;
const __VLS_168 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_169 = __VLS_asFunctionalComponent(__VLS_168, new __VLS_168({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.analysisForm.analysis_type),
    placeholder: "请选择分析类型",
}));
const __VLS_170 = __VLS_169({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.analysisForm.analysis_type),
    placeholder: "请选择分析类型",
}, ...__VLS_functionalComponentArgsRest(__VLS_169));
let __VLS_172;
let __VLS_173;
let __VLS_174;
const __VLS_175 = {
    onChange: (__VLS_ctx.handleAnalysisTypeChange)
};
__VLS_171.slots.default;
for (const [type] of __VLS_getVForSourceType((__VLS_ctx.analysisTypes))) {
    const __VLS_176 = {}.ElOption;
    /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
    // @ts-ignore
    const __VLS_177 = __VLS_asFunctionalComponent(__VLS_176, new __VLS_176({
        key: (type.id),
        label: (type.name),
        value: (type.id),
    }));
    const __VLS_178 = __VLS_177({
        key: (type.id),
        label: (type.name),
        value: (type.id),
    }, ...__VLS_functionalComponentArgsRest(__VLS_177));
}
var __VLS_171;
var __VLS_167;
const __VLS_180 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_181 = __VLS_asFunctionalComponent(__VLS_180, new __VLS_180({
    label: "选择列",
}));
const __VLS_182 = __VLS_181({
    label: "选择列",
}, ...__VLS_functionalComponentArgsRest(__VLS_181));
__VLS_183.slots.default;
const __VLS_184 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_185 = __VLS_asFunctionalComponent(__VLS_184, new __VLS_184({
    modelValue: (__VLS_ctx.analysisForm.selected_columns),
    multiple: (__VLS_ctx.currentAnalysisType?.required_columns !== 1),
    placeholder: "请选择列",
    disabled: (!__VLS_ctx.analysisForm.analysis_type || __VLS_ctx.filteredColumns.length === 0),
    multipleLimit: (__VLS_ctx.currentAnalysisType?.required_columns === 1 ? 1 : undefined),
}));
const __VLS_186 = __VLS_185({
    modelValue: (__VLS_ctx.analysisForm.selected_columns),
    multiple: (__VLS_ctx.currentAnalysisType?.required_columns !== 1),
    placeholder: "请选择列",
    disabled: (!__VLS_ctx.analysisForm.analysis_type || __VLS_ctx.filteredColumns.length === 0),
    multipleLimit: (__VLS_ctx.currentAnalysisType?.required_columns === 1 ? 1 : undefined),
}, ...__VLS_functionalComponentArgsRest(__VLS_185));
__VLS_187.slots.default;
for (const [column] of __VLS_getVForSourceType((__VLS_ctx.filteredColumns))) {
    const __VLS_188 = {}.ElOption;
    /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
    // @ts-ignore
    const __VLS_189 = __VLS_asFunctionalComponent(__VLS_188, new __VLS_188({
        key: (column.name),
        label: (column.name),
        value: (column.name),
    }));
    const __VLS_190 = __VLS_189({
        key: (column.name),
        label: (column.name),
        value: (column.name),
    }, ...__VLS_functionalComponentArgsRest(__VLS_189));
}
var __VLS_187;
if (__VLS_ctx.currentAnalysisType) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "column-hint" },
    });
    (__VLS_ctx.currentAnalysisType.required_columns === 1 ? '请选择一列' : '请选择至少两列');
}
if (__VLS_ctx.filteredColumns.length === 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "column-hint" },
        ...{ style: {} },
    });
}
var __VLS_183;
const __VLS_192 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_193 = __VLS_asFunctionalComponent(__VLS_192, new __VLS_192({}));
const __VLS_194 = __VLS_193({}, ...__VLS_functionalComponentArgsRest(__VLS_193));
__VLS_195.slots.default;
const __VLS_196 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_197 = __VLS_asFunctionalComponent(__VLS_196, new __VLS_196({
    ...{ 'onClick': {} },
    type: "primary",
    loading: (__VLS_ctx.isGeneratingRequirement),
}));
const __VLS_198 = __VLS_197({
    ...{ 'onClick': {} },
    type: "primary",
    loading: (__VLS_ctx.isGeneratingRequirement),
}, ...__VLS_functionalComponentArgsRest(__VLS_197));
let __VLS_200;
let __VLS_201;
let __VLS_202;
const __VLS_203 = {
    onClick: (__VLS_ctx.generateRequirement)
};
__VLS_199.slots.default;
(__VLS_ctx.isGeneratingRequirement ? '生成中...' : '生成分析需求');
var __VLS_199;
var __VLS_195;
var __VLS_163;
if (__VLS_ctx.generatedRequirement) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "generated-requirement" },
    });
    const __VLS_204 = {}.ElDivider;
    /** @type {[typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, ]} */ ;
    // @ts-ignore
    const __VLS_205 = __VLS_asFunctionalComponent(__VLS_204, new __VLS_204({
        contentPosition: "left",
    }));
    const __VLS_206 = __VLS_205({
        contentPosition: "left",
    }, ...__VLS_functionalComponentArgsRest(__VLS_205));
    __VLS_207.slots.default;
    var __VLS_207;
    const __VLS_208 = {}.ElInput;
    /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
    // @ts-ignore
    const __VLS_209 = __VLS_asFunctionalComponent(__VLS_208, new __VLS_208({
        modelValue: (__VLS_ctx.generatedRequirement),
        type: "textarea",
        rows: (3),
        placeholder: "生成的分析需求将显示在这里",
    }));
    const __VLS_210 = __VLS_209({
        modelValue: (__VLS_ctx.generatedRequirement),
        type: "textarea",
        rows: (3),
        placeholder: "生成的分析需求将显示在这里",
    }, ...__VLS_functionalComponentArgsRest(__VLS_209));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "requirement-actions" },
    });
    const __VLS_212 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_213 = __VLS_asFunctionalComponent(__VLS_212, new __VLS_212({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_214 = __VLS_213({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_213));
    let __VLS_216;
    let __VLS_217;
    let __VLS_218;
    const __VLS_219 = {
        onClick: (__VLS_ctx.useGeneratedRequirement)
    };
    __VLS_215.slots.default;
    var __VLS_215;
}
var __VLS_159;
const __VLS_220 = {}.ElDivider;
/** @type {[typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, ]} */ ;
// @ts-ignore
const __VLS_221 = __VLS_asFunctionalComponent(__VLS_220, new __VLS_220({
    contentPosition: "left",
}));
const __VLS_222 = __VLS_221({
    contentPosition: "left",
}, ...__VLS_functionalComponentArgsRest(__VLS_221));
__VLS_223.slots.default;
var __VLS_223;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "chat-window" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "chat-messages" },
});
for (const [message, index] of __VLS_getVForSourceType((__VLS_ctx.chatMessages))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (index),
        ...{ class: (['message', message.role]) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "message-content" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "message-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "message-role" },
    });
    (message.role === 'user' ? '用户' : '系统');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "message-time" },
    });
    (message.timestamp);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "message-body" },
    });
    (message.content);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "chat-input" },
});
const __VLS_224 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_225 = __VLS_asFunctionalComponent(__VLS_224, new __VLS_224({
    ...{ 'onKeyup': {} },
    modelValue: (__VLS_ctx.chatInput),
    type: "textarea",
    rows: (3),
    placeholder: "请输入您的数据分析需求...",
}));
const __VLS_226 = __VLS_225({
    ...{ 'onKeyup': {} },
    modelValue: (__VLS_ctx.chatInput),
    type: "textarea",
    rows: (3),
    placeholder: "请输入您的数据分析需求...",
}, ...__VLS_functionalComponentArgsRest(__VLS_225));
let __VLS_228;
let __VLS_229;
let __VLS_230;
const __VLS_231 = {
    onKeyup: (__VLS_ctx.sendMessage)
};
var __VLS_227;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "chat-actions" },
});
const __VLS_232 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_233 = __VLS_asFunctionalComponent(__VLS_232, new __VLS_232({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_234 = __VLS_233({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_233));
let __VLS_236;
let __VLS_237;
let __VLS_238;
const __VLS_239 = {
    onClick: (__VLS_ctx.sendMessage)
};
__VLS_235.slots.default;
var __VLS_235;
const __VLS_240 = {}.ElDivider;
/** @type {[typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, ]} */ ;
// @ts-ignore
const __VLS_241 = __VLS_asFunctionalComponent(__VLS_240, new __VLS_240({
    contentPosition: "left",
}));
const __VLS_242 = __VLS_241({
    contentPosition: "left",
}, ...__VLS_functionalComponentArgsRest(__VLS_241));
__VLS_243.slots.default;
var __VLS_243;
const __VLS_244 = {}.ElForm;
/** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
// @ts-ignore
const __VLS_245 = __VLS_asFunctionalComponent(__VLS_244, new __VLS_244({
    model: (__VLS_ctx.dataSourceForm),
    labelWidth: "80px",
    ...{ class: "data-source-form" },
}));
const __VLS_246 = __VLS_245({
    model: (__VLS_ctx.dataSourceForm),
    labelWidth: "80px",
    ...{ class: "data-source-form" },
}, ...__VLS_functionalComponentArgsRest(__VLS_245));
__VLS_247.slots.default;
const __VLS_248 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_249 = __VLS_asFunctionalComponent(__VLS_248, new __VLS_248({
    label: "数据源",
}));
const __VLS_250 = __VLS_249({
    label: "数据源",
}, ...__VLS_functionalComponentArgsRest(__VLS_249));
__VLS_251.slots.default;
const __VLS_252 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_253 = __VLS_asFunctionalComponent(__VLS_252, new __VLS_252({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.dataSourceForm.datasource_id),
    placeholder: "请选择数据源",
    loading: (__VLS_ctx.isLoadingDatasources),
}));
const __VLS_254 = __VLS_253({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.dataSourceForm.datasource_id),
    placeholder: "请选择数据源",
    loading: (__VLS_ctx.isLoadingDatasources),
}, ...__VLS_functionalComponentArgsRest(__VLS_253));
let __VLS_256;
let __VLS_257;
let __VLS_258;
const __VLS_259 = {
    onChange: (__VLS_ctx.handleDatasourceChange)
};
__VLS_255.slots.default;
for (const [datasource] of __VLS_getVForSourceType((__VLS_ctx.datasources))) {
    const __VLS_260 = {}.ElOption;
    /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
    // @ts-ignore
    const __VLS_261 = __VLS_asFunctionalComponent(__VLS_260, new __VLS_260({
        key: (datasource.id),
        label: (datasource.name),
        value: (datasource.id),
    }));
    const __VLS_262 = __VLS_261({
        key: (datasource.id),
        label: (datasource.name),
        value: (datasource.id),
    }, ...__VLS_functionalComponentArgsRest(__VLS_261));
}
var __VLS_255;
var __VLS_251;
const __VLS_264 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_265 = __VLS_asFunctionalComponent(__VLS_264, new __VLS_264({
    label: "表名",
}));
const __VLS_266 = __VLS_265({
    label: "表名",
}, ...__VLS_functionalComponentArgsRest(__VLS_265));
__VLS_267.slots.default;
const __VLS_268 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_269 = __VLS_asFunctionalComponent(__VLS_268, new __VLS_268({
    modelValue: (__VLS_ctx.dataSourceForm.table_name),
    placeholder: "请选择表名",
    loading: (__VLS_ctx.isLoadingTables),
}));
const __VLS_270 = __VLS_269({
    modelValue: (__VLS_ctx.dataSourceForm.table_name),
    placeholder: "请选择表名",
    loading: (__VLS_ctx.isLoadingTables),
}, ...__VLS_functionalComponentArgsRest(__VLS_269));
__VLS_271.slots.default;
for (const [table] of __VLS_getVForSourceType((__VLS_ctx.tables))) {
    const __VLS_272 = {}.ElOption;
    /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
    // @ts-ignore
    const __VLS_273 = __VLS_asFunctionalComponent(__VLS_272, new __VLS_272({
        key: (table.id),
        label: (table.table_name),
        value: (table.table_name),
    }));
    const __VLS_274 = __VLS_273({
        key: (table.id),
        label: (table.table_name),
        value: (table.table_name),
    }, ...__VLS_functionalComponentArgsRest(__VLS_273));
}
var __VLS_271;
var __VLS_267;
const __VLS_276 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_277 = __VLS_asFunctionalComponent(__VLS_276, new __VLS_276({
    label: "数据输入",
}));
const __VLS_278 = __VLS_277({
    label: "数据输入",
}, ...__VLS_functionalComponentArgsRest(__VLS_277));
__VLS_279.slots.default;
const __VLS_280 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_281 = __VLS_asFunctionalComponent(__VLS_280, new __VLS_280({
    modelValue: (__VLS_ctx.dataSourceForm.data),
    type: "textarea",
    rows: (5),
    placeholder: "请输入JSON格式的数据，或从数据源获取",
}));
const __VLS_282 = __VLS_281({
    modelValue: (__VLS_ctx.dataSourceForm.data),
    type: "textarea",
    rows: (5),
    placeholder: "请输入JSON格式的数据，或从数据源获取",
}, ...__VLS_functionalComponentArgsRest(__VLS_281));
var __VLS_279;
const __VLS_284 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_285 = __VLS_asFunctionalComponent(__VLS_284, new __VLS_284({}));
const __VLS_286 = __VLS_285({}, ...__VLS_functionalComponentArgsRest(__VLS_285));
__VLS_287.slots.default;
const __VLS_288 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_289 = __VLS_asFunctionalComponent(__VLS_288, new __VLS_288({
    ...{ 'onClick': {} },
    type: "primary",
    loading: (__VLS_ctx.isAnalyzing),
}));
const __VLS_290 = __VLS_289({
    ...{ 'onClick': {} },
    type: "primary",
    loading: (__VLS_ctx.isAnalyzing),
}, ...__VLS_functionalComponentArgsRest(__VLS_289));
let __VLS_292;
let __VLS_293;
let __VLS_294;
const __VLS_295 = {
    onClick: (__VLS_ctx.analyzeData)
};
__VLS_291.slots.default;
(__VLS_ctx.isAnalyzing ? '分析中...' : '开始分析');
var __VLS_291;
var __VLS_287;
var __VLS_247;
if (__VLS_ctx.analysisResult) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "analysis-result" },
    });
    const __VLS_296 = {}.ElDivider;
    /** @type {[typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, ]} */ ;
    // @ts-ignore
    const __VLS_297 = __VLS_asFunctionalComponent(__VLS_296, new __VLS_296({
        contentPosition: "left",
    }));
    const __VLS_298 = __VLS_297({
        contentPosition: "left",
    }, ...__VLS_functionalComponentArgsRest(__VLS_297));
    __VLS_299.slots.default;
    var __VLS_299;
    const __VLS_300 = {}.ElCard;
    /** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
    // @ts-ignore
    const __VLS_301 = __VLS_asFunctionalComponent(__VLS_300, new __VLS_300({
        ...{ class: "result-card" },
    }));
    const __VLS_302 = __VLS_301({
        ...{ class: "result-card" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_301));
    __VLS_303.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.pre, __VLS_intrinsicElements.pre)({});
    (__VLS_ctx.analysisResult.result);
    var __VLS_303;
    if (__VLS_ctx.analysisResult.result) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "generated-charts-section" },
        });
        const __VLS_304 = {}.ElDivider;
        /** @type {[typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, ]} */ ;
        // @ts-ignore
        const __VLS_305 = __VLS_asFunctionalComponent(__VLS_304, new __VLS_304({
            contentPosition: "left",
        }));
        const __VLS_306 = __VLS_305({
            contentPosition: "left",
        }, ...__VLS_functionalComponentArgsRest(__VLS_305));
        __VLS_307.slots.default;
        var __VLS_307;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "generated-charts" },
        });
        for (const [chart, key] of __VLS_getVForSourceType((__VLS_ctx.getGeneratedCharts()))) {
            const __VLS_308 = {}.ElCard;
            /** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
            // @ts-ignore
            const __VLS_309 = __VLS_asFunctionalComponent(__VLS_308, new __VLS_308({
                key: (key),
                ...{ class: "chart-item-card" },
            }));
            const __VLS_310 = __VLS_309({
                key: (key),
                ...{ class: "chart-item-card" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_309));
            __VLS_311.slots.default;
            __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
                src: (chart),
                alt: (String(key)),
                ...{ class: "generated-chart" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "chart-caption" },
            });
            (key);
            var __VLS_311;
        }
    }
    if (__VLS_ctx.chartData.length > 0) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "chart-section" },
        });
        const __VLS_312 = {}.ElDivider;
        /** @type {[typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, ]} */ ;
        // @ts-ignore
        const __VLS_313 = __VLS_asFunctionalComponent(__VLS_312, new __VLS_312({
            contentPosition: "left",
        }));
        const __VLS_314 = __VLS_313({
            contentPosition: "left",
        }, ...__VLS_functionalComponentArgsRest(__VLS_313));
        __VLS_315.slots.default;
        var __VLS_315;
        const __VLS_316 = {}.ElCard;
        /** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
        // @ts-ignore
        const __VLS_317 = __VLS_asFunctionalComponent(__VLS_316, new __VLS_316({
            ...{ class: "chart-card" },
        }));
        const __VLS_318 = __VLS_317({
            ...{ class: "chart-card" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_317));
        __VLS_319.slots.default;
        const __VLS_320 = {}.ElSelect;
        /** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
        // @ts-ignore
        const __VLS_321 = __VLS_asFunctionalComponent(__VLS_320, new __VLS_320({
            modelValue: (__VLS_ctx.selectedChartType),
            placeholder: "选择图表类型",
            ...{ class: "chart-type-select" },
        }));
        const __VLS_322 = __VLS_321({
            modelValue: (__VLS_ctx.selectedChartType),
            placeholder: "选择图表类型",
            ...{ class: "chart-type-select" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_321));
        __VLS_323.slots.default;
        const __VLS_324 = {}.ElOption;
        /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
        // @ts-ignore
        const __VLS_325 = __VLS_asFunctionalComponent(__VLS_324, new __VLS_324({
            label: "柱状图",
            value: "bar",
        }));
        const __VLS_326 = __VLS_325({
            label: "柱状图",
            value: "bar",
        }, ...__VLS_functionalComponentArgsRest(__VLS_325));
        const __VLS_328 = {}.ElOption;
        /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
        // @ts-ignore
        const __VLS_329 = __VLS_asFunctionalComponent(__VLS_328, new __VLS_328({
            label: "折线图",
            value: "line",
        }));
        const __VLS_330 = __VLS_329({
            label: "折线图",
            value: "line",
        }, ...__VLS_functionalComponentArgsRest(__VLS_329));
        const __VLS_332 = {}.ElOption;
        /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
        // @ts-ignore
        const __VLS_333 = __VLS_asFunctionalComponent(__VLS_332, new __VLS_332({
            label: "散点图",
            value: "scatter",
        }));
        const __VLS_334 = __VLS_333({
            label: "散点图",
            value: "scatter",
        }, ...__VLS_functionalComponentArgsRest(__VLS_333));
        const __VLS_336 = {}.ElOption;
        /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
        // @ts-ignore
        const __VLS_337 = __VLS_asFunctionalComponent(__VLS_336, new __VLS_336({
            label: "饼图",
            value: "pie",
        }));
        const __VLS_338 = __VLS_337({
            label: "饼图",
            value: "pie",
        }, ...__VLS_functionalComponentArgsRest(__VLS_337));
        const __VLS_340 = {}.ElOption;
        /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
        // @ts-ignore
        const __VLS_341 = __VLS_asFunctionalComponent(__VLS_340, new __VLS_340({
            label: "热力图",
            value: "heatmap",
        }));
        const __VLS_342 = __VLS_341({
            label: "热力图",
            value: "heatmap",
        }, ...__VLS_functionalComponentArgsRest(__VLS_341));
        var __VLS_323;
        const __VLS_344 = {}.ChartComponent;
        /** @type {[typeof __VLS_components.ChartComponent, ]} */ ;
        // @ts-ignore
        const __VLS_345 = __VLS_asFunctionalComponent(__VLS_344, new __VLS_344({
            data: (__VLS_ctx.chartData),
            chartType: (__VLS_ctx.selectedChartType),
            xField: (__VLS_ctx.chartXField),
            yField: (__VLS_ctx.chartYField),
            title: (__VLS_ctx.chartTitle),
        }));
        const __VLS_346 = __VLS_345({
            data: (__VLS_ctx.chartData),
            chartType: (__VLS_ctx.selectedChartType),
            xField: (__VLS_ctx.chartXField),
            yField: (__VLS_ctx.chartYField),
            title: (__VLS_ctx.chartTitle),
        }, ...__VLS_functionalComponentArgsRest(__VLS_345));
        var __VLS_319;
    }
    const __VLS_348 = {}.ElDivider;
    /** @type {[typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, ]} */ ;
    // @ts-ignore
    const __VLS_349 = __VLS_asFunctionalComponent(__VLS_348, new __VLS_348({
        contentPosition: "left",
    }));
    const __VLS_350 = __VLS_349({
        contentPosition: "left",
    }, ...__VLS_functionalComponentArgsRest(__VLS_349));
    __VLS_351.slots.default;
    var __VLS_351;
    const __VLS_352 = {}.ElCard;
    /** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
    // @ts-ignore
    const __VLS_353 = __VLS_asFunctionalComponent(__VLS_352, new __VLS_352({
        ...{ class: "report-card" },
    }));
    const __VLS_354 = __VLS_353({
        ...{ class: "report-card" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_353));
    __VLS_355.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    (__VLS_ctx.analysisResult.report);
    var __VLS_355;
}
var __VLS_151;
const __VLS_356 = {}.ElTabPane;
/** @type {[typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, ]} */ ;
// @ts-ignore
const __VLS_357 = __VLS_asFunctionalComponent(__VLS_356, new __VLS_356({
    label: "分析结果",
    name: "results",
}));
const __VLS_358 = __VLS_357({
    label: "分析结果",
    name: "results",
}, ...__VLS_functionalComponentArgsRest(__VLS_357));
__VLS_359.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "results-section" },
});
const __VLS_360 = {}.ElTable;
/** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
// @ts-ignore
const __VLS_361 = __VLS_asFunctionalComponent(__VLS_360, new __VLS_360({
    data: (__VLS_ctx.analysisResults),
    ...{ style: {} },
}));
const __VLS_362 = __VLS_361({
    data: (__VLS_ctx.analysisResults),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_361));
__VLS_363.slots.default;
const __VLS_364 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_365 = __VLS_asFunctionalComponent(__VLS_364, new __VLS_364({
    prop: "name",
    label: "名称",
    width: "200",
}));
const __VLS_366 = __VLS_365({
    prop: "name",
    label: "名称",
    width: "200",
}, ...__VLS_functionalComponentArgsRest(__VLS_365));
const __VLS_368 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_369 = __VLS_asFunctionalComponent(__VLS_368, new __VLS_368({
    prop: "query",
    label: "分析需求",
    width: "300",
}));
const __VLS_370 = __VLS_369({
    prop: "query",
    label: "分析需求",
    width: "300",
}, ...__VLS_functionalComponentArgsRest(__VLS_369));
const __VLS_372 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_373 = __VLS_asFunctionalComponent(__VLS_372, new __VLS_372({
    prop: "create_time",
    label: "创建时间",
    width: "180",
}));
const __VLS_374 = __VLS_373({
    prop: "create_time",
    label: "创建时间",
    width: "180",
}, ...__VLS_functionalComponentArgsRest(__VLS_373));
const __VLS_376 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_377 = __VLS_asFunctionalComponent(__VLS_376, new __VLS_376({
    prop: "status",
    label: "状态",
    width: "100",
}));
const __VLS_378 = __VLS_377({
    prop: "status",
    label: "状态",
    width: "100",
}, ...__VLS_functionalComponentArgsRest(__VLS_377));
const __VLS_380 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_381 = __VLS_asFunctionalComponent(__VLS_380, new __VLS_380({
    label: "操作",
    width: "150",
}));
const __VLS_382 = __VLS_381({
    label: "操作",
    width: "150",
}, ...__VLS_functionalComponentArgsRest(__VLS_381));
__VLS_383.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_383.slots;
    const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_384 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_385 = __VLS_asFunctionalComponent(__VLS_384, new __VLS_384({
        ...{ 'onClick': {} },
        size: "small",
    }));
    const __VLS_386 = __VLS_385({
        ...{ 'onClick': {} },
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_385));
    let __VLS_388;
    let __VLS_389;
    let __VLS_390;
    const __VLS_391 = {
        onClick: (...[$event]) => {
            __VLS_ctx.viewAnalysisResult(scope.row.id);
        }
    };
    __VLS_387.slots.default;
    var __VLS_387;
}
var __VLS_383;
var __VLS_363;
var __VLS_359;
const __VLS_392 = {}.ElTabPane;
/** @type {[typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, ]} */ ;
// @ts-ignore
const __VLS_393 = __VLS_asFunctionalComponent(__VLS_392, new __VLS_392({
    label: "报告生成",
    name: "report",
}));
const __VLS_394 = __VLS_393({
    label: "报告生成",
    name: "report",
}, ...__VLS_functionalComponentArgsRest(__VLS_393));
__VLS_395.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "report-section" },
});
const __VLS_396 = {}.ElForm;
/** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
// @ts-ignore
const __VLS_397 = __VLS_asFunctionalComponent(__VLS_396, new __VLS_396({
    model: (__VLS_ctx.reportForm),
    labelWidth: "80px",
    ...{ class: "report-form" },
}));
const __VLS_398 = __VLS_397({
    model: (__VLS_ctx.reportForm),
    labelWidth: "80px",
    ...{ class: "report-form" },
}, ...__VLS_functionalComponentArgsRest(__VLS_397));
__VLS_399.slots.default;
const __VLS_400 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_401 = __VLS_asFunctionalComponent(__VLS_400, new __VLS_400({
    label: "报告名称",
}));
const __VLS_402 = __VLS_401({
    label: "报告名称",
}, ...__VLS_functionalComponentArgsRest(__VLS_401));
__VLS_403.slots.default;
const __VLS_404 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_405 = __VLS_asFunctionalComponent(__VLS_404, new __VLS_404({
    modelValue: (__VLS_ctx.reportForm.name),
    placeholder: "请输入报告名称",
}));
const __VLS_406 = __VLS_405({
    modelValue: (__VLS_ctx.reportForm.name),
    placeholder: "请输入报告名称",
}, ...__VLS_functionalComponentArgsRest(__VLS_405));
var __VLS_403;
const __VLS_408 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_409 = __VLS_asFunctionalComponent(__VLS_408, new __VLS_408({
    label: "分析结果",
}));
const __VLS_410 = __VLS_409({
    label: "分析结果",
}, ...__VLS_functionalComponentArgsRest(__VLS_409));
__VLS_411.slots.default;
const __VLS_412 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_413 = __VLS_asFunctionalComponent(__VLS_412, new __VLS_412({
    modelValue: (__VLS_ctx.reportForm.analysis_result_ids),
    multiple: true,
    placeholder: "请选择分析结果",
    ...{ style: {} },
}));
const __VLS_414 = __VLS_413({
    modelValue: (__VLS_ctx.reportForm.analysis_result_ids),
    multiple: true,
    placeholder: "请选择分析结果",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_413));
__VLS_415.slots.default;
for (const [result] of __VLS_getVForSourceType((__VLS_ctx.analysisResults))) {
    const __VLS_416 = {}.ElOption;
    /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
    // @ts-ignore
    const __VLS_417 = __VLS_asFunctionalComponent(__VLS_416, new __VLS_416({
        key: (result.id),
        label: (result.name || `分析_${result.id}`),
        value: (result.id),
    }));
    const __VLS_418 = __VLS_417({
        key: (result.id),
        label: (result.name || `分析_${result.id}`),
        value: (result.id),
    }, ...__VLS_functionalComponentArgsRest(__VLS_417));
}
var __VLS_415;
var __VLS_411;
const __VLS_420 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_421 = __VLS_asFunctionalComponent(__VLS_420, new __VLS_420({
    label: "对话记录",
}));
const __VLS_422 = __VLS_421({
    label: "对话记录",
}, ...__VLS_functionalComponentArgsRest(__VLS_421));
__VLS_423.slots.default;
const __VLS_424 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_425 = __VLS_asFunctionalComponent(__VLS_424, new __VLS_424({
    modelValue: (__VLS_ctx.reportForm.chat_record_ids),
    multiple: true,
    placeholder: "请选择对话记录",
    ...{ style: {} },
}));
const __VLS_426 = __VLS_425({
    modelValue: (__VLS_ctx.reportForm.chat_record_ids),
    multiple: true,
    placeholder: "请选择对话记录",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_425));
__VLS_427.slots.default;
const __VLS_428 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_429 = __VLS_asFunctionalComponent(__VLS_428, new __VLS_428({
    label: "测试对话 1",
    value: "1",
}));
const __VLS_430 = __VLS_429({
    label: "测试对话 1",
    value: "1",
}, ...__VLS_functionalComponentArgsRest(__VLS_429));
const __VLS_432 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_433 = __VLS_asFunctionalComponent(__VLS_432, new __VLS_432({
    label: "测试对话 2",
    value: "2",
}));
const __VLS_434 = __VLS_433({
    label: "测试对话 2",
    value: "2",
}, ...__VLS_functionalComponentArgsRest(__VLS_433));
var __VLS_427;
var __VLS_423;
const __VLS_436 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_437 = __VLS_asFunctionalComponent(__VLS_436, new __VLS_436({}));
const __VLS_438 = __VLS_437({}, ...__VLS_functionalComponentArgsRest(__VLS_437));
__VLS_439.slots.default;
const __VLS_440 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_441 = __VLS_asFunctionalComponent(__VLS_440, new __VLS_440({
    ...{ 'onClick': {} },
    type: "primary",
    loading: (__VLS_ctx.isGenerating),
}));
const __VLS_442 = __VLS_441({
    ...{ 'onClick': {} },
    type: "primary",
    loading: (__VLS_ctx.isGenerating),
}, ...__VLS_functionalComponentArgsRest(__VLS_441));
let __VLS_444;
let __VLS_445;
let __VLS_446;
const __VLS_447 = {
    onClick: (__VLS_ctx.createReport)
};
__VLS_443.slots.default;
(__VLS_ctx.isGenerating ? '生成中...' : '生成报告');
var __VLS_443;
var __VLS_439;
var __VLS_399;
const __VLS_448 = {}.ElDivider;
/** @type {[typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, ]} */ ;
// @ts-ignore
const __VLS_449 = __VLS_asFunctionalComponent(__VLS_448, new __VLS_448({
    contentPosition: "left",
}));
const __VLS_450 = __VLS_449({
    contentPosition: "left",
}, ...__VLS_functionalComponentArgsRest(__VLS_449));
__VLS_451.slots.default;
var __VLS_451;
const __VLS_452 = {}.ElTable;
/** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
// @ts-ignore
const __VLS_453 = __VLS_asFunctionalComponent(__VLS_452, new __VLS_452({
    data: (__VLS_ctx.reports),
    ...{ style: {} },
}));
const __VLS_454 = __VLS_453({
    data: (__VLS_ctx.reports),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_453));
__VLS_455.slots.default;
const __VLS_456 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_457 = __VLS_asFunctionalComponent(__VLS_456, new __VLS_456({
    prop: "name",
    label: "名称",
    width: "200",
}));
const __VLS_458 = __VLS_457({
    prop: "name",
    label: "名称",
    width: "200",
}, ...__VLS_functionalComponentArgsRest(__VLS_457));
const __VLS_460 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_461 = __VLS_asFunctionalComponent(__VLS_460, new __VLS_460({
    prop: "create_time",
    label: "创建时间",
    width: "180",
}));
const __VLS_462 = __VLS_461({
    prop: "create_time",
    label: "创建时间",
    width: "180",
}, ...__VLS_functionalComponentArgsRest(__VLS_461));
const __VLS_464 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_465 = __VLS_asFunctionalComponent(__VLS_464, new __VLS_464({
    prop: "status",
    label: "状态",
    width: "100",
}));
const __VLS_466 = __VLS_465({
    prop: "status",
    label: "状态",
    width: "100",
}, ...__VLS_functionalComponentArgsRest(__VLS_465));
const __VLS_468 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_469 = __VLS_asFunctionalComponent(__VLS_468, new __VLS_468({
    label: "操作",
    width: "150",
}));
const __VLS_470 = __VLS_469({
    label: "操作",
    width: "150",
}, ...__VLS_functionalComponentArgsRest(__VLS_469));
__VLS_471.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_471.slots;
    const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_472 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_473 = __VLS_asFunctionalComponent(__VLS_472, new __VLS_472({
        ...{ 'onClick': {} },
        size: "small",
    }));
    const __VLS_474 = __VLS_473({
        ...{ 'onClick': {} },
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_473));
    let __VLS_476;
    let __VLS_477;
    let __VLS_478;
    const __VLS_479 = {
        onClick: (...[$event]) => {
            __VLS_ctx.viewReport(scope.row.id);
        }
    };
    __VLS_475.slots.default;
    var __VLS_475;
}
var __VLS_471;
var __VLS_455;
var __VLS_395;
var __VLS_7;
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['data-agent-container']} */ ;
/** @type {__VLS_StyleScopedClasses['data-agent-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-header']} */ ;
/** @type {__VLS_StyleScopedClasses['data-agent-tabs']} */ ;
/** @type {__VLS_StyleScopedClasses['basic-stats-section']} */ ;
/** @type {__VLS_StyleScopedClasses['data-source-form']} */ ;
/** @type {__VLS_StyleScopedClasses['basic-stats-result']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-card']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-info']} */ ;
/** @type {__VLS_StyleScopedClasses['columns-card']} */ ;
/** @type {__VLS_StyleScopedClasses['quality-card']} */ ;
/** @type {__VLS_StyleScopedClasses['quality-info']} */ ;
/** @type {__VLS_StyleScopedClasses['sample-card']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-sample']} */ ;
/** @type {__VLS_StyleScopedClasses['analysis-section']} */ ;
/** @type {__VLS_StyleScopedClasses['analysis-suggestion-card']} */ ;
/** @type {__VLS_StyleScopedClasses['analysis-form']} */ ;
/** @type {__VLS_StyleScopedClasses['column-hint']} */ ;
/** @type {__VLS_StyleScopedClasses['column-hint']} */ ;
/** @type {__VLS_StyleScopedClasses['generated-requirement']} */ ;
/** @type {__VLS_StyleScopedClasses['requirement-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-window']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-messages']} */ ;
/** @type {__VLS_StyleScopedClasses['message']} */ ;
/** @type {__VLS_StyleScopedClasses['message-content']} */ ;
/** @type {__VLS_StyleScopedClasses['message-header']} */ ;
/** @type {__VLS_StyleScopedClasses['message-role']} */ ;
/** @type {__VLS_StyleScopedClasses['message-time']} */ ;
/** @type {__VLS_StyleScopedClasses['message-body']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-input']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['data-source-form']} */ ;
/** @type {__VLS_StyleScopedClasses['analysis-result']} */ ;
/** @type {__VLS_StyleScopedClasses['result-card']} */ ;
/** @type {__VLS_StyleScopedClasses['generated-charts-section']} */ ;
/** @type {__VLS_StyleScopedClasses['generated-charts']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-item-card']} */ ;
/** @type {__VLS_StyleScopedClasses['generated-chart']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-caption']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-section']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-card']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-type-select']} */ ;
/** @type {__VLS_StyleScopedClasses['report-card']} */ ;
/** @type {__VLS_StyleScopedClasses['results-section']} */ ;
/** @type {__VLS_StyleScopedClasses['report-section']} */ ;
/** @type {__VLS_StyleScopedClasses['report-form']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            ChartComponent: ChartComponent,
            activeTab: activeTab,
            chatMessages: chatMessages,
            chatInput: chatInput,
            dataSourceForm: dataSourceForm,
            analysisForm: analysisForm,
            reportForm: reportForm,
            analysisResult: analysisResult,
            analysisResults: analysisResults,
            reports: reports,
            basicStatsResult: basicStatsResult,
            analysisTypes: analysisTypes,
            datasources: datasources,
            tables: tables,
            isLoadingDatasources: isLoadingDatasources,
            isLoadingTables: isLoadingTables,
            filteredColumns: filteredColumns,
            generatedRequirement: generatedRequirement,
            chartData: chartData,
            selectedChartType: selectedChartType,
            chartXField: chartXField,
            chartYField: chartYField,
            chartTitle: chartTitle,
            isAnalyzing: isAnalyzing,
            isGenerating: isGenerating,
            isLoadingBasicStats: isLoadingBasicStats,
            isGeneratingRequirement: isGeneratingRequirement,
            currentAnalysisType: currentAnalysisType,
            sendMessage: sendMessage,
            analyzeData: analyzeData,
            createReport: createReport,
            viewAnalysisResult: viewAnalysisResult,
            viewReport: viewReport,
            getBasicStats: getBasicStats,
            handleAnalysisTypeChange: handleAnalysisTypeChange,
            handleDatasourceChange: handleDatasourceChange,
            generateRequirement: generateRequirement,
            useGeneratedRequirement: useGeneratedRequirement,
            getGeneratedCharts: getGeneratedCharts,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
