import { ref, reactive, onMounted, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { dataAgentApi } from '@/api/dataAgent';
import { datasourceApi } from '@/api/datasource';
import { chatApi, ChatInfo } from '@/api/chat';
import AnalysisChatList from './AnalysisChatList.vue';
import icon_sidebar_outlined from '@/assets/svg/icon_sidebar_outlined.svg';
import icon_new_chat_outlined from '@/assets/svg/icon_new_chat_outlined.svg';
const props = defineProps();
// 侧栏相关
const sidebarVisible = ref(true);
const currentChatId = ref();
const currentChat = ref(new ChatInfo());
const isLoadingChat = ref(false);
// 隐藏侧栏
const hideSidebar = () => {
    sidebarVisible.value = false;
};
// 显示侧栏
const showSidebar = () => {
    sidebarVisible.value = true;
};
// 创建新分析
const createNewAnalysis = () => {
    currentChatId.value = undefined;
    currentChat.value = new ChatInfo();
    // 重置表单
    dataSourceForm.datasource_id = null;
    dataSourceForm.table_name = '';
    dataPreview.value = [];
    dataColumns.value = [];
    chatMessages.value = [];
    analysisResult.value = null;
};
// 会话创建回调
const onChatCreated = (chat) => {
    console.log('Chat created:', chat);
};
// 会话历史回调
const onChatHistory = (chat) => {
    console.log('Chat history:', chat);
    console.log('Records length:', chat.records?.length || 0);
    // 加载会话数据
    if (chat.datasource) {
        dataSourceForm.datasource_id = chat.datasource;
        loadTables();
    }
    // 检查会话记录
    if (chat.records && chat.records.length > 0) {
        // 获取最新的记录（不依赖 analysis 字段）
        const latestAnalysisRecord = [...chat.records].reverse()[0];
        console.log('Latest analysis record:', latestAnalysisRecord);
        console.log('Record has analysis:', !!latestAnalysisRecord.analysis);
        if (latestAnalysisRecord) {
            const formatTimestamp = (date) => {
                if (!date)
                    return new Date().toISOString();
                if (date instanceof Date)
                    return date.toISOString();
                return date;
            };
            // 填充聊天消息
            const messages = [
                {
                    role: 'user',
                    content: latestAnalysisRecord.question || chat.brief || '数据分析请求',
                    timestamp: formatTimestamp(latestAnalysisRecord.create_time)
                }
            ];
            // 如果有分析报告，添加系统回复
            if (latestAnalysisRecord.analysis) {
                try {
                    const analysisData = typeof latestAnalysisRecord.analysis === 'string'
                        ? JSON.parse(latestAnalysisRecord.analysis)
                        : latestAnalysisRecord.analysis;
                    if (analysisData.content) {
                        messages.push({
                            role: 'system',
                            content: analysisData.content,
                            timestamp: formatTimestamp(latestAnalysisRecord.finish_time || latestAnalysisRecord.create_time)
                        });
                    }
                }
                catch (e) {
                    console.error('解析分析报告失败:', e);
                }
            }
            chatMessages.value = messages;
            // 处理分析结果
            if (latestAnalysisRecord.analysis) {
                let analysisData;
                try {
                    analysisData = typeof latestAnalysisRecord.analysis === 'string'
                        ? JSON.parse(latestAnalysisRecord.analysis)
                        : latestAnalysisRecord.analysis;
                }
                catch (e) {
                    console.error('解析分析数据失败:', e);
                }
                if (analysisData) {
                    // 添加系统回复
                    chatMessages.value.push({
                        role: 'system',
                        content: analysisData.content || analysisData.report || '分析完成',
                        timestamp: formatTimestamp(latestAnalysisRecord.finish_time || latestAnalysisRecord.create_time)
                    });
                    // 设置分析结果
                    if (analysisData.content) {
                        try {
                            const result = JSON.parse(analysisData.content);
                            analysisResult.value = {
                                success: true,
                                result: result,
                                report: analysisData.report,
                                analysis_id: latestAnalysisRecord.id
                            };
                        }
                        catch (e) {
                            analysisResult.value = {
                                success: true,
                                result: analysisData.content,
                                report: analysisData.report,
                                analysis_id: latestAnalysisRecord.id
                            };
                        }
                    }
                    else if (analysisData.report) {
                        analysisResult.value = {
                            success: true,
                            result: '',
                            report: analysisData.report,
                            analysis_id: latestAnalysisRecord.id
                        };
                    }
                }
                else {
                    // 如果 analysis 字段存在但解析失败
                    chatMessages.value.push({
                        role: 'system',
                        content: '分析完成',
                        timestamp: formatTimestamp(latestAnalysisRecord.finish_time || latestAnalysisRecord.create_time)
                    });
                }
            }
        }
        // 切换到分析标签页
        activeTab.value = 'analysis';
        resultTab.value = 'result';
    }
};
// 聊天消息
const chatMessages = ref([]);
const chatInput = ref('');
// 数据源表单
const dataSourceForm = reactive({
    datasource_id: null,
    table_name: ''
});
// 数据源和表列表
const datasources = ref([]);
const tables = ref([]);
// 数据预览
const dataPreview = ref([]);
const dataColumns = ref([]);
// 分析需求建议
const analysisSuggestions = ref([
    '分析数据的基本统计信息',
    '分析数据的分布情况',
    '分析数据中的异常值',
    '分析数据的趋势变化',
    '分析数据之间的相关性',
    '分析数据的分类统计',
    '分析数据的时间序列变化',
    '分析数据的聚合统计'
]);
// 分析结果
const analysisResult = ref(null);
const analysisResults = ref([]);
// 分析结果详情弹窗
const resultDialogVisible = ref(false);
const selectedAnalysisResult = ref(null);
// 数据基本统计结果
const basicStatsResult = ref(null);
// 分析类型列表
const analysisTypes = ref([]);
// 可用列列表
const availableColumns = ref([]);
// 分析表单
const analysisForm = reactive({
    analysis_type: '',
    selected_columns: []
});
// 生成的分析需求
const generatedRequirement = ref('');
// 加载状态和Tab
const isAnalyzing = ref(false);
const activeTab = ref('basic-stats');
const resultTab = ref('result');
const isLoadingBasicStats = ref(false);
const isLoadingAnalysisTypes = ref(false);
const isGeneratingRequirement = ref(false);
// 加载数据源列表
const loadDatasources = async () => {
    try {
        const response = await datasourceApi.list();
        datasources.value = response || [];
    }
    catch (error) {
        console.error('加载数据源失败:', error);
        ElMessage.error('加载数据源失败');
    }
};
// 加载表列表
const loadTables = async () => {
    if (!dataSourceForm.datasource_id) {
        tables.value = [];
        dataPreview.value = [];
        dataColumns.value = [];
        return;
    }
    try {
        const response = await datasourceApi.tableList(dataSourceForm.datasource_id);
        tables.value = response || [];
    }
    catch (error) {
        console.error('加载表列表失败:', error);
        ElMessage.error('加载表列表失败');
    }
};
// 生成基于字段名称的分析建议
const generateFieldBasedSuggestions = async () => {
    if (!dataSourceForm.datasource_id || !dataSourceForm.table_name || availableColumns.value.length === 0) {
        return;
    }
    try {
        console.log('Generating field-based suggestions...');
        // 准备字段信息
        const fieldsInfo = availableColumns.value.map(col => ({
            name: col.name,
            type: col.type
        }));
        console.log('Fields info:', fieldsInfo);
        // 调用后端API生成分析建议
        const request = {
            query: '基于字段名称生成分析建议',
            data: JSON.stringify(fieldsInfo),
            datasource_id: dataSourceForm.datasource_id,
            table_name: dataSourceForm.table_name
        };
        console.log('Request:', request);
        const response = await dataAgentApi.analyzeData(request);
        console.log('Response:', response);
        if (response.success && response.result) {
            try {
                const suggestions = JSON.parse(response.result);
                console.log('Suggestions:', suggestions);
                if (suggestions && Array.isArray(suggestions)) {
                    // 过滤掉空的建议
                    const validSuggestions = suggestions.filter(suggestion => suggestion && suggestion.trim());
                    // 如果有有效的建议，更新分析需求建议
                    if (validSuggestions.length > 0) {
                        analysisSuggestions.value = validSuggestions;
                        console.log('Updated analysis suggestions:', analysisSuggestions.value);
                    }
                    else {
                        // 如果没有有效的建议，使用默认建议
                        console.warn('No valid suggestions generated, using default');
                        analysisSuggestions.value = [
                            '分析数据的基本统计信息',
                            '分析数据的分布情况',
                            '分析数据中的异常值',
                            '分析数据的趋势变化',
                            '分析数据之间的相关性'
                        ];
                    }
                }
                else {
                    console.error('分析建议格式错误:', suggestions);
                    // 如果格式错误，使用默认建议
                    analysisSuggestions.value = [
                        '分析数据的基本统计信息',
                        '分析数据的分布情况',
                        '分析数据中的异常值',
                        '分析数据的趋势变化',
                        '分析数据之间的相关性'
                    ];
                }
            }
            catch (e) {
                console.error('解析分析建议失败:', e);
                // 如果解析失败，使用默认建议
                analysisSuggestions.value = [
                    '分析数据的基本统计信息',
                    '分析数据的分布情况',
                    '分析数据中的异常值',
                    '分析数据的趋势变化',
                    '分析数据之间的相关性'
                ];
            }
        }
        else {
            console.error('生成分析建议失败:', response.error);
            // 如果API调用失败，使用默认建议
            analysisSuggestions.value = [
                '分析数据的基本统计信息',
                '分析数据的分布情况',
                '分析数据中的异常值',
                '分析数据的趋势变化',
                '分析数据之间的相关性'
            ];
        }
    }
    catch (error) {
        console.error('生成分析建议失败:', error);
        // 如果发生异常，使用默认建议
        analysisSuggestions.value = [
            '分析数据的基本统计信息',
            '分析数据的分布情况',
            '分析数据中的异常值',
            '分析数据的趋势变化',
            '分析数据之间的相关性'
        ];
    }
};
// 加载数据预览
const loadDataPreview = async () => {
    if (!dataSourceForm.datasource_id || !dataSourceForm.table_name) {
        dataPreview.value = [];
        dataColumns.value = [];
        availableColumns.value = [];
        return;
    }
    try {
        // 调用后端API获取数据预览
        const request = {
            query: '获取数据前5条',
            data: '',
            datasource_id: dataSourceForm.datasource_id,
            table_name: dataSourceForm.table_name
        };
        console.log('加载数据预览请求参数:', request);
        const response = await dataAgentApi.analyzeData(request);
        console.log('加载数据预览响应结果:', response);
        if (response.success && response.result) {
            try {
                const resultData = JSON.parse(response.result);
                console.log('解析后的数据预览:', resultData);
                if (resultData && Array.isArray(resultData)) {
                    // 限制数据预览为前5条，减少前端渲染负担
                    dataPreview.value = resultData.slice(0, 5);
                    if (dataPreview.value.length > 0) {
                        dataColumns.value = Object.keys(dataPreview.value[0]);
                        console.log('数据列:', dataColumns.value);
                        // 自动填充availableColumns，根据数据内容推断类型
                        availableColumns.value = dataColumns.value.map(col => {
                            // 尝试推断列类型
                            let colType = 'string';
                            // 检查前5条数据，尝试推断类型
                            for (const row of dataPreview.value) {
                                const value = row[col];
                                if (value !== null && value !== undefined) {
                                    if (typeof value === 'number') {
                                        colType = 'numeric';
                                        break;
                                    }
                                    else if (typeof value === 'boolean') {
                                        colType = 'boolean';
                                        break;
                                    }
                                    else if (!isNaN(Date.parse(value))) {
                                        colType = 'datetime';
                                        break;
                                    }
                                }
                            }
                            return {
                                name: col,
                                type: colType
                            };
                        });
                        console.log('Available columns:', availableColumns.value);
                        // 生成基于字段名称的分析建议
                        await generateFieldBasedSuggestions();
                    }
                }
            }
            catch (e) {
                console.error('解析数据预览失败:', e);
                ElMessage.error('解析数据预览失败');
            }
        }
        else {
            console.error('加载数据预览失败:', response.error);
            ElMessage.error('加载数据预览失败');
        }
    }
    catch (error) {
        console.error('加载数据预览失败:', error);
        ElMessage.error('加载数据预览失败');
    }
};
// 使用分析需求建议
const useSuggestion = (suggestion) => {
    chatInput.value = suggestion;
};
// 发送消息
const sendMessage = async () => {
    if (!chatInput.value.trim()) {
        ElMessage.warning('请输入分析需求');
        return;
    }
    if (!dataSourceForm.datasource_id) {
        ElMessage.warning('请选择数据源');
        return;
    }
    if (!dataSourceForm.table_name) {
        ElMessage.warning('请选择表名');
        return;
    }
    // 添加用户消息
    chatMessages.value.push({
        role: 'user',
        content: chatInput.value,
        timestamp: new Date().toLocaleString()
    });
    const query = chatInput.value;
    chatInput.value = '';
    await analyzeData(query);
};
// 执行数据分析
const analyzeData = async (query) => {
    isAnalyzing.value = true;
    try {
        // 准备请求数据
        let requestData = '';
        if (dataSourceForm.datasource_id && dataSourceForm.table_name) {
            // 如果有数据源和表名，不设置data参数，让后端从数据源获取
            requestData = '';
        }
        else {
            // 否则使用查询作为数据
            requestData = query;
        }
        const request = {
            query: query,
            data: requestData,
            datasource_id: dataSourceForm.datasource_id ?? undefined,
            table_name: dataSourceForm.table_name,
            analysis_type: analysisForm.analysis_type || undefined,
            selected_columns: analysisForm.selected_columns.length > 0 ? analysisForm.selected_columns : undefined,
        };
        console.log('分析请求参数:', request);
        const response = await dataAgentApi.analyzeData(request);
        console.log('分析响应结果:', response);
        analysisResult.value = response;
        if (response.success) {
            // 添加系统回复
            chatMessages.value.push({
                role: 'system',
                content: response.report || '分析完成',
                timestamp: new Date().toLocaleString()
            });
            // 刷新分析结果列表
            await loadAnalysisResults();
        }
        else {
            // 显示错误信息
            const errorMessage = response.error || '分析失败';
            ElMessage.error(errorMessage);
            // 添加错误回复到聊天记录
            chatMessages.value.push({
                role: 'system',
                content: `分析失败: ${errorMessage}`,
                timestamp: new Date().toLocaleString()
            });
        }
    }
    catch (error) {
        // 处理网络错误或其他异常
        const errorMessage = error instanceof Error ? error.message : '分析过程中出现错误';
        ElMessage.error(errorMessage);
        console.error('分析错误:', error);
        // 添加错误回复到聊天记录
        chatMessages.value.push({
            role: 'system',
            content: `分析失败: ${errorMessage}`,
            timestamp: new Date().toLocaleString()
        });
    }
    finally {
        // 确保无论成功还是失败，都设置isAnalyzing为false
        isAnalyzing.value = false;
        console.log('分析完成，isAnalyzing设置为false');
    }
};
// 查看分析结果
const viewAnalysisResult = (result) => {
    // 设置分析结果（即使没有result_summary也要显示）
    analysisResult.value = {
        success: result.status === 'success',
        result: result.result_data || '',
        report: result.result_summary || '',
        analysis_id: result.id
    };
    chatMessages.value = [
        {
            role: 'user',
            content: result.query || '',
            timestamp: result.create_time
        },
        {
            role: 'system',
            content: result.result_summary || result.result_data || '分析完成',
            timestamp: result.create_time
        }
    ];
    // 切换到分析结果标签页，显示分析内容
    activeTab.value = 'analysis';
    // 切换到分析结果子标签页（使用正确的变量名）
    resultTab.value = 'result';
};
// 打开分析结果详情弹窗
const openResultDialog = (result) => {
    selectedAnalysisResult.value = result;
    resultDialogVisible.value = true;
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
// 当前选择的分析类型
const currentAnalysisType = computed(() => {
    if (!analysisForm.analysis_type)
        return null;
    const type = analysisTypes.value.find(type => type.id === analysisForm.analysis_type) || null;
    console.log('Current analysis type:', type);
    return type;
});
// 过滤后的可用列列表（根据分析类型的数据类型要求）
const filteredColumns = computed(() => {
    if (!currentAnalysisType.value)
        return availableColumns.value;
    const requiredTypes = currentAnalysisType.value.column_types;
    console.log('Required types:', requiredTypes);
    console.log('Available columns:', availableColumns.value);
    const filtered = availableColumns.value.filter(column => {
        // 映射前端列类型到后端定义的类型
        const columnType = column.type.toLowerCase();
        console.log('Checking column:', column.name, 'with type:', columnType);
        // 检查列类型是否符合任何一个要求的类型
        for (const requiredType of requiredTypes) {
            if (requiredType === 'numeric' && columnType === 'numeric') {
                console.log('Is numeric:', true);
                return true;
            }
            else if (requiredType === 'datetime' && columnType === 'datetime') {
                console.log('Is datetime:', true);
                return true;
            }
            else if (requiredType === 'string' && columnType === 'string') {
                console.log('Is string:', true);
                return true;
            }
        }
        // 如果没有找到匹配的类型，默认不允许该列
        console.log('No matching type found');
        return false;
    });
    console.log('Filtered columns:', filtered);
    return filtered;
});
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
// 获取数据基本统计信息
const getBasicStats = async () => {
    if (!dataSourceForm.datasource_id || !dataSourceForm.table_name) {
        ElMessage.warning('请选择数据源和表名');
        return;
    }
    isLoadingBasicStats.value = true;
    try {
        const request = {
            datasource_id: dataSourceForm.datasource_id,
            table_name: dataSourceForm.table_name
        };
        console.log('获取数据基本统计请求参数:', request);
        const response = await dataAgentApi.getDataBasicStats(request);
        console.log('获取数据基本统计响应结果:', response);
        if (response.success) {
            basicStatsResult.value = response;
            // 更新可用列列表
            availableColumns.value = response.columns_info.map(col => ({
                name: col.name,
                type: col.type
            }));
            console.log('更新后的可用列列表:', availableColumns.value);
            // 生成基于字段名称的分析建议
            await generateFieldBasedSuggestions();
        }
        else {
            const errorMessage = response.error || '获取数据统计失败';
            ElMessage.error(errorMessage);
        }
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : '获取数据统计过程中出现错误';
        ElMessage.error(errorMessage);
        console.error('获取数据统计错误:', error);
    }
    finally {
        isLoadingBasicStats.value = false;
    }
};
// 生成分析需求
const generateRequirement = async () => {
    if (!analysisForm.analysis_type || analysisForm.selected_columns.length === 0) {
        ElMessage.warning('请选择分析类型和列');
        return;
    }
    if (currentAnalysisType.value?.required_columns === 1 && analysisForm.selected_columns.length !== 1) {
        ElMessage.warning('该分析类型需要选择一列');
        return;
    }
    if (currentAnalysisType.value?.required_columns === 2 && analysisForm.selected_columns.length < 2) {
        ElMessage.warning('该分析类型需要选择至少两列');
        return;
    }
    if (!dataSourceForm.datasource_id) {
        ElMessage.warning('请选择数据源');
        return;
    }
    if (!dataSourceForm.table_name) {
        ElMessage.warning('请选择表名');
        return;
    }
    isGeneratingRequirement.value = true;
    try {
        const request = {
            analysis_type: analysisForm.analysis_type,
            selected_columns: analysisForm.selected_columns,
            datasource_id: dataSourceForm.datasource_id,
            table_name: dataSourceForm.table_name
        };
        console.log('生成分析需求请求参数:', request);
        const response = await dataAgentApi.generateRequirement(request);
        console.log('生成分析需求响应结果:', response);
        if (response.success) {
            generatedRequirement.value = response.requirement;
        }
        else {
            const errorMessage = response.error || '生成分析需求失败';
            ElMessage.error(errorMessage);
        }
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : '生成分析需求过程中出现错误';
        ElMessage.error(errorMessage);
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
    }
};
// 渲染Markdown
const renderMarkdown = (content) => {
    return content
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/gim, '<em>$1</em>')
        .replace(/\n/gim, '<br>');
};
// 判断是否为相关性分析
const isCorrelationAnalysis = computed(() => {
    if (!analysisResult.value || !analysisResult.value.result)
        return false;
    try {
        const result = JSON.parse(analysisResult.value.result);
        return result.analysis_type === 'correlation';
    }
    catch (e) {
        return false;
    }
});
// 解析分析结果
const parsedAnalysisResult = computed(() => {
    if (!analysisResult.value || !analysisResult.value.result)
        return {};
    try {
        return JSON.parse(analysisResult.value.result);
    }
    catch (e) {
        return {};
    }
});
// 弹窗中选中分析结果的解析数据
const selectedResultParsed = computed(() => {
    if (!selectedAnalysisResult.value || !selectedAnalysisResult.value.result_data)
        return {};
    try {
        return JSON.parse(selectedAnalysisResult.value.result_data);
    }
    catch (e) {
        return {};
    }
});
// 弹窗中相关性矩阵数据
const selectedCorrelationMatrixData = computed(() => {
    if (!selectedResultParsed.value.correlation_matrix)
        return [];
    const matrix = selectedResultParsed.value.correlation_matrix;
    return Object.entries(matrix).map(([column, values]) => ({
        column,
        ...values
    }));
});
// 弹窗中相关性列名
const selectedCorrelationColumns = computed(() => {
    if (!selectedResultParsed.value.correlation_matrix)
        return [];
    return Object.keys(selectedResultParsed.value.correlation_matrix);
});
// 判断是否为描述性统计分析
const isDescriptiveAnalysis = computed(() => {
    return parsedAnalysisResult.value.analysis_type === 'descriptive';
});
// 判断是否为分布分析
const isDistributionAnalysis = computed(() => {
    return parsedAnalysisResult.value.analysis_type === 'distribution';
});
// 判断是否为异常检测分析
const isAnomalyAnalysis = computed(() => {
    return parsedAnalysisResult.value.analysis_type === 'anomaly';
});
// 判断是否为趋势分析
const isTrendAnalysis = computed(() => {
    return parsedAnalysisResult.value.analysis_type === 'trend';
});
// 判断是否为时间序列分析
const isTimeSeriesAnalysis = computed(() => {
    return parsedAnalysisResult.value.analysis_type === 'time_series';
});
// 判断是否为预测分析
const isPredictionAnalysis = computed(() => {
    return parsedAnalysisResult.value.analysis_type === 'prediction';
});
// 判断是否为聚类分析
const isClusteringAnalysis = computed(() => {
    return parsedAnalysisResult.value.analysis_type === 'clustering';
});
// 判断是否为回归分析
const isRegressionAnalysis = computed(() => {
    return parsedAnalysisResult.value.analysis_type === 'regression';
});
// 格式化统计指标的键名
const formatStatKey = (key) => {
    const keyMap = {
        'count': '计数',
        'mean': '均值',
        'std': '标准差',
        'min': '最小值',
        '25%': '25%分位数',
        '50%': '中位数',
        '75%': '75%分位数',
        'max': '最大值',
        'unique': '唯一值数量',
        'top': '最常见值',
        'freq': '最常见值频率'
    };
    return keyMap[key] || key;
};
// 相关性矩阵数据
const correlationMatrixData = computed(() => {
    if (!analysisResult.value || !analysisResult.value.result)
        return [];
    try {
        const result = JSON.parse(analysisResult.value.result);
        if (!result.correlation_matrix)
            return [];
        const matrix = result.correlation_matrix;
        const columns = Object.keys(matrix);
        return columns.map(col => {
            const row = { column: col };
            columns.forEach(c => {
                row[c] = matrix[col][c];
            });
            return row;
        });
    }
    catch (e) {
        return [];
    }
});
// 相关性矩阵列名
const correlationColumns = computed(() => {
    if (!analysisResult.value || !analysisResult.value.result)
        return [];
    try {
        const result = JSON.parse(analysisResult.value.result);
        if (!result.correlation_matrix)
            return [];
        return Object.keys(result.correlation_matrix);
    }
    catch (e) {
        return [];
    }
});
// 根据相关系数值获取样式类
const getCorrelationClass = (value) => {
    if (value === 1)
        return 'correlation-1';
    if (value > 0.7)
        return 'correlation-high';
    if (value > 0.3)
        return 'correlation-medium';
    if (value > 0)
        return 'correlation-low';
    if (value > -0.3)
        return 'correlation-negative-low';
    if (value > -0.7)
        return 'correlation-negative-medium';
    return 'correlation-negative-high';
};
// 从URL参数加载分析会话
async function loadAnalysisFromParams() {
    if (props.chat_id) {
        try {
            const chatId = parseInt(props.chat_id);
            if (!isNaN(chatId)) {
                // 加载指定的聊天会话
                const chatInfo = await chatApi.get(chatId);
                console.log('Chat info:', chatInfo);
                if (chatInfo && chatInfo.records) {
                    // 找到对应的分析记录
                    if (props.record_id) {
                        const recordId = parseInt(props.record_id);
                        if (!isNaN(recordId)) {
                            const record = chatInfo.records.find((r) => r.id === recordId && r.analysis_record_id);
                            console.log('Found record:', record);
                            if (record) {
                                // 切换到分析标签页
                                activeTab.value = 'analysis';
                                // 设置数据源
                                if (chatInfo.datasource) {
                                    dataSourceForm.datasource_id = chatInfo.datasource;
                                    // 加载表列表
                                    await loadTables();
                                }
                                // 解析analysis字段（后端存储为JSON字符串）
                                let analysisContent = '';
                                if (record.analysis) {
                                    try {
                                        const analysisObj = JSON.parse(record.analysis);
                                        analysisContent = analysisObj.content || '';
                                    }
                                    catch {
                                        analysisContent = record.analysis;
                                    }
                                }
                                // 设置聊天消息
                                const systemContent = analysisContent || record.data || '分析完成';
                                console.log('System content:', systemContent);
                                chatMessages.value = [
                                    {
                                        role: 'user',
                                        content: record.question || '',
                                        timestamp: record.create_time ? record.create_time.toString() : ''
                                    },
                                    {
                                        role: 'system',
                                        content: systemContent,
                                        timestamp: record.finish_time ? record.finish_time.toString() : record.create_time ? record.create_time.toString() : ''
                                    }
                                ];
                                // 设置分析结果
                                analysisResult.value = {
                                    success: true,
                                    result: record.data || '',
                                    report: analysisContent || '',
                                    analysis_id: record.analysis_record_id || undefined
                                };
                                console.log('Analysis result:', analysisResult.value);
                            }
                        }
                    }
                }
            }
        }
        catch (error) {
            console.error('Failed to load analysis from params:', error);
        }
    }
}
// 页面加载时获取数据
onMounted(async () => {
    try {
        await loadDatasources();
        await loadAnalysisTypes();
        await loadAnalysisResults();
        await loadAnalysisFromParams();
    }
    catch (error) {
        console.error('页面初始化失败:', error);
    }
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['suggestion-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['message']} */ ;
/** @type {__VLS_StyleScopedClasses['message']} */ ;
/** @type {__VLS_StyleScopedClasses['message']} */ ;
/** @type {__VLS_StyleScopedClasses['user']} */ ;
/** @type {__VLS_StyleScopedClasses['message-content']} */ ;
/** @type {__VLS_StyleScopedClasses['message']} */ ;
/** @type {__VLS_StyleScopedClasses['system']} */ ;
/** @type {__VLS_StyleScopedClasses['message-content']} */ ;
/** @type {__VLS_StyleScopedClasses['markdown-content']} */ ;
/** @type {__VLS_StyleScopedClasses['markdown-content']} */ ;
/** @type {__VLS_StyleScopedClasses['markdown-content']} */ ;
/** @type {__VLS_StyleScopedClasses['markdown-content']} */ ;
/** @type {__VLS_StyleScopedClasses['markdown-content']} */ ;
/** @type {__VLS_StyleScopedClasses['markdown-content']} */ ;
/** @type {__VLS_StyleScopedClasses['result-tabs']} */ ;
/** @type {__VLS_StyleScopedClasses['column-stats']} */ ;
/** @type {__VLS_StyleScopedClasses['column-distribution']} */ ;
/** @type {__VLS_StyleScopedClasses['column-anomaly']} */ ;
/** @type {__VLS_StyleScopedClasses['column-trend']} */ ;
/** @type {__VLS_StyleScopedClasses['column-time-series']} */ ;
// CSS variable injection 
// CSS variable injection end 
const __VLS_0 = {}.ElContainer;
/** @type {[typeof __VLS_components.ElContainer, typeof __VLS_components.elContainer, typeof __VLS_components.ElContainer, typeof __VLS_components.elContainer, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ class: "analysis-page-container no-padding" },
}));
const __VLS_2 = __VLS_1({
    ...{ class: "analysis-page-container no-padding" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
if (__VLS_ctx.sidebarVisible) {
    const __VLS_4 = {}.ElAside;
    /** @type {[typeof __VLS_components.ElAside, typeof __VLS_components.elAside, typeof __VLS_components.ElAside, typeof __VLS_components.elAside, ]} */ ;
    // @ts-ignore
    const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
        ...{ class: "analysis-sidebar" },
        width: "280px",
    }));
    const __VLS_6 = __VLS_5({
        ...{ class: "analysis-sidebar" },
        width: "280px",
    }, ...__VLS_functionalComponentArgsRest(__VLS_5));
    __VLS_7.slots.default;
    /** @type {[typeof AnalysisChatList, ]} */ ;
    // @ts-ignore
    const __VLS_8 = __VLS_asFunctionalComponent(AnalysisChatList, new AnalysisChatList({
        ...{ 'onOnChatCreated': {} },
        ...{ 'onOnClickHistory': {} },
        ...{ 'onOnClickSideBarBtn': {} },
        currentChatId: (__VLS_ctx.currentChatId),
        currentChat: (__VLS_ctx.currentChat),
        loading: (__VLS_ctx.isLoadingChat),
    }));
    const __VLS_9 = __VLS_8({
        ...{ 'onOnChatCreated': {} },
        ...{ 'onOnClickHistory': {} },
        ...{ 'onOnClickSideBarBtn': {} },
        currentChatId: (__VLS_ctx.currentChatId),
        currentChat: (__VLS_ctx.currentChat),
        loading: (__VLS_ctx.isLoadingChat),
    }, ...__VLS_functionalComponentArgsRest(__VLS_8));
    let __VLS_11;
    let __VLS_12;
    let __VLS_13;
    const __VLS_14 = {
        onOnChatCreated: (__VLS_ctx.onChatCreated)
    };
    const __VLS_15 = {
        onOnClickHistory: (__VLS_ctx.onChatHistory)
    };
    const __VLS_16 = {
        onOnClickSideBarBtn: (__VLS_ctx.hideSidebar)
    };
    var __VLS_10;
    var __VLS_7;
}
const __VLS_17 = {}.ElContainer;
/** @type {[typeof __VLS_components.ElContainer, typeof __VLS_components.elContainer, typeof __VLS_components.ElContainer, typeof __VLS_components.elContainer, ]} */ ;
// @ts-ignore
const __VLS_18 = __VLS_asFunctionalComponent(__VLS_17, new __VLS_17({
    ...{ class: "analysis-main-container" },
}));
const __VLS_19 = __VLS_18({
    ...{ class: "analysis-main-container" },
}, ...__VLS_functionalComponentArgsRest(__VLS_18));
__VLS_20.slots.default;
if (!__VLS_ctx.sidebarVisible) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "analysis-sidebar-toggle" },
    });
    const __VLS_21 = {}.ElPopover;
    /** @type {[typeof __VLS_components.ElPopover, typeof __VLS_components.elPopover, typeof __VLS_components.ElPopover, typeof __VLS_components.elPopover, ]} */ ;
    // @ts-ignore
    const __VLS_22 = __VLS_asFunctionalComponent(__VLS_21, new __VLS_21({
        width: (280),
        placement: "bottom-start",
        popperClass: "popover-chat_history",
    }));
    const __VLS_23 = __VLS_22({
        width: (280),
        placement: "bottom-start",
        popperClass: "popover-chat_history",
    }, ...__VLS_functionalComponentArgsRest(__VLS_22));
    __VLS_24.slots.default;
    {
        const { reference: __VLS_thisSlot } = __VLS_24.slots;
        const __VLS_25 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_26 = __VLS_asFunctionalComponent(__VLS_25, new __VLS_25({
            ...{ 'onClick': {} },
            link: true,
            type: "primary",
            ...{ class: "icon-btn" },
        }));
        const __VLS_27 = __VLS_26({
            ...{ 'onClick': {} },
            link: true,
            type: "primary",
            ...{ class: "icon-btn" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_26));
        let __VLS_29;
        let __VLS_30;
        let __VLS_31;
        const __VLS_32 = {
            onClick: (__VLS_ctx.showSidebar)
        };
        __VLS_28.slots.default;
        const __VLS_33 = {}.ElIcon;
        /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
        // @ts-ignore
        const __VLS_34 = __VLS_asFunctionalComponent(__VLS_33, new __VLS_33({}));
        const __VLS_35 = __VLS_34({}, ...__VLS_functionalComponentArgsRest(__VLS_34));
        __VLS_36.slots.default;
        const __VLS_37 = {}.icon_sidebar_outlined;
        /** @type {[typeof __VLS_components.Icon_sidebar_outlined, typeof __VLS_components.icon_sidebar_outlined, ]} */ ;
        // @ts-ignore
        const __VLS_38 = __VLS_asFunctionalComponent(__VLS_37, new __VLS_37({}));
        const __VLS_39 = __VLS_38({}, ...__VLS_functionalComponentArgsRest(__VLS_38));
        var __VLS_36;
        var __VLS_28;
    }
    /** @type {[typeof AnalysisChatList, ]} */ ;
    // @ts-ignore
    const __VLS_41 = __VLS_asFunctionalComponent(AnalysisChatList, new AnalysisChatList({
        ...{ 'onOnChatCreated': {} },
        ...{ 'onOnClickHistory': {} },
        ...{ 'onOnClickSideBarBtn': {} },
        currentChatId: (__VLS_ctx.currentChatId),
        currentChat: (__VLS_ctx.currentChat),
        loading: (__VLS_ctx.isLoadingChat),
    }));
    const __VLS_42 = __VLS_41({
        ...{ 'onOnChatCreated': {} },
        ...{ 'onOnClickHistory': {} },
        ...{ 'onOnClickSideBarBtn': {} },
        currentChatId: (__VLS_ctx.currentChatId),
        currentChat: (__VLS_ctx.currentChat),
        loading: (__VLS_ctx.isLoadingChat),
    }, ...__VLS_functionalComponentArgsRest(__VLS_41));
    let __VLS_44;
    let __VLS_45;
    let __VLS_46;
    const __VLS_47 = {
        onOnChatCreated: (__VLS_ctx.onChatCreated)
    };
    const __VLS_48 = {
        onOnClickHistory: (__VLS_ctx.onChatHistory)
    };
    const __VLS_49 = {
        onOnClickSideBarBtn: (__VLS_ctx.hideSidebar)
    };
    var __VLS_43;
    var __VLS_24;
    const __VLS_50 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_51 = __VLS_asFunctionalComponent(__VLS_50, new __VLS_50({
        ...{ 'onClick': {} },
        link: true,
        type: "primary",
        ...{ class: "icon-btn" },
    }));
    const __VLS_52 = __VLS_51({
        ...{ 'onClick': {} },
        link: true,
        type: "primary",
        ...{ class: "icon-btn" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_51));
    let __VLS_54;
    let __VLS_55;
    let __VLS_56;
    const __VLS_57 = {
        onClick: (__VLS_ctx.createNewAnalysis)
    };
    __VLS_53.slots.default;
    const __VLS_58 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_59 = __VLS_asFunctionalComponent(__VLS_58, new __VLS_58({}));
    const __VLS_60 = __VLS_59({}, ...__VLS_functionalComponentArgsRest(__VLS_59));
    __VLS_61.slots.default;
    const __VLS_62 = {}.icon_new_chat_outlined;
    /** @type {[typeof __VLS_components.Icon_new_chat_outlined, typeof __VLS_components.icon_new_chat_outlined, ]} */ ;
    // @ts-ignore
    const __VLS_63 = __VLS_asFunctionalComponent(__VLS_62, new __VLS_62({}));
    const __VLS_64 = __VLS_63({}, ...__VLS_functionalComponentArgsRest(__VLS_63));
    var __VLS_61;
    var __VLS_53;
}
const __VLS_66 = {}.ElMain;
/** @type {[typeof __VLS_components.ElMain, typeof __VLS_components.elMain, typeof __VLS_components.ElMain, typeof __VLS_components.elMain, ]} */ ;
// @ts-ignore
const __VLS_67 = __VLS_asFunctionalComponent(__VLS_66, new __VLS_66({
    ...{ class: "analysis-main" },
}));
const __VLS_68 = __VLS_67({
    ...{ class: "analysis-main" },
}, ...__VLS_functionalComponentArgsRest(__VLS_67));
__VLS_69.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "analysis-container" },
});
const __VLS_70 = {}.ElCard;
/** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
// @ts-ignore
const __VLS_71 = __VLS_asFunctionalComponent(__VLS_70, new __VLS_70({
    ...{ class: "analysis-card" },
}));
const __VLS_72 = __VLS_71({
    ...{ class: "analysis-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_71));
__VLS_73.slots.default;
{
    const { header: __VLS_thisSlot } = __VLS_73.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "card-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
}
const __VLS_74 = {}.ElTabs;
/** @type {[typeof __VLS_components.ElTabs, typeof __VLS_components.elTabs, typeof __VLS_components.ElTabs, typeof __VLS_components.elTabs, ]} */ ;
// @ts-ignore
const __VLS_75 = __VLS_asFunctionalComponent(__VLS_74, new __VLS_74({
    modelValue: (__VLS_ctx.activeTab),
    ...{ class: "analysis-tabs" },
}));
const __VLS_76 = __VLS_75({
    modelValue: (__VLS_ctx.activeTab),
    ...{ class: "analysis-tabs" },
}, ...__VLS_functionalComponentArgsRest(__VLS_75));
__VLS_77.slots.default;
const __VLS_78 = {}.ElTabPane;
/** @type {[typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, ]} */ ;
// @ts-ignore
const __VLS_79 = __VLS_asFunctionalComponent(__VLS_78, new __VLS_78({
    label: "数据基本统计",
    name: "basic-stats",
}));
const __VLS_80 = __VLS_79({
    label: "数据基本统计",
    name: "basic-stats",
}, ...__VLS_functionalComponentArgsRest(__VLS_79));
__VLS_81.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "basic-stats-section" },
});
const __VLS_82 = {}.ElDivider;
/** @type {[typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, ]} */ ;
// @ts-ignore
const __VLS_83 = __VLS_asFunctionalComponent(__VLS_82, new __VLS_82({
    contentPosition: "left",
}));
const __VLS_84 = __VLS_83({
    contentPosition: "left",
}, ...__VLS_functionalComponentArgsRest(__VLS_83));
__VLS_85.slots.default;
var __VLS_85;
const __VLS_86 = {}.ElForm;
/** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
// @ts-ignore
const __VLS_87 = __VLS_asFunctionalComponent(__VLS_86, new __VLS_86({
    model: (__VLS_ctx.dataSourceForm),
    labelWidth: "80px",
    ...{ class: "data-source-form" },
}));
const __VLS_88 = __VLS_87({
    model: (__VLS_ctx.dataSourceForm),
    labelWidth: "80px",
    ...{ class: "data-source-form" },
}, ...__VLS_functionalComponentArgsRest(__VLS_87));
__VLS_89.slots.default;
const __VLS_90 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_91 = __VLS_asFunctionalComponent(__VLS_90, new __VLS_90({
    label: "数据源",
}));
const __VLS_92 = __VLS_91({
    label: "数据源",
}, ...__VLS_functionalComponentArgsRest(__VLS_91));
__VLS_93.slots.default;
const __VLS_94 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_95 = __VLS_asFunctionalComponent(__VLS_94, new __VLS_94({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.dataSourceForm.datasource_id),
    placeholder: "请选择数据源",
    ...{ style: {} },
}));
const __VLS_96 = __VLS_95({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.dataSourceForm.datasource_id),
    placeholder: "请选择数据源",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_95));
let __VLS_98;
let __VLS_99;
let __VLS_100;
const __VLS_101 = {
    onChange: (__VLS_ctx.loadTables)
};
__VLS_97.slots.default;
for (const [datasource] of __VLS_getVForSourceType((__VLS_ctx.datasources))) {
    const __VLS_102 = {}.ElOption;
    /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
    // @ts-ignore
    const __VLS_103 = __VLS_asFunctionalComponent(__VLS_102, new __VLS_102({
        key: (datasource.id),
        label: (datasource.name),
        value: (datasource.id),
    }));
    const __VLS_104 = __VLS_103({
        key: (datasource.id),
        label: (datasource.name),
        value: (datasource.id),
    }, ...__VLS_functionalComponentArgsRest(__VLS_103));
}
var __VLS_97;
var __VLS_93;
const __VLS_106 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_107 = __VLS_asFunctionalComponent(__VLS_106, new __VLS_106({
    label: "表名",
}));
const __VLS_108 = __VLS_107({
    label: "表名",
}, ...__VLS_functionalComponentArgsRest(__VLS_107));
__VLS_109.slots.default;
const __VLS_110 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_111 = __VLS_asFunctionalComponent(__VLS_110, new __VLS_110({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.dataSourceForm.table_name),
    placeholder: "请选择表名",
    ...{ style: {} },
}));
const __VLS_112 = __VLS_111({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.dataSourceForm.table_name),
    placeholder: "请选择表名",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_111));
let __VLS_114;
let __VLS_115;
let __VLS_116;
const __VLS_117 = {
    onChange: (__VLS_ctx.loadDataPreview)
};
__VLS_113.slots.default;
for (const [table] of __VLS_getVForSourceType((__VLS_ctx.tables))) {
    const __VLS_118 = {}.ElOption;
    /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
    // @ts-ignore
    const __VLS_119 = __VLS_asFunctionalComponent(__VLS_118, new __VLS_118({
        key: (table.id),
        label: (table.table_name),
        value: (table.table_name),
    }));
    const __VLS_120 = __VLS_119({
        key: (table.id),
        label: (table.table_name),
        value: (table.table_name),
    }, ...__VLS_functionalComponentArgsRest(__VLS_119));
}
var __VLS_113;
var __VLS_109;
const __VLS_122 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_123 = __VLS_asFunctionalComponent(__VLS_122, new __VLS_122({}));
const __VLS_124 = __VLS_123({}, ...__VLS_functionalComponentArgsRest(__VLS_123));
__VLS_125.slots.default;
const __VLS_126 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_127 = __VLS_asFunctionalComponent(__VLS_126, new __VLS_126({
    ...{ 'onClick': {} },
    type: "primary",
    loading: (__VLS_ctx.isLoadingBasicStats),
}));
const __VLS_128 = __VLS_127({
    ...{ 'onClick': {} },
    type: "primary",
    loading: (__VLS_ctx.isLoadingBasicStats),
}, ...__VLS_functionalComponentArgsRest(__VLS_127));
let __VLS_130;
let __VLS_131;
let __VLS_132;
const __VLS_133 = {
    onClick: (__VLS_ctx.getBasicStats)
};
__VLS_129.slots.default;
(__VLS_ctx.isLoadingBasicStats ? '加载中...' : '获取数据统计');
var __VLS_129;
var __VLS_125;
var __VLS_89;
if (__VLS_ctx.basicStatsResult) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "basic-stats-result" },
    });
    const __VLS_134 = {}.ElDivider;
    /** @type {[typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, ]} */ ;
    // @ts-ignore
    const __VLS_135 = __VLS_asFunctionalComponent(__VLS_134, new __VLS_134({
        contentPosition: "left",
    }));
    const __VLS_136 = __VLS_135({
        contentPosition: "left",
    }, ...__VLS_functionalComponentArgsRest(__VLS_135));
    __VLS_137.slots.default;
    var __VLS_137;
    const __VLS_138 = {}.ElCard;
    /** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
    // @ts-ignore
    const __VLS_139 = __VLS_asFunctionalComponent(__VLS_138, new __VLS_138({
        ...{ class: "stats-card" },
    }));
    const __VLS_140 = __VLS_139({
        ...{ class: "stats-card" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_139));
    __VLS_141.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "stats-info" },
    });
    const __VLS_142 = {}.ElStatistic;
    /** @type {[typeof __VLS_components.ElStatistic, typeof __VLS_components.elStatistic, ]} */ ;
    // @ts-ignore
    const __VLS_143 = __VLS_asFunctionalComponent(__VLS_142, new __VLS_142({
        title: "总行数",
        value: (__VLS_ctx.basicStatsResult.total_rows),
    }));
    const __VLS_144 = __VLS_143({
        title: "总行数",
        value: (__VLS_ctx.basicStatsResult.total_rows),
    }, ...__VLS_functionalComponentArgsRest(__VLS_143));
    const __VLS_146 = {}.ElStatistic;
    /** @type {[typeof __VLS_components.ElStatistic, typeof __VLS_components.elStatistic, ]} */ ;
    // @ts-ignore
    const __VLS_147 = __VLS_asFunctionalComponent(__VLS_146, new __VLS_146({
        title: "总列数",
        value: (__VLS_ctx.basicStatsResult.total_columns),
    }));
    const __VLS_148 = __VLS_147({
        title: "总列数",
        value: (__VLS_ctx.basicStatsResult.total_columns),
    }, ...__VLS_functionalComponentArgsRest(__VLS_147));
    var __VLS_141;
    const __VLS_150 = {}.ElDivider;
    /** @type {[typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, ]} */ ;
    // @ts-ignore
    const __VLS_151 = __VLS_asFunctionalComponent(__VLS_150, new __VLS_150({
        contentPosition: "left",
    }));
    const __VLS_152 = __VLS_151({
        contentPosition: "left",
    }, ...__VLS_functionalComponentArgsRest(__VLS_151));
    __VLS_153.slots.default;
    var __VLS_153;
    const __VLS_154 = {}.ElCard;
    /** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
    // @ts-ignore
    const __VLS_155 = __VLS_asFunctionalComponent(__VLS_154, new __VLS_154({
        ...{ class: "columns-card" },
    }));
    const __VLS_156 = __VLS_155({
        ...{ class: "columns-card" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_155));
    __VLS_157.slots.default;
    const __VLS_158 = {}.ElTable;
    /** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
    // @ts-ignore
    const __VLS_159 = __VLS_asFunctionalComponent(__VLS_158, new __VLS_158({
        data: (__VLS_ctx.basicStatsResult.columns_info),
        ...{ style: {} },
    }));
    const __VLS_160 = __VLS_159({
        data: (__VLS_ctx.basicStatsResult.columns_info),
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_159));
    __VLS_161.slots.default;
    const __VLS_162 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_163 = __VLS_asFunctionalComponent(__VLS_162, new __VLS_162({
        prop: "name",
        label: "列名",
        width: "150",
    }));
    const __VLS_164 = __VLS_163({
        prop: "name",
        label: "列名",
        width: "150",
    }, ...__VLS_functionalComponentArgsRest(__VLS_163));
    const __VLS_166 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_167 = __VLS_asFunctionalComponent(__VLS_166, new __VLS_166({
        prop: "type",
        label: "类型",
        width: "100",
    }));
    const __VLS_168 = __VLS_167({
        prop: "type",
        label: "类型",
        width: "100",
    }, ...__VLS_functionalComponentArgsRest(__VLS_167));
    const __VLS_170 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_171 = __VLS_asFunctionalComponent(__VLS_170, new __VLS_170({
        prop: "dtype",
        label: "数据类型",
        width: "150",
    }));
    const __VLS_172 = __VLS_171({
        prop: "dtype",
        label: "数据类型",
        width: "150",
    }, ...__VLS_functionalComponentArgsRest(__VLS_171));
    const __VLS_174 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_175 = __VLS_asFunctionalComponent(__VLS_174, new __VLS_174({
        prop: "non_null_count",
        label: "非空值",
        width: "100",
    }));
    const __VLS_176 = __VLS_175({
        prop: "non_null_count",
        label: "非空值",
        width: "100",
    }, ...__VLS_functionalComponentArgsRest(__VLS_175));
    const __VLS_178 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_179 = __VLS_asFunctionalComponent(__VLS_178, new __VLS_178({
        prop: "null_count",
        label: "空值",
        width: "100",
    }));
    const __VLS_180 = __VLS_179({
        prop: "null_count",
        label: "空值",
        width: "100",
    }, ...__VLS_functionalComponentArgsRest(__VLS_179));
    const __VLS_182 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_183 = __VLS_asFunctionalComponent(__VLS_182, new __VLS_182({
        prop: "null_percentage",
        label: "空值百分比",
        width: "120",
    }));
    const __VLS_184 = __VLS_183({
        prop: "null_percentage",
        label: "空值百分比",
        width: "120",
    }, ...__VLS_functionalComponentArgsRest(__VLS_183));
    __VLS_185.slots.default;
    {
        const { default: __VLS_thisSlot } = __VLS_185.slots;
        const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
        (scope.row.null_percentage);
    }
    var __VLS_185;
    var __VLS_161;
    var __VLS_157;
    const __VLS_186 = {}.ElDivider;
    /** @type {[typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, ]} */ ;
    // @ts-ignore
    const __VLS_187 = __VLS_asFunctionalComponent(__VLS_186, new __VLS_186({
        contentPosition: "left",
    }));
    const __VLS_188 = __VLS_187({
        contentPosition: "left",
    }, ...__VLS_functionalComponentArgsRest(__VLS_187));
    __VLS_189.slots.default;
    var __VLS_189;
    const __VLS_190 = {}.ElCard;
    /** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
    // @ts-ignore
    const __VLS_191 = __VLS_asFunctionalComponent(__VLS_190, new __VLS_190({
        ...{ class: "quality-card" },
    }));
    const __VLS_192 = __VLS_191({
        ...{ class: "quality-card" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_191));
    __VLS_193.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "quality-info" },
    });
    const __VLS_194 = {}.ElStatistic;
    /** @type {[typeof __VLS_components.ElStatistic, typeof __VLS_components.elStatistic, ]} */ ;
    // @ts-ignore
    const __VLS_195 = __VLS_asFunctionalComponent(__VLS_194, new __VLS_194({
        title: "空值总数",
        value: (__VLS_ctx.basicStatsResult.data_quality.null_values.total_null_count),
    }));
    const __VLS_196 = __VLS_195({
        title: "空值总数",
        value: (__VLS_ctx.basicStatsResult.data_quality.null_values.total_null_count),
    }, ...__VLS_functionalComponentArgsRest(__VLS_195));
    const __VLS_198 = {}.ElStatistic;
    /** @type {[typeof __VLS_components.ElStatistic, typeof __VLS_components.elStatistic, ]} */ ;
    // @ts-ignore
    const __VLS_199 = __VLS_asFunctionalComponent(__VLS_198, new __VLS_198({
        title: "空值百分比",
        value: (__VLS_ctx.basicStatsResult.data_quality.null_values.null_percentage),
        suffix: "%",
    }));
    const __VLS_200 = __VLS_199({
        title: "空值百分比",
        value: (__VLS_ctx.basicStatsResult.data_quality.null_values.null_percentage),
        suffix: "%",
    }, ...__VLS_functionalComponentArgsRest(__VLS_199));
    const __VLS_202 = {}.ElStatistic;
    /** @type {[typeof __VLS_components.ElStatistic, typeof __VLS_components.elStatistic, ]} */ ;
    // @ts-ignore
    const __VLS_203 = __VLS_asFunctionalComponent(__VLS_202, new __VLS_202({
        title: "重复行数",
        value: (__VLS_ctx.basicStatsResult.data_quality.duplicate_rows.total_duplicate_count),
    }));
    const __VLS_204 = __VLS_203({
        title: "重复行数",
        value: (__VLS_ctx.basicStatsResult.data_quality.duplicate_rows.total_duplicate_count),
    }, ...__VLS_functionalComponentArgsRest(__VLS_203));
    const __VLS_206 = {}.ElStatistic;
    /** @type {[typeof __VLS_components.ElStatistic, typeof __VLS_components.elStatistic, ]} */ ;
    // @ts-ignore
    const __VLS_207 = __VLS_asFunctionalComponent(__VLS_206, new __VLS_206({
        title: "重复行百分比",
        value: (__VLS_ctx.basicStatsResult.data_quality.duplicate_rows.duplicate_percentage),
        suffix: "%",
    }));
    const __VLS_208 = __VLS_207({
        title: "重复行百分比",
        value: (__VLS_ctx.basicStatsResult.data_quality.duplicate_rows.duplicate_percentage),
        suffix: "%",
    }, ...__VLS_functionalComponentArgsRest(__VLS_207));
    var __VLS_193;
    const __VLS_210 = {}.ElDivider;
    /** @type {[typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, ]} */ ;
    // @ts-ignore
    const __VLS_211 = __VLS_asFunctionalComponent(__VLS_210, new __VLS_210({
        contentPosition: "left",
    }));
    const __VLS_212 = __VLS_211({
        contentPosition: "left",
    }, ...__VLS_functionalComponentArgsRest(__VLS_211));
    __VLS_213.slots.default;
    var __VLS_213;
    const __VLS_214 = {}.ElCard;
    /** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
    // @ts-ignore
    const __VLS_215 = __VLS_asFunctionalComponent(__VLS_214, new __VLS_214({
        ...{ class: "sample-card" },
    }));
    const __VLS_216 = __VLS_215({
        ...{ class: "sample-card" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_215));
    __VLS_217.slots.default;
    if (__VLS_ctx.basicStatsResult.sample_data.length > 0) {
        const __VLS_218 = {}.ElTable;
        /** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
        // @ts-ignore
        const __VLS_219 = __VLS_asFunctionalComponent(__VLS_218, new __VLS_218({
            data: (__VLS_ctx.basicStatsResult.sample_data),
            ...{ style: {} },
        }));
        const __VLS_220 = __VLS_219({
            data: (__VLS_ctx.basicStatsResult.sample_data),
            ...{ style: {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_219));
        __VLS_221.slots.default;
        for (const [_, key] of __VLS_getVForSourceType((__VLS_ctx.basicStatsResult.sample_data[0]))) {
            const __VLS_222 = {}.ElTableColumn;
            /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
            // @ts-ignore
            const __VLS_223 = __VLS_asFunctionalComponent(__VLS_222, new __VLS_222({
                key: (key),
                prop: (key),
                label: (key),
            }));
            const __VLS_224 = __VLS_223({
                key: (key),
                prop: (key),
                label: (key),
            }, ...__VLS_functionalComponentArgsRest(__VLS_223));
        }
        var __VLS_221;
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "empty-sample" },
        });
    }
    var __VLS_217;
}
var __VLS_81;
const __VLS_226 = {}.ElTabPane;
/** @type {[typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, ]} */ ;
// @ts-ignore
const __VLS_227 = __VLS_asFunctionalComponent(__VLS_226, new __VLS_226({
    label: "数据分析",
    name: "analysis",
}));
const __VLS_228 = __VLS_227({
    label: "数据分析",
    name: "analysis",
}, ...__VLS_functionalComponentArgsRest(__VLS_227));
__VLS_229.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "analysis-section" },
});
const __VLS_230 = {}.ElDivider;
/** @type {[typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, ]} */ ;
// @ts-ignore
const __VLS_231 = __VLS_asFunctionalComponent(__VLS_230, new __VLS_230({
    contentPosition: "left",
}));
const __VLS_232 = __VLS_231({
    contentPosition: "left",
}, ...__VLS_functionalComponentArgsRest(__VLS_231));
__VLS_233.slots.default;
var __VLS_233;
const __VLS_234 = {}.ElForm;
/** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
// @ts-ignore
const __VLS_235 = __VLS_asFunctionalComponent(__VLS_234, new __VLS_234({
    model: (__VLS_ctx.dataSourceForm),
    labelWidth: "80px",
    ...{ class: "data-source-form" },
}));
const __VLS_236 = __VLS_235({
    model: (__VLS_ctx.dataSourceForm),
    labelWidth: "80px",
    ...{ class: "data-source-form" },
}, ...__VLS_functionalComponentArgsRest(__VLS_235));
__VLS_237.slots.default;
const __VLS_238 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_239 = __VLS_asFunctionalComponent(__VLS_238, new __VLS_238({
    label: "数据源",
}));
const __VLS_240 = __VLS_239({
    label: "数据源",
}, ...__VLS_functionalComponentArgsRest(__VLS_239));
__VLS_241.slots.default;
const __VLS_242 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_243 = __VLS_asFunctionalComponent(__VLS_242, new __VLS_242({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.dataSourceForm.datasource_id),
    placeholder: "请选择数据源",
    ...{ style: {} },
}));
const __VLS_244 = __VLS_243({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.dataSourceForm.datasource_id),
    placeholder: "请选择数据源",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_243));
let __VLS_246;
let __VLS_247;
let __VLS_248;
const __VLS_249 = {
    onChange: (__VLS_ctx.loadTables)
};
__VLS_245.slots.default;
for (const [datasource] of __VLS_getVForSourceType((__VLS_ctx.datasources))) {
    const __VLS_250 = {}.ElOption;
    /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
    // @ts-ignore
    const __VLS_251 = __VLS_asFunctionalComponent(__VLS_250, new __VLS_250({
        key: (datasource.id),
        label: (datasource.name),
        value: (datasource.id),
    }));
    const __VLS_252 = __VLS_251({
        key: (datasource.id),
        label: (datasource.name),
        value: (datasource.id),
    }, ...__VLS_functionalComponentArgsRest(__VLS_251));
}
var __VLS_245;
var __VLS_241;
const __VLS_254 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_255 = __VLS_asFunctionalComponent(__VLS_254, new __VLS_254({
    label: "表名",
}));
const __VLS_256 = __VLS_255({
    label: "表名",
}, ...__VLS_functionalComponentArgsRest(__VLS_255));
__VLS_257.slots.default;
const __VLS_258 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_259 = __VLS_asFunctionalComponent(__VLS_258, new __VLS_258({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.dataSourceForm.table_name),
    placeholder: "请选择表名",
    ...{ style: {} },
}));
const __VLS_260 = __VLS_259({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.dataSourceForm.table_name),
    placeholder: "请选择表名",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_259));
let __VLS_262;
let __VLS_263;
let __VLS_264;
const __VLS_265 = {
    onChange: (__VLS_ctx.loadDataPreview)
};
__VLS_261.slots.default;
for (const [table] of __VLS_getVForSourceType((__VLS_ctx.tables))) {
    const __VLS_266 = {}.ElOption;
    /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
    // @ts-ignore
    const __VLS_267 = __VLS_asFunctionalComponent(__VLS_266, new __VLS_266({
        key: (table.id),
        label: (table.table_name),
        value: (table.table_name),
    }));
    const __VLS_268 = __VLS_267({
        key: (table.id),
        label: (table.table_name),
        value: (table.table_name),
    }, ...__VLS_functionalComponentArgsRest(__VLS_267));
}
var __VLS_261;
var __VLS_257;
var __VLS_237;
if (__VLS_ctx.dataPreview.length > 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "data-preview" },
    });
    const __VLS_270 = {}.ElDivider;
    /** @type {[typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, ]} */ ;
    // @ts-ignore
    const __VLS_271 = __VLS_asFunctionalComponent(__VLS_270, new __VLS_270({
        contentPosition: "left",
    }));
    const __VLS_272 = __VLS_271({
        contentPosition: "left",
    }, ...__VLS_functionalComponentArgsRest(__VLS_271));
    __VLS_273.slots.default;
    var __VLS_273;
    const __VLS_274 = {}.ElTable;
    /** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
    // @ts-ignore
    const __VLS_275 = __VLS_asFunctionalComponent(__VLS_274, new __VLS_274({
        data: (__VLS_ctx.dataPreview),
        ...{ style: {} },
    }));
    const __VLS_276 = __VLS_275({
        data: (__VLS_ctx.dataPreview),
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_275));
    __VLS_277.slots.default;
    for (const [column] of __VLS_getVForSourceType((__VLS_ctx.dataColumns))) {
        const __VLS_278 = {}.ElTableColumn;
        /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
        // @ts-ignore
        const __VLS_279 = __VLS_asFunctionalComponent(__VLS_278, new __VLS_278({
            key: (column),
            prop: (column),
            label: (column),
        }));
        const __VLS_280 = __VLS_279({
            key: (column),
            prop: (column),
            label: (column),
        }, ...__VLS_functionalComponentArgsRest(__VLS_279));
    }
    var __VLS_277;
}
const __VLS_282 = {}.ElDivider;
/** @type {[typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, ]} */ ;
// @ts-ignore
const __VLS_283 = __VLS_asFunctionalComponent(__VLS_282, new __VLS_282({
    contentPosition: "left",
}));
const __VLS_284 = __VLS_283({
    contentPosition: "left",
}, ...__VLS_functionalComponentArgsRest(__VLS_283));
__VLS_285.slots.default;
var __VLS_285;
const __VLS_286 = {}.ElCard;
/** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
// @ts-ignore
const __VLS_287 = __VLS_asFunctionalComponent(__VLS_286, new __VLS_286({
    ...{ class: "analysis-type-card" },
}));
const __VLS_288 = __VLS_287({
    ...{ class: "analysis-type-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_287));
__VLS_289.slots.default;
const __VLS_290 = {}.ElForm;
/** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
// @ts-ignore
const __VLS_291 = __VLS_asFunctionalComponent(__VLS_290, new __VLS_290({
    model: (__VLS_ctx.analysisForm),
    labelWidth: "100px",
    ...{ class: "analysis-form" },
}));
const __VLS_292 = __VLS_291({
    model: (__VLS_ctx.analysisForm),
    labelWidth: "100px",
    ...{ class: "analysis-form" },
}, ...__VLS_functionalComponentArgsRest(__VLS_291));
__VLS_293.slots.default;
const __VLS_294 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_295 = __VLS_asFunctionalComponent(__VLS_294, new __VLS_294({
    label: "分析类型",
}));
const __VLS_296 = __VLS_295({
    label: "分析类型",
}, ...__VLS_functionalComponentArgsRest(__VLS_295));
__VLS_297.slots.default;
const __VLS_298 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_299 = __VLS_asFunctionalComponent(__VLS_298, new __VLS_298({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.analysisForm.analysis_type),
    placeholder: "请选择分析类型",
    loading: (__VLS_ctx.isLoadingAnalysisTypes),
}));
const __VLS_300 = __VLS_299({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.analysisForm.analysis_type),
    placeholder: "请选择分析类型",
    loading: (__VLS_ctx.isLoadingAnalysisTypes),
}, ...__VLS_functionalComponentArgsRest(__VLS_299));
let __VLS_302;
let __VLS_303;
let __VLS_304;
const __VLS_305 = {
    onChange: (__VLS_ctx.handleAnalysisTypeChange)
};
__VLS_301.slots.default;
for (const [type] of __VLS_getVForSourceType((__VLS_ctx.analysisTypes))) {
    const __VLS_306 = {}.ElOption;
    /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
    // @ts-ignore
    const __VLS_307 = __VLS_asFunctionalComponent(__VLS_306, new __VLS_306({
        key: (type.id),
        label: (type.name),
        value: (type.id),
    }));
    const __VLS_308 = __VLS_307({
        key: (type.id),
        label: (type.name),
        value: (type.id),
    }, ...__VLS_functionalComponentArgsRest(__VLS_307));
}
var __VLS_301;
var __VLS_297;
const __VLS_310 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_311 = __VLS_asFunctionalComponent(__VLS_310, new __VLS_310({
    label: "选择列",
}));
const __VLS_312 = __VLS_311({
    label: "选择列",
}, ...__VLS_functionalComponentArgsRest(__VLS_311));
__VLS_313.slots.default;
const __VLS_314 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_315 = __VLS_asFunctionalComponent(__VLS_314, new __VLS_314({
    modelValue: (__VLS_ctx.analysisForm.selected_columns),
    multiple: (true),
    placeholder: "请选择列",
    disabled: (!__VLS_ctx.analysisForm.analysis_type || __VLS_ctx.filteredColumns.length === 0),
    multipleLimit: (__VLS_ctx.currentAnalysisType?.required_columns === 1 ? 1 : undefined),
}));
const __VLS_316 = __VLS_315({
    modelValue: (__VLS_ctx.analysisForm.selected_columns),
    multiple: (true),
    placeholder: "请选择列",
    disabled: (!__VLS_ctx.analysisForm.analysis_type || __VLS_ctx.filteredColumns.length === 0),
    multipleLimit: (__VLS_ctx.currentAnalysisType?.required_columns === 1 ? 1 : undefined),
}, ...__VLS_functionalComponentArgsRest(__VLS_315));
__VLS_317.slots.default;
for (const [column] of __VLS_getVForSourceType((__VLS_ctx.filteredColumns))) {
    const __VLS_318 = {}.ElOption;
    /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
    // @ts-ignore
    const __VLS_319 = __VLS_asFunctionalComponent(__VLS_318, new __VLS_318({
        key: (column.name),
        label: (column.name),
        value: (column.name),
    }));
    const __VLS_320 = __VLS_319({
        key: (column.name),
        label: (column.name),
        value: (column.name),
    }, ...__VLS_functionalComponentArgsRest(__VLS_319));
}
var __VLS_317;
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
var __VLS_313;
const __VLS_322 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_323 = __VLS_asFunctionalComponent(__VLS_322, new __VLS_322({}));
const __VLS_324 = __VLS_323({}, ...__VLS_functionalComponentArgsRest(__VLS_323));
__VLS_325.slots.default;
const __VLS_326 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_327 = __VLS_asFunctionalComponent(__VLS_326, new __VLS_326({
    ...{ 'onClick': {} },
    type: "primary",
    loading: (__VLS_ctx.isGeneratingRequirement),
}));
const __VLS_328 = __VLS_327({
    ...{ 'onClick': {} },
    type: "primary",
    loading: (__VLS_ctx.isGeneratingRequirement),
}, ...__VLS_functionalComponentArgsRest(__VLS_327));
let __VLS_330;
let __VLS_331;
let __VLS_332;
const __VLS_333 = {
    onClick: (__VLS_ctx.generateRequirement)
};
__VLS_329.slots.default;
(__VLS_ctx.isGeneratingRequirement ? '生成中...' : '生成分析需求');
var __VLS_329;
var __VLS_325;
var __VLS_293;
if (__VLS_ctx.generatedRequirement) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "generated-requirement" },
    });
    const __VLS_334 = {}.ElDivider;
    /** @type {[typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, ]} */ ;
    // @ts-ignore
    const __VLS_335 = __VLS_asFunctionalComponent(__VLS_334, new __VLS_334({
        contentPosition: "left",
    }));
    const __VLS_336 = __VLS_335({
        contentPosition: "left",
    }, ...__VLS_functionalComponentArgsRest(__VLS_335));
    __VLS_337.slots.default;
    var __VLS_337;
    const __VLS_338 = {}.ElInput;
    /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
    // @ts-ignore
    const __VLS_339 = __VLS_asFunctionalComponent(__VLS_338, new __VLS_338({
        modelValue: (__VLS_ctx.generatedRequirement),
        type: "textarea",
        rows: (3),
        placeholder: "生成的分析需求将显示在这里",
    }));
    const __VLS_340 = __VLS_339({
        modelValue: (__VLS_ctx.generatedRequirement),
        type: "textarea",
        rows: (3),
        placeholder: "生成的分析需求将显示在这里",
    }, ...__VLS_functionalComponentArgsRest(__VLS_339));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "requirement-actions" },
    });
    const __VLS_342 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_343 = __VLS_asFunctionalComponent(__VLS_342, new __VLS_342({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_344 = __VLS_343({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_343));
    let __VLS_346;
    let __VLS_347;
    let __VLS_348;
    const __VLS_349 = {
        onClick: (__VLS_ctx.useGeneratedRequirement)
    };
    __VLS_345.slots.default;
    var __VLS_345;
}
var __VLS_289;
const __VLS_350 = {}.ElDivider;
/** @type {[typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, ]} */ ;
// @ts-ignore
const __VLS_351 = __VLS_asFunctionalComponent(__VLS_350, new __VLS_350({
    contentPosition: "left",
}));
const __VLS_352 = __VLS_351({
    contentPosition: "left",
}, ...__VLS_functionalComponentArgsRest(__VLS_351));
__VLS_353.slots.default;
var __VLS_353;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "analysis-suggestions" },
});
for (const [suggestion, index] of __VLS_getVForSourceType((__VLS_ctx.analysisSuggestions))) {
    const __VLS_354 = {}.ElTag;
    /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
    // @ts-ignore
    const __VLS_355 = __VLS_asFunctionalComponent(__VLS_354, new __VLS_354({
        ...{ 'onClick': {} },
        key: (index),
        ...{ class: "suggestion-tag" },
    }));
    const __VLS_356 = __VLS_355({
        ...{ 'onClick': {} },
        key: (index),
        ...{ class: "suggestion-tag" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_355));
    let __VLS_358;
    let __VLS_359;
    let __VLS_360;
    const __VLS_361 = {
        onClick: (...[$event]) => {
            __VLS_ctx.useSuggestion(suggestion);
        }
    };
    __VLS_357.slots.default;
    (suggestion);
    var __VLS_357;
}
const __VLS_362 = {}.ElDivider;
/** @type {[typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, ]} */ ;
// @ts-ignore
const __VLS_363 = __VLS_asFunctionalComponent(__VLS_362, new __VLS_362({
    contentPosition: "left",
}));
const __VLS_364 = __VLS_363({
    contentPosition: "left",
}, ...__VLS_functionalComponentArgsRest(__VLS_363));
__VLS_365.slots.default;
var __VLS_365;
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
const __VLS_366 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_367 = __VLS_asFunctionalComponent(__VLS_366, new __VLS_366({
    ...{ 'onKeyup': {} },
    modelValue: (__VLS_ctx.chatInput),
    type: "textarea",
    rows: (3),
    placeholder: "请输入您的数据分析需求...",
}));
const __VLS_368 = __VLS_367({
    ...{ 'onKeyup': {} },
    modelValue: (__VLS_ctx.chatInput),
    type: "textarea",
    rows: (3),
    placeholder: "请输入您的数据分析需求...",
}, ...__VLS_functionalComponentArgsRest(__VLS_367));
let __VLS_370;
let __VLS_371;
let __VLS_372;
const __VLS_373 = {
    onKeyup: (__VLS_ctx.sendMessage)
};
var __VLS_369;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "chat-actions" },
});
const __VLS_374 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_375 = __VLS_asFunctionalComponent(__VLS_374, new __VLS_374({
    ...{ 'onClick': {} },
    type: "primary",
    loading: (__VLS_ctx.isAnalyzing),
}));
const __VLS_376 = __VLS_375({
    ...{ 'onClick': {} },
    type: "primary",
    loading: (__VLS_ctx.isAnalyzing),
}, ...__VLS_functionalComponentArgsRest(__VLS_375));
let __VLS_378;
let __VLS_379;
let __VLS_380;
const __VLS_381 = {
    onClick: (__VLS_ctx.sendMessage)
};
__VLS_377.slots.default;
(__VLS_ctx.isAnalyzing ? '分析中...' : '发送');
var __VLS_377;
if (__VLS_ctx.analysisResult) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "analysis-result" },
    });
    const __VLS_382 = {}.ElDivider;
    /** @type {[typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, ]} */ ;
    // @ts-ignore
    const __VLS_383 = __VLS_asFunctionalComponent(__VLS_382, new __VLS_382({
        contentPosition: "left",
    }));
    const __VLS_384 = __VLS_383({
        contentPosition: "left",
    }, ...__VLS_functionalComponentArgsRest(__VLS_383));
    __VLS_385.slots.default;
    var __VLS_385;
    const __VLS_386 = {}.ElTabs;
    /** @type {[typeof __VLS_components.ElTabs, typeof __VLS_components.elTabs, typeof __VLS_components.ElTabs, typeof __VLS_components.elTabs, ]} */ ;
    // @ts-ignore
    const __VLS_387 = __VLS_asFunctionalComponent(__VLS_386, new __VLS_386({
        modelValue: (__VLS_ctx.resultTab),
        ...{ class: "result-tabs" },
    }));
    const __VLS_388 = __VLS_387({
        modelValue: (__VLS_ctx.resultTab),
        ...{ class: "result-tabs" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_387));
    __VLS_389.slots.default;
    const __VLS_390 = {}.ElTabPane;
    /** @type {[typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, ]} */ ;
    // @ts-ignore
    const __VLS_391 = __VLS_asFunctionalComponent(__VLS_390, new __VLS_390({
        label: "分析结果",
        name: "result",
    }));
    const __VLS_392 = __VLS_391({
        label: "分析结果",
        name: "result",
    }, ...__VLS_functionalComponentArgsRest(__VLS_391));
    __VLS_393.slots.default;
    const __VLS_394 = {}.ElCard;
    /** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
    // @ts-ignore
    const __VLS_395 = __VLS_asFunctionalComponent(__VLS_394, new __VLS_394({
        ...{ class: "result-card" },
    }));
    const __VLS_396 = __VLS_395({
        ...{ class: "result-card" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_395));
    __VLS_397.slots.default;
    if (__VLS_ctx.isCorrelationAnalysis) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "correlation-result" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
        const __VLS_398 = {}.ElTable;
        /** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
        // @ts-ignore
        const __VLS_399 = __VLS_asFunctionalComponent(__VLS_398, new __VLS_398({
            data: (__VLS_ctx.correlationMatrixData),
            ...{ style: {} },
        }));
        const __VLS_400 = __VLS_399({
            data: (__VLS_ctx.correlationMatrixData),
            ...{ style: {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_399));
        __VLS_401.slots.default;
        const __VLS_402 = {}.ElTableColumn;
        /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
        // @ts-ignore
        const __VLS_403 = __VLS_asFunctionalComponent(__VLS_402, new __VLS_402({
            prop: "column",
            label: "列名",
            width: "120",
        }));
        const __VLS_404 = __VLS_403({
            prop: "column",
            label: "列名",
            width: "120",
        }, ...__VLS_functionalComponentArgsRest(__VLS_403));
        for (const [col] of __VLS_getVForSourceType((__VLS_ctx.correlationColumns))) {
            const __VLS_406 = {}.ElTableColumn;
            /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
            // @ts-ignore
            const __VLS_407 = __VLS_asFunctionalComponent(__VLS_406, new __VLS_406({
                key: (col),
                prop: (col),
                label: (col),
            }));
            const __VLS_408 = __VLS_407({
                key: (col),
                prop: (col),
                label: (col),
            }, ...__VLS_functionalComponentArgsRest(__VLS_407));
            __VLS_409.slots.default;
            {
                const { default: __VLS_thisSlot } = __VLS_409.slots;
                const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                    ...{ class: (__VLS_ctx.getCorrelationClass(scope.row[col])) },
                });
                (scope.row[col].toFixed(4));
            }
            var __VLS_409;
        }
        var __VLS_401;
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
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "analysis-result-content" },
        });
        if (__VLS_ctx.isDescriptiveAnalysis) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "descriptive-result" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
            for (const [stats, column] of __VLS_getVForSourceType((__VLS_ctx.parsedAnalysisResult.stats))) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    key: (column),
                    ...{ class: "column-stats" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
                (column);
                const __VLS_410 = {}.ElTable;
                /** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
                // @ts-ignore
                const __VLS_411 = __VLS_asFunctionalComponent(__VLS_410, new __VLS_410({
                    data: ([stats]),
                    ...{ style: {} },
                }));
                const __VLS_412 = __VLS_411({
                    data: ([stats]),
                    ...{ style: {} },
                }, ...__VLS_functionalComponentArgsRest(__VLS_411));
                __VLS_413.slots.default;
                for (const [_, key] of __VLS_getVForSourceType((stats))) {
                    const __VLS_414 = {}.ElTableColumn;
                    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
                    // @ts-ignore
                    const __VLS_415 = __VLS_asFunctionalComponent(__VLS_414, new __VLS_414({
                        key: (key),
                        prop: (key),
                        label: (__VLS_ctx.formatStatKey(key.toString())),
                    }));
                    const __VLS_416 = __VLS_415({
                        key: (key),
                        prop: (key),
                        label: (__VLS_ctx.formatStatKey(key.toString())),
                    }, ...__VLS_functionalComponentArgsRest(__VLS_415));
                }
                var __VLS_413;
                if (__VLS_ctx.parsedAnalysisResult.charts && __VLS_ctx.parsedAnalysisResult.charts[column]) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                        ...{ class: "chart-container" },
                    });
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
                        src: (__VLS_ctx.parsedAnalysisResult.charts[column]),
                        alt: (`${column}统计图表`),
                        ...{ style: {} },
                    });
                }
            }
        }
        else if (__VLS_ctx.isDistributionAnalysis) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "distribution-result" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
            for (const [dist, column] of __VLS_getVForSourceType((__VLS_ctx.parsedAnalysisResult.distributions))) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    key: (column),
                    ...{ class: "column-distribution" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
                (column);
                const __VLS_418 = {}.ElCollapse;
                /** @type {[typeof __VLS_components.ElCollapse, typeof __VLS_components.elCollapse, typeof __VLS_components.ElCollapse, typeof __VLS_components.elCollapse, ]} */ ;
                // @ts-ignore
                const __VLS_419 = __VLS_asFunctionalComponent(__VLS_418, new __VLS_418({}));
                const __VLS_420 = __VLS_419({}, ...__VLS_functionalComponentArgsRest(__VLS_419));
                __VLS_421.slots.default;
                const __VLS_422 = {}.ElCollapseItem;
                /** @type {[typeof __VLS_components.ElCollapseItem, typeof __VLS_components.elCollapseItem, typeof __VLS_components.ElCollapseItem, typeof __VLS_components.elCollapseItem, ]} */ ;
                // @ts-ignore
                const __VLS_423 = __VLS_asFunctionalComponent(__VLS_422, new __VLS_422({
                    title: "分位数",
                }));
                const __VLS_424 = __VLS_423({
                    title: "分位数",
                }, ...__VLS_functionalComponentArgsRest(__VLS_423));
                __VLS_425.slots.default;
                const __VLS_426 = {}.ElTable;
                /** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
                // @ts-ignore
                const __VLS_427 = __VLS_asFunctionalComponent(__VLS_426, new __VLS_426({
                    data: ([dist.quantiles]),
                    ...{ style: {} },
                }));
                const __VLS_428 = __VLS_427({
                    data: ([dist.quantiles]),
                    ...{ style: {} },
                }, ...__VLS_functionalComponentArgsRest(__VLS_427));
                __VLS_429.slots.default;
                for (const [_, key] of __VLS_getVForSourceType((dist.quantiles))) {
                    const __VLS_430 = {}.ElTableColumn;
                    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
                    // @ts-ignore
                    const __VLS_431 = __VLS_asFunctionalComponent(__VLS_430, new __VLS_430({
                        key: (key),
                        prop: (key),
                        label: (`${key.toString()}分位数`),
                    }));
                    const __VLS_432 = __VLS_431({
                        key: (key),
                        prop: (key),
                        label: (`${key.toString()}分位数`),
                    }, ...__VLS_functionalComponentArgsRest(__VLS_431));
                }
                var __VLS_429;
                var __VLS_425;
                const __VLS_434 = {}.ElCollapseItem;
                /** @type {[typeof __VLS_components.ElCollapseItem, typeof __VLS_components.elCollapseItem, typeof __VLS_components.ElCollapseItem, typeof __VLS_components.elCollapseItem, ]} */ ;
                // @ts-ignore
                const __VLS_435 = __VLS_asFunctionalComponent(__VLS_434, new __VLS_434({
                    title: "值分布",
                }));
                const __VLS_436 = __VLS_435({
                    title: "值分布",
                }, ...__VLS_functionalComponentArgsRest(__VLS_435));
                __VLS_437.slots.default;
                const __VLS_438 = {}.ElTable;
                /** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
                // @ts-ignore
                const __VLS_439 = __VLS_asFunctionalComponent(__VLS_438, new __VLS_438({
                    data: (Object.entries(dist.value_counts).map(([value, count]) => ({ value, count }))),
                    ...{ style: {} },
                }));
                const __VLS_440 = __VLS_439({
                    data: (Object.entries(dist.value_counts).map(([value, count]) => ({ value, count }))),
                    ...{ style: {} },
                }, ...__VLS_functionalComponentArgsRest(__VLS_439));
                __VLS_441.slots.default;
                const __VLS_442 = {}.ElTableColumn;
                /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
                // @ts-ignore
                const __VLS_443 = __VLS_asFunctionalComponent(__VLS_442, new __VLS_442({
                    prop: "value",
                    label: "值",
                }));
                const __VLS_444 = __VLS_443({
                    prop: "value",
                    label: "值",
                }, ...__VLS_functionalComponentArgsRest(__VLS_443));
                const __VLS_446 = {}.ElTableColumn;
                /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
                // @ts-ignore
                const __VLS_447 = __VLS_asFunctionalComponent(__VLS_446, new __VLS_446({
                    prop: "count",
                    label: "计数",
                }));
                const __VLS_448 = __VLS_447({
                    prop: "count",
                    label: "计数",
                }, ...__VLS_functionalComponentArgsRest(__VLS_447));
                var __VLS_441;
                var __VLS_437;
                var __VLS_421;
                if (__VLS_ctx.parsedAnalysisResult.charts && __VLS_ctx.parsedAnalysisResult.charts[column]) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                        ...{ class: "chart-container" },
                    });
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
                        src: (__VLS_ctx.parsedAnalysisResult.charts[column]),
                        alt: (`${column}分布图`),
                        ...{ style: {} },
                    });
                }
            }
        }
        else if (__VLS_ctx.isAnomalyAnalysis) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "anomaly-result" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
            for (const [anomaly, column] of __VLS_getVForSourceType((__VLS_ctx.parsedAnalysisResult.anomalies))) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    key: (column),
                    ...{ class: "column-anomaly" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
                (column);
                const __VLS_450 = {}.ElCard;
                /** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
                // @ts-ignore
                const __VLS_451 = __VLS_asFunctionalComponent(__VLS_450, new __VLS_450({
                    ...{ class: "anomaly-info-card" },
                }));
                const __VLS_452 = __VLS_451({
                    ...{ class: "anomaly-info-card" },
                }, ...__VLS_functionalComponentArgsRest(__VLS_451));
                __VLS_453.slots.default;
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "anomaly-stats" },
                });
                const __VLS_454 = {}.ElStatistic;
                /** @type {[typeof __VLS_components.ElStatistic, typeof __VLS_components.elStatistic, ]} */ ;
                // @ts-ignore
                const __VLS_455 = __VLS_asFunctionalComponent(__VLS_454, new __VLS_454({
                    title: "下限值",
                    value: (anomaly.lower_bound),
                    precision: (2),
                }));
                const __VLS_456 = __VLS_455({
                    title: "下限值",
                    value: (anomaly.lower_bound),
                    precision: (2),
                }, ...__VLS_functionalComponentArgsRest(__VLS_455));
                const __VLS_458 = {}.ElStatistic;
                /** @type {[typeof __VLS_components.ElStatistic, typeof __VLS_components.elStatistic, ]} */ ;
                // @ts-ignore
                const __VLS_459 = __VLS_asFunctionalComponent(__VLS_458, new __VLS_458({
                    title: "上限值",
                    value: (anomaly.upper_bound),
                    precision: (2),
                }));
                const __VLS_460 = __VLS_459({
                    title: "上限值",
                    value: (anomaly.upper_bound),
                    precision: (2),
                }, ...__VLS_functionalComponentArgsRest(__VLS_459));
                const __VLS_462 = {}.ElStatistic;
                /** @type {[typeof __VLS_components.ElStatistic, typeof __VLS_components.elStatistic, ]} */ ;
                // @ts-ignore
                const __VLS_463 = __VLS_asFunctionalComponent(__VLS_462, new __VLS_462({
                    title: "异常值数量",
                    value: (anomaly.outlier_count),
                }));
                const __VLS_464 = __VLS_463({
                    title: "异常值数量",
                    value: (anomaly.outlier_count),
                }, ...__VLS_functionalComponentArgsRest(__VLS_463));
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "anomaly-values" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.h5, __VLS_intrinsicElements.h5)({});
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "outlier-tags" },
                });
                for (const [val, idx] of __VLS_getVForSourceType((anomaly.outliers))) {
                    const __VLS_466 = {}.ElTag;
                    /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
                    // @ts-ignore
                    const __VLS_467 = __VLS_asFunctionalComponent(__VLS_466, new __VLS_466({
                        key: (idx),
                        type: "danger",
                        ...{ class: "outlier-tag" },
                    }));
                    const __VLS_468 = __VLS_467({
                        key: (idx),
                        type: "danger",
                        ...{ class: "outlier-tag" },
                    }, ...__VLS_functionalComponentArgsRest(__VLS_467));
                    __VLS_469.slots.default;
                    (val);
                    var __VLS_469;
                }
                var __VLS_453;
                if (__VLS_ctx.parsedAnalysisResult.charts && __VLS_ctx.parsedAnalysisResult.charts[column]) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                        ...{ class: "chart-container" },
                    });
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
                        src: (__VLS_ctx.parsedAnalysisResult.charts[column]),
                        alt: (`${column}箱线图`),
                        ...{ style: {} },
                    });
                }
            }
        }
        else if (__VLS_ctx.isTrendAnalysis) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "trend-result" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
            for (const [_, column] of __VLS_getVForSourceType((__VLS_ctx.parsedAnalysisResult.trends))) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    key: (column),
                    ...{ class: "column-trend" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
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
        else if (__VLS_ctx.isTimeSeriesAnalysis) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "time-series-result" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
            for (const [ts, column] of __VLS_getVForSourceType((__VLS_ctx.parsedAnalysisResult.time_series))) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    key: (column),
                    ...{ class: "column-time-series" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
                (column);
                const __VLS_470 = {}.ElCard;
                /** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
                // @ts-ignore
                const __VLS_471 = __VLS_asFunctionalComponent(__VLS_470, new __VLS_470({
                    ...{ class: "ts-stats-card" },
                }));
                const __VLS_472 = __VLS_471({
                    ...{ class: "ts-stats-card" },
                }, ...__VLS_functionalComponentArgsRest(__VLS_471));
                __VLS_473.slots.default;
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "ts-stats" },
                });
                const __VLS_474 = {}.ElStatistic;
                /** @type {[typeof __VLS_components.ElStatistic, typeof __VLS_components.elStatistic, ]} */ ;
                // @ts-ignore
                const __VLS_475 = __VLS_asFunctionalComponent(__VLS_474, new __VLS_474({
                    title: "均值",
                    value: (ts.mean),
                    precision: (2),
                }));
                const __VLS_476 = __VLS_475({
                    title: "均值",
                    value: (ts.mean),
                    precision: (2),
                }, ...__VLS_functionalComponentArgsRest(__VLS_475));
                const __VLS_478 = {}.ElStatistic;
                /** @type {[typeof __VLS_components.ElStatistic, typeof __VLS_components.elStatistic, ]} */ ;
                // @ts-ignore
                const __VLS_479 = __VLS_asFunctionalComponent(__VLS_478, new __VLS_478({
                    title: "标准差",
                    value: (ts.std),
                    precision: (2),
                }));
                const __VLS_480 = __VLS_479({
                    title: "标准差",
                    value: (ts.std),
                    precision: (2),
                }, ...__VLS_functionalComponentArgsRest(__VLS_479));
                var __VLS_473;
                if (__VLS_ctx.parsedAnalysisResult.charts && __VLS_ctx.parsedAnalysisResult.charts[column]) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                        ...{ class: "chart-container" },
                    });
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
                        src: (__VLS_ctx.parsedAnalysisResult.charts[column]),
                        alt: (`${column}时间序列图`),
                        ...{ style: {} },
                    });
                }
            }
        }
        else if (__VLS_ctx.isPredictionAnalysis) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "prediction-result" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
            if (__VLS_ctx.parsedAnalysisResult.predictions) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "prediction-info" },
                });
                const __VLS_482 = {}.ElCard;
                /** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
                // @ts-ignore
                const __VLS_483 = __VLS_asFunctionalComponent(__VLS_482, new __VLS_482({}));
                const __VLS_484 = __VLS_483({}, ...__VLS_functionalComponentArgsRest(__VLS_483));
                __VLS_485.slots.default;
                if (__VLS_ctx.parsedAnalysisResult.predictions.model) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                        ...{ class: "model-info" },
                    });
                    const __VLS_486 = {}.ElDescriptions;
                    /** @type {[typeof __VLS_components.ElDescriptions, typeof __VLS_components.elDescriptions, typeof __VLS_components.ElDescriptions, typeof __VLS_components.elDescriptions, ]} */ ;
                    // @ts-ignore
                    const __VLS_487 = __VLS_asFunctionalComponent(__VLS_486, new __VLS_486({
                        column: (2),
                        border: true,
                    }));
                    const __VLS_488 = __VLS_487({
                        column: (2),
                        border: true,
                    }, ...__VLS_functionalComponentArgsRest(__VLS_487));
                    __VLS_489.slots.default;
                    const __VLS_490 = {}.ElDescriptionsItem;
                    /** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
                    // @ts-ignore
                    const __VLS_491 = __VLS_asFunctionalComponent(__VLS_490, new __VLS_490({
                        label: "模型",
                    }));
                    const __VLS_492 = __VLS_491({
                        label: "模型",
                    }, ...__VLS_functionalComponentArgsRest(__VLS_491));
                    __VLS_493.slots.default;
                    (__VLS_ctx.parsedAnalysisResult.predictions.model);
                    var __VLS_493;
                    const __VLS_494 = {}.ElDescriptionsItem;
                    /** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
                    // @ts-ignore
                    const __VLS_495 = __VLS_asFunctionalComponent(__VLS_494, new __VLS_494({
                        label: "目标列",
                    }));
                    const __VLS_496 = __VLS_495({
                        label: "目标列",
                    }, ...__VLS_functionalComponentArgsRest(__VLS_495));
                    __VLS_497.slots.default;
                    (__VLS_ctx.parsedAnalysisResult.predictions.target_column);
                    var __VLS_497;
                    const __VLS_498 = {}.ElDescriptionsItem;
                    /** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
                    // @ts-ignore
                    const __VLS_499 = __VLS_asFunctionalComponent(__VLS_498, new __VLS_498({
                        label: "特征列",
                    }));
                    const __VLS_500 = __VLS_499({
                        label: "特征列",
                    }, ...__VLS_functionalComponentArgsRest(__VLS_499));
                    __VLS_501.slots.default;
                    (__VLS_ctx.parsedAnalysisResult.predictions.feature_columns?.join(', '));
                    var __VLS_501;
                    const __VLS_502 = {}.ElDescriptionsItem;
                    /** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
                    // @ts-ignore
                    const __VLS_503 = __VLS_asFunctionalComponent(__VLS_502, new __VLS_502({
                        label: "均方误差",
                    }));
                    const __VLS_504 = __VLS_503({
                        label: "均方误差",
                    }, ...__VLS_functionalComponentArgsRest(__VLS_503));
                    __VLS_505.slots.default;
                    (__VLS_ctx.parsedAnalysisResult.predictions.mse?.toFixed(4));
                    var __VLS_505;
                    const __VLS_506 = {}.ElDescriptionsItem;
                    /** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
                    // @ts-ignore
                    const __VLS_507 = __VLS_asFunctionalComponent(__VLS_506, new __VLS_506({
                        label: "R²分数",
                        span: (2),
                    }));
                    const __VLS_508 = __VLS_507({
                        label: "R²分数",
                        span: (2),
                    }, ...__VLS_functionalComponentArgsRest(__VLS_507));
                    __VLS_509.slots.default;
                    (__VLS_ctx.parsedAnalysisResult.predictions.r2?.toFixed(4));
                    var __VLS_509;
                    var __VLS_489;
                }
                else if (__VLS_ctx.parsedAnalysisResult.predictions.error) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                        ...{ class: "error-message" },
                    });
                    (__VLS_ctx.parsedAnalysisResult.predictions.error);
                }
                var __VLS_485;
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
        }
        else if (__VLS_ctx.isClusteringAnalysis) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "clustering-result" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
            if (__VLS_ctx.parsedAnalysisResult.clusters) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "clustering-info" },
                });
                const __VLS_510 = {}.ElCard;
                /** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
                // @ts-ignore
                const __VLS_511 = __VLS_asFunctionalComponent(__VLS_510, new __VLS_510({}));
                const __VLS_512 = __VLS_511({}, ...__VLS_functionalComponentArgsRest(__VLS_511));
                __VLS_513.slots.default;
                if (__VLS_ctx.parsedAnalysisResult.clusters.model) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                        ...{ class: "model-info" },
                    });
                    const __VLS_514 = {}.ElDescriptions;
                    /** @type {[typeof __VLS_components.ElDescriptions, typeof __VLS_components.elDescriptions, typeof __VLS_components.ElDescriptions, typeof __VLS_components.elDescriptions, ]} */ ;
                    // @ts-ignore
                    const __VLS_515 = __VLS_asFunctionalComponent(__VLS_514, new __VLS_514({
                        column: (2),
                        border: true,
                    }));
                    const __VLS_516 = __VLS_515({
                        column: (2),
                        border: true,
                    }, ...__VLS_functionalComponentArgsRest(__VLS_515));
                    __VLS_517.slots.default;
                    const __VLS_518 = {}.ElDescriptionsItem;
                    /** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
                    // @ts-ignore
                    const __VLS_519 = __VLS_asFunctionalComponent(__VLS_518, new __VLS_518({
                        label: "模型",
                    }));
                    const __VLS_520 = __VLS_519({
                        label: "模型",
                    }, ...__VLS_functionalComponentArgsRest(__VLS_519));
                    __VLS_521.slots.default;
                    (__VLS_ctx.parsedAnalysisResult.clusters.model);
                    var __VLS_521;
                    const __VLS_522 = {}.ElDescriptionsItem;
                    /** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
                    // @ts-ignore
                    const __VLS_523 = __VLS_asFunctionalComponent(__VLS_522, new __VLS_522({
                        label: "聚类数量",
                    }));
                    const __VLS_524 = __VLS_523({
                        label: "聚类数量",
                    }, ...__VLS_functionalComponentArgsRest(__VLS_523));
                    __VLS_525.slots.default;
                    (__VLS_ctx.parsedAnalysisResult.clusters.n_clusters);
                    var __VLS_525;
                    const __VLS_526 = {}.ElDescriptionsItem;
                    /** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
                    // @ts-ignore
                    const __VLS_527 = __VLS_asFunctionalComponent(__VLS_526, new __VLS_526({
                        label: "聚类列",
                        span: (2),
                    }));
                    const __VLS_528 = __VLS_527({
                        label: "聚类列",
                        span: (2),
                    }, ...__VLS_functionalComponentArgsRest(__VLS_527));
                    __VLS_529.slots.default;
                    (__VLS_ctx.parsedAnalysisResult.clusters.cluster_columns?.join(', '));
                    var __VLS_529;
                    const __VLS_530 = {}.ElDescriptionsItem;
                    /** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
                    // @ts-ignore
                    const __VLS_531 = __VLS_asFunctionalComponent(__VLS_530, new __VLS_530({
                        label: "聚类中心",
                        span: (2),
                    }));
                    const __VLS_532 = __VLS_531({
                        label: "聚类中心",
                        span: (2),
                    }, ...__VLS_functionalComponentArgsRest(__VLS_531));
                    __VLS_533.slots.default;
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.pre, __VLS_intrinsicElements.pre)({
                        ...{ style: {} },
                    });
                    (JSON.stringify(__VLS_ctx.parsedAnalysisResult.clusters.cluster_centers, null, 2));
                    var __VLS_533;
                    const __VLS_534 = {}.ElDescriptionsItem;
                    /** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
                    // @ts-ignore
                    const __VLS_535 = __VLS_asFunctionalComponent(__VLS_534, new __VLS_534({
                        label: "聚类计数",
                        span: (2),
                    }));
                    const __VLS_536 = __VLS_535({
                        label: "聚类计数",
                        span: (2),
                    }, ...__VLS_functionalComponentArgsRest(__VLS_535));
                    __VLS_537.slots.default;
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.pre, __VLS_intrinsicElements.pre)({
                        ...{ style: {} },
                    });
                    (JSON.stringify(__VLS_ctx.parsedAnalysisResult.clusters.cluster_counts, null, 2));
                    var __VLS_537;
                    var __VLS_517;
                }
                else if (__VLS_ctx.parsedAnalysisResult.clusters.error) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                        ...{ class: "error-message" },
                    });
                    (__VLS_ctx.parsedAnalysisResult.clusters.error);
                }
                var __VLS_513;
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
        }
        else if (__VLS_ctx.isRegressionAnalysis) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "regression-result" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
            if (__VLS_ctx.parsedAnalysisResult.regression) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "regression-info" },
                });
                const __VLS_538 = {}.ElCard;
                /** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
                // @ts-ignore
                const __VLS_539 = __VLS_asFunctionalComponent(__VLS_538, new __VLS_538({}));
                const __VLS_540 = __VLS_539({}, ...__VLS_functionalComponentArgsRest(__VLS_539));
                __VLS_541.slots.default;
                if (__VLS_ctx.parsedAnalysisResult.regression.model) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                        ...{ class: "model-info" },
                    });
                    const __VLS_542 = {}.ElDescriptions;
                    /** @type {[typeof __VLS_components.ElDescriptions, typeof __VLS_components.elDescriptions, typeof __VLS_components.ElDescriptions, typeof __VLS_components.elDescriptions, ]} */ ;
                    // @ts-ignore
                    const __VLS_543 = __VLS_asFunctionalComponent(__VLS_542, new __VLS_542({
                        column: (2),
                        border: true,
                    }));
                    const __VLS_544 = __VLS_543({
                        column: (2),
                        border: true,
                    }, ...__VLS_functionalComponentArgsRest(__VLS_543));
                    __VLS_545.slots.default;
                    const __VLS_546 = {}.ElDescriptionsItem;
                    /** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
                    // @ts-ignore
                    const __VLS_547 = __VLS_asFunctionalComponent(__VLS_546, new __VLS_546({
                        label: "模型",
                    }));
                    const __VLS_548 = __VLS_547({
                        label: "模型",
                    }, ...__VLS_functionalComponentArgsRest(__VLS_547));
                    __VLS_549.slots.default;
                    (__VLS_ctx.parsedAnalysisResult.regression.model);
                    var __VLS_549;
                    const __VLS_550 = {}.ElDescriptionsItem;
                    /** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
                    // @ts-ignore
                    const __VLS_551 = __VLS_asFunctionalComponent(__VLS_550, new __VLS_550({
                        label: "目标列",
                    }));
                    const __VLS_552 = __VLS_551({
                        label: "目标列",
                    }, ...__VLS_functionalComponentArgsRest(__VLS_551));
                    __VLS_553.slots.default;
                    (__VLS_ctx.parsedAnalysisResult.regression.target_column);
                    var __VLS_553;
                    const __VLS_554 = {}.ElDescriptionsItem;
                    /** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
                    // @ts-ignore
                    const __VLS_555 = __VLS_asFunctionalComponent(__VLS_554, new __VLS_554({
                        label: "特征列",
                        span: (2),
                    }));
                    const __VLS_556 = __VLS_555({
                        label: "特征列",
                        span: (2),
                    }, ...__VLS_functionalComponentArgsRest(__VLS_555));
                    __VLS_557.slots.default;
                    (__VLS_ctx.parsedAnalysisResult.regression.feature_columns?.join(', '));
                    var __VLS_557;
                    const __VLS_558 = {}.ElDescriptionsItem;
                    /** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
                    // @ts-ignore
                    const __VLS_559 = __VLS_asFunctionalComponent(__VLS_558, new __VLS_558({
                        label: "均方误差",
                    }));
                    const __VLS_560 = __VLS_559({
                        label: "均方误差",
                    }, ...__VLS_functionalComponentArgsRest(__VLS_559));
                    __VLS_561.slots.default;
                    (__VLS_ctx.parsedAnalysisResult.regression.mse?.toFixed(4));
                    var __VLS_561;
                    const __VLS_562 = {}.ElDescriptionsItem;
                    /** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
                    // @ts-ignore
                    const __VLS_563 = __VLS_asFunctionalComponent(__VLS_562, new __VLS_562({
                        label: "R²分数",
                    }));
                    const __VLS_564 = __VLS_563({
                        label: "R²分数",
                    }, ...__VLS_functionalComponentArgsRest(__VLS_563));
                    __VLS_565.slots.default;
                    (__VLS_ctx.parsedAnalysisResult.regression.r2?.toFixed(4));
                    var __VLS_565;
                    var __VLS_545;
                }
                else if (__VLS_ctx.parsedAnalysisResult.regression.error) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                        ...{ class: "error-message" },
                    });
                    (__VLS_ctx.parsedAnalysisResult.regression.error);
                }
                var __VLS_541;
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
        }
        else {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.pre, __VLS_intrinsicElements.pre)({});
            (__VLS_ctx.analysisResult.result);
        }
    }
    var __VLS_397;
    var __VLS_393;
    const __VLS_566 = {}.ElTabPane;
    /** @type {[typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, ]} */ ;
    // @ts-ignore
    const __VLS_567 = __VLS_asFunctionalComponent(__VLS_566, new __VLS_566({
        label: "分析报告",
        name: "report",
    }));
    const __VLS_568 = __VLS_567({
        label: "分析报告",
        name: "report",
    }, ...__VLS_functionalComponentArgsRest(__VLS_567));
    __VLS_569.slots.default;
    const __VLS_570 = {}.ElCard;
    /** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
    // @ts-ignore
    const __VLS_571 = __VLS_asFunctionalComponent(__VLS_570, new __VLS_570({
        ...{ class: "report-card" },
    }));
    const __VLS_572 = __VLS_571({
        ...{ class: "report-card" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_571));
    __VLS_573.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "markdown-content" },
    });
    __VLS_asFunctionalDirective(__VLS_directives.vHtml)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.renderMarkdown(__VLS_ctx.analysisResult.report || '')) }, null, null);
    var __VLS_573;
    var __VLS_569;
    var __VLS_389;
}
var __VLS_229;
const __VLS_574 = {}.ElTabPane;
/** @type {[typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, ]} */ ;
// @ts-ignore
const __VLS_575 = __VLS_asFunctionalComponent(__VLS_574, new __VLS_574({
    label: "分析结果历史",
    name: "history",
}));
const __VLS_576 = __VLS_575({
    label: "分析结果历史",
    name: "history",
}, ...__VLS_functionalComponentArgsRest(__VLS_575));
__VLS_577.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "history-section" },
});
const __VLS_578 = {}.ElTable;
/** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
// @ts-ignore
const __VLS_579 = __VLS_asFunctionalComponent(__VLS_578, new __VLS_578({
    data: (__VLS_ctx.analysisResults),
    ...{ style: {} },
}));
const __VLS_580 = __VLS_579({
    data: (__VLS_ctx.analysisResults),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_579));
__VLS_581.slots.default;
const __VLS_582 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_583 = __VLS_asFunctionalComponent(__VLS_582, new __VLS_582({
    prop: "name",
    label: "名称",
    width: "200",
}));
const __VLS_584 = __VLS_583({
    prop: "name",
    label: "名称",
    width: "200",
}, ...__VLS_functionalComponentArgsRest(__VLS_583));
const __VLS_586 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_587 = __VLS_asFunctionalComponent(__VLS_586, new __VLS_586({
    prop: "query",
    label: "分析需求",
    width: "300",
}));
const __VLS_588 = __VLS_587({
    prop: "query",
    label: "分析需求",
    width: "300",
}, ...__VLS_functionalComponentArgsRest(__VLS_587));
const __VLS_590 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_591 = __VLS_asFunctionalComponent(__VLS_590, new __VLS_590({
    prop: "create_time",
    label: "创建时间",
    width: "180",
}));
const __VLS_592 = __VLS_591({
    prop: "create_time",
    label: "创建时间",
    width: "180",
}, ...__VLS_functionalComponentArgsRest(__VLS_591));
const __VLS_594 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_595 = __VLS_asFunctionalComponent(__VLS_594, new __VLS_594({
    prop: "status",
    label: "状态",
    width: "100",
}));
const __VLS_596 = __VLS_595({
    prop: "status",
    label: "状态",
    width: "100",
}, ...__VLS_functionalComponentArgsRest(__VLS_595));
__VLS_597.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_597.slots;
    const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_598 = {}.ElTag;
    /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
    // @ts-ignore
    const __VLS_599 = __VLS_asFunctionalComponent(__VLS_598, new __VLS_598({
        type: (scope.row.status === 'success' ? 'success' : 'danger'),
    }));
    const __VLS_600 = __VLS_599({
        type: (scope.row.status === 'success' ? 'success' : 'danger'),
    }, ...__VLS_functionalComponentArgsRest(__VLS_599));
    __VLS_601.slots.default;
    (scope.row.status === 'success' ? '成功' : '失败');
    var __VLS_601;
}
var __VLS_597;
const __VLS_602 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_603 = __VLS_asFunctionalComponent(__VLS_602, new __VLS_602({
    label: "操作",
    width: "150",
}));
const __VLS_604 = __VLS_603({
    label: "操作",
    width: "150",
}, ...__VLS_functionalComponentArgsRest(__VLS_603));
__VLS_605.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_605.slots;
    const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_606 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_607 = __VLS_asFunctionalComponent(__VLS_606, new __VLS_606({
        ...{ 'onClick': {} },
        size: "small",
    }));
    const __VLS_608 = __VLS_607({
        ...{ 'onClick': {} },
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_607));
    let __VLS_610;
    let __VLS_611;
    let __VLS_612;
    const __VLS_613 = {
        onClick: (...[$event]) => {
            __VLS_ctx.openResultDialog(scope.row);
        }
    };
    __VLS_609.slots.default;
    var __VLS_609;
}
var __VLS_605;
var __VLS_581;
var __VLS_577;
var __VLS_77;
var __VLS_73;
var __VLS_69;
var __VLS_20;
var __VLS_3;
const __VLS_614 = {}.ElDialog;
/** @type {[typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ]} */ ;
// @ts-ignore
const __VLS_615 = __VLS_asFunctionalComponent(__VLS_614, new __VLS_614({
    modelValue: (__VLS_ctx.resultDialogVisible),
    title: "分析结果详情",
    width: "90%",
    closeOnClickModal: (false),
    fullscreen: (false),
}));
const __VLS_616 = __VLS_615({
    modelValue: (__VLS_ctx.resultDialogVisible),
    title: "分析结果详情",
    width: "90%",
    closeOnClickModal: (false),
    fullscreen: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_615));
__VLS_617.slots.default;
if (__VLS_ctx.selectedAnalysisResult) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "result-dialog-content" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "result-query" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    (__VLS_ctx.selectedAnalysisResult.query);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "result-content" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    if (__VLS_ctx.selectedResultParsed.correlation_matrix) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "correlation-result" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
        const __VLS_618 = {}.ElTable;
        /** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
        // @ts-ignore
        const __VLS_619 = __VLS_asFunctionalComponent(__VLS_618, new __VLS_618({
            data: (__VLS_ctx.selectedCorrelationMatrixData),
            ...{ style: {} },
        }));
        const __VLS_620 = __VLS_619({
            data: (__VLS_ctx.selectedCorrelationMatrixData),
            ...{ style: {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_619));
        __VLS_621.slots.default;
        const __VLS_622 = {}.ElTableColumn;
        /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
        // @ts-ignore
        const __VLS_623 = __VLS_asFunctionalComponent(__VLS_622, new __VLS_622({
            prop: "column",
            label: "列名",
            width: "120",
        }));
        const __VLS_624 = __VLS_623({
            prop: "column",
            label: "列名",
            width: "120",
        }, ...__VLS_functionalComponentArgsRest(__VLS_623));
        for (const [col] of __VLS_getVForSourceType((__VLS_ctx.selectedCorrelationColumns))) {
            const __VLS_626 = {}.ElTableColumn;
            /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
            // @ts-ignore
            const __VLS_627 = __VLS_asFunctionalComponent(__VLS_626, new __VLS_626({
                key: (col),
                prop: (col),
                label: (col),
            }));
            const __VLS_628 = __VLS_627({
                key: (col),
                prop: (col),
                label: (col),
            }, ...__VLS_functionalComponentArgsRest(__VLS_627));
            __VLS_629.slots.default;
            {
                const { default: __VLS_thisSlot } = __VLS_629.slots;
                const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                    ...{ class: (__VLS_ctx.getCorrelationClass(scope.row[col])) },
                });
                (scope.row[col].toFixed(4));
            }
            var __VLS_629;
        }
        var __VLS_621;
        if (__VLS_ctx.selectedResultParsed.charts && __VLS_ctx.selectedResultParsed.charts.correlation_matrix) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "chart-container" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
                src: (__VLS_ctx.selectedResultParsed.charts.correlation_matrix),
                alt: "相关性矩阵热力图",
                ...{ style: {} },
            });
        }
    }
    else if (__VLS_ctx.selectedResultParsed.stats) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "descriptive-result" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
        for (const [stats, column] of __VLS_getVForSourceType((__VLS_ctx.selectedResultParsed.stats))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                key: (column),
                ...{ class: "column-stats" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.h5, __VLS_intrinsicElements.h5)({});
            (column);
            const __VLS_630 = {}.ElTable;
            /** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
            // @ts-ignore
            const __VLS_631 = __VLS_asFunctionalComponent(__VLS_630, new __VLS_630({
                data: ([stats]),
                ...{ style: {} },
            }));
            const __VLS_632 = __VLS_631({
                data: ([stats]),
                ...{ style: {} },
            }, ...__VLS_functionalComponentArgsRest(__VLS_631));
            __VLS_633.slots.default;
            for (const [_, key] of __VLS_getVForSourceType((stats))) {
                const __VLS_634 = {}.ElTableColumn;
                /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
                // @ts-ignore
                const __VLS_635 = __VLS_asFunctionalComponent(__VLS_634, new __VLS_634({
                    key: (key),
                    prop: (key),
                    label: (__VLS_ctx.formatStatKey(key.toString())),
                }));
                const __VLS_636 = __VLS_635({
                    key: (key),
                    prop: (key),
                    label: (__VLS_ctx.formatStatKey(key.toString())),
                }, ...__VLS_functionalComponentArgsRest(__VLS_635));
            }
            var __VLS_633;
            if (__VLS_ctx.selectedResultParsed.charts && __VLS_ctx.selectedResultParsed.charts[column]) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "chart-container" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
                    src: (__VLS_ctx.selectedResultParsed.charts[column]),
                    alt: (`${column}统计图表`),
                    ...{ style: {} },
                });
            }
        }
    }
    else if (__VLS_ctx.selectedResultParsed.clusters) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "clustering-result" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
        if (__VLS_ctx.selectedResultParsed.clusters) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "clustering-info" },
            });
            const __VLS_638 = {}.ElCard;
            /** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
            // @ts-ignore
            const __VLS_639 = __VLS_asFunctionalComponent(__VLS_638, new __VLS_638({}));
            const __VLS_640 = __VLS_639({}, ...__VLS_functionalComponentArgsRest(__VLS_639));
            __VLS_641.slots.default;
            if (__VLS_ctx.selectedResultParsed.clusters.model) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "model-info" },
                });
                const __VLS_642 = {}.ElDescriptions;
                /** @type {[typeof __VLS_components.ElDescriptions, typeof __VLS_components.elDescriptions, typeof __VLS_components.ElDescriptions, typeof __VLS_components.elDescriptions, ]} */ ;
                // @ts-ignore
                const __VLS_643 = __VLS_asFunctionalComponent(__VLS_642, new __VLS_642({
                    column: (2),
                    border: true,
                }));
                const __VLS_644 = __VLS_643({
                    column: (2),
                    border: true,
                }, ...__VLS_functionalComponentArgsRest(__VLS_643));
                __VLS_645.slots.default;
                const __VLS_646 = {}.ElDescriptionsItem;
                /** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
                // @ts-ignore
                const __VLS_647 = __VLS_asFunctionalComponent(__VLS_646, new __VLS_646({
                    label: "模型",
                }));
                const __VLS_648 = __VLS_647({
                    label: "模型",
                }, ...__VLS_functionalComponentArgsRest(__VLS_647));
                __VLS_649.slots.default;
                (__VLS_ctx.selectedResultParsed.clusters.model);
                var __VLS_649;
                const __VLS_650 = {}.ElDescriptionsItem;
                /** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
                // @ts-ignore
                const __VLS_651 = __VLS_asFunctionalComponent(__VLS_650, new __VLS_650({
                    label: "聚类数量",
                }));
                const __VLS_652 = __VLS_651({
                    label: "聚类数量",
                }, ...__VLS_functionalComponentArgsRest(__VLS_651));
                __VLS_653.slots.default;
                (__VLS_ctx.selectedResultParsed.clusters.n_clusters);
                var __VLS_653;
                const __VLS_654 = {}.ElDescriptionsItem;
                /** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
                // @ts-ignore
                const __VLS_655 = __VLS_asFunctionalComponent(__VLS_654, new __VLS_654({
                    label: "聚类列",
                    span: (2),
                }));
                const __VLS_656 = __VLS_655({
                    label: "聚类列",
                    span: (2),
                }, ...__VLS_functionalComponentArgsRest(__VLS_655));
                __VLS_657.slots.default;
                (__VLS_ctx.selectedResultParsed.clusters.cluster_columns?.join(', '));
                var __VLS_657;
                const __VLS_658 = {}.ElDescriptionsItem;
                /** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
                // @ts-ignore
                const __VLS_659 = __VLS_asFunctionalComponent(__VLS_658, new __VLS_658({
                    label: "聚类中心",
                    span: (2),
                }));
                const __VLS_660 = __VLS_659({
                    label: "聚类中心",
                    span: (2),
                }, ...__VLS_functionalComponentArgsRest(__VLS_659));
                __VLS_661.slots.default;
                __VLS_asFunctionalElement(__VLS_intrinsicElements.pre, __VLS_intrinsicElements.pre)({
                    ...{ style: {} },
                });
                (JSON.stringify(__VLS_ctx.selectedResultParsed.clusters.cluster_centers, null, 2));
                var __VLS_661;
                const __VLS_662 = {}.ElDescriptionsItem;
                /** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
                // @ts-ignore
                const __VLS_663 = __VLS_asFunctionalComponent(__VLS_662, new __VLS_662({
                    label: "聚类计数",
                    span: (2),
                }));
                const __VLS_664 = __VLS_663({
                    label: "聚类计数",
                    span: (2),
                }, ...__VLS_functionalComponentArgsRest(__VLS_663));
                __VLS_665.slots.default;
                __VLS_asFunctionalElement(__VLS_intrinsicElements.pre, __VLS_intrinsicElements.pre)({
                    ...{ style: {} },
                });
                (JSON.stringify(__VLS_ctx.selectedResultParsed.clusters.cluster_counts, null, 2));
                var __VLS_665;
                var __VLS_645;
            }
            var __VLS_641;
            if (__VLS_ctx.selectedResultParsed.charts && __VLS_ctx.selectedResultParsed.charts.clustering) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "chart-container" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
                    src: (__VLS_ctx.selectedResultParsed.charts.clustering),
                    alt: "聚类图表",
                    ...{ style: {} },
                });
            }
        }
    }
    else if (__VLS_ctx.selectedResultParsed.regression) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "regression-result" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
        if (__VLS_ctx.selectedResultParsed.regression) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "regression-info" },
            });
            const __VLS_666 = {}.ElCard;
            /** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
            // @ts-ignore
            const __VLS_667 = __VLS_asFunctionalComponent(__VLS_666, new __VLS_666({}));
            const __VLS_668 = __VLS_667({}, ...__VLS_functionalComponentArgsRest(__VLS_667));
            __VLS_669.slots.default;
            if (__VLS_ctx.selectedResultParsed.regression.model) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "model-info" },
                });
                const __VLS_670 = {}.ElDescriptions;
                /** @type {[typeof __VLS_components.ElDescriptions, typeof __VLS_components.elDescriptions, typeof __VLS_components.ElDescriptions, typeof __VLS_components.elDescriptions, ]} */ ;
                // @ts-ignore
                const __VLS_671 = __VLS_asFunctionalComponent(__VLS_670, new __VLS_670({
                    column: (2),
                    border: true,
                }));
                const __VLS_672 = __VLS_671({
                    column: (2),
                    border: true,
                }, ...__VLS_functionalComponentArgsRest(__VLS_671));
                __VLS_673.slots.default;
                const __VLS_674 = {}.ElDescriptionsItem;
                /** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
                // @ts-ignore
                const __VLS_675 = __VLS_asFunctionalComponent(__VLS_674, new __VLS_674({
                    label: "模型",
                }));
                const __VLS_676 = __VLS_675({
                    label: "模型",
                }, ...__VLS_functionalComponentArgsRest(__VLS_675));
                __VLS_677.slots.default;
                (__VLS_ctx.selectedResultParsed.regression.model);
                var __VLS_677;
                const __VLS_678 = {}.ElDescriptionsItem;
                /** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
                // @ts-ignore
                const __VLS_679 = __VLS_asFunctionalComponent(__VLS_678, new __VLS_678({
                    label: "目标列",
                }));
                const __VLS_680 = __VLS_679({
                    label: "目标列",
                }, ...__VLS_functionalComponentArgsRest(__VLS_679));
                __VLS_681.slots.default;
                (__VLS_ctx.selectedResultParsed.regression.target_column);
                var __VLS_681;
                const __VLS_682 = {}.ElDescriptionsItem;
                /** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
                // @ts-ignore
                const __VLS_683 = __VLS_asFunctionalComponent(__VLS_682, new __VLS_682({
                    label: "特征列",
                    span: (2),
                }));
                const __VLS_684 = __VLS_683({
                    label: "特征列",
                    span: (2),
                }, ...__VLS_functionalComponentArgsRest(__VLS_683));
                __VLS_685.slots.default;
                (__VLS_ctx.selectedResultParsed.regression.feature_columns?.join(', '));
                var __VLS_685;
                const __VLS_686 = {}.ElDescriptionsItem;
                /** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
                // @ts-ignore
                const __VLS_687 = __VLS_asFunctionalComponent(__VLS_686, new __VLS_686({
                    label: "均方误差",
                }));
                const __VLS_688 = __VLS_687({
                    label: "均方误差",
                }, ...__VLS_functionalComponentArgsRest(__VLS_687));
                __VLS_689.slots.default;
                (__VLS_ctx.selectedResultParsed.regression.mse?.toFixed(4));
                var __VLS_689;
                const __VLS_690 = {}.ElDescriptionsItem;
                /** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
                // @ts-ignore
                const __VLS_691 = __VLS_asFunctionalComponent(__VLS_690, new __VLS_690({
                    label: "R²分数",
                }));
                const __VLS_692 = __VLS_691({
                    label: "R²分数",
                }, ...__VLS_functionalComponentArgsRest(__VLS_691));
                __VLS_693.slots.default;
                (__VLS_ctx.selectedResultParsed.regression.r2?.toFixed(4));
                var __VLS_693;
                var __VLS_673;
            }
            var __VLS_669;
            if (__VLS_ctx.selectedResultParsed.charts && __VLS_ctx.selectedResultParsed.charts.regression) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "chart-container" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
                    src: (__VLS_ctx.selectedResultParsed.charts.regression),
                    alt: "回归图表",
                    ...{ style: {} },
                });
            }
        }
    }
    else if (__VLS_ctx.selectedResultParsed.distributions) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "distribution-result" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
        for (const [dist, column] of __VLS_getVForSourceType((__VLS_ctx.selectedResultParsed.distributions))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                key: (column),
                ...{ class: "column-distribution" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.h5, __VLS_intrinsicElements.h5)({});
            (column);
            const __VLS_694 = {}.ElCollapse;
            /** @type {[typeof __VLS_components.ElCollapse, typeof __VLS_components.elCollapse, typeof __VLS_components.ElCollapse, typeof __VLS_components.elCollapse, ]} */ ;
            // @ts-ignore
            const __VLS_695 = __VLS_asFunctionalComponent(__VLS_694, new __VLS_694({}));
            const __VLS_696 = __VLS_695({}, ...__VLS_functionalComponentArgsRest(__VLS_695));
            __VLS_697.slots.default;
            const __VLS_698 = {}.ElCollapseItem;
            /** @type {[typeof __VLS_components.ElCollapseItem, typeof __VLS_components.elCollapseItem, typeof __VLS_components.ElCollapseItem, typeof __VLS_components.elCollapseItem, ]} */ ;
            // @ts-ignore
            const __VLS_699 = __VLS_asFunctionalComponent(__VLS_698, new __VLS_698({
                title: "分位数",
            }));
            const __VLS_700 = __VLS_699({
                title: "分位数",
            }, ...__VLS_functionalComponentArgsRest(__VLS_699));
            __VLS_701.slots.default;
            const __VLS_702 = {}.ElTable;
            /** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
            // @ts-ignore
            const __VLS_703 = __VLS_asFunctionalComponent(__VLS_702, new __VLS_702({
                data: ([dist.quantiles]),
                ...{ style: {} },
            }));
            const __VLS_704 = __VLS_703({
                data: ([dist.quantiles]),
                ...{ style: {} },
            }, ...__VLS_functionalComponentArgsRest(__VLS_703));
            __VLS_705.slots.default;
            for (const [_, key] of __VLS_getVForSourceType((dist.quantiles))) {
                const __VLS_706 = {}.ElTableColumn;
                /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
                // @ts-ignore
                const __VLS_707 = __VLS_asFunctionalComponent(__VLS_706, new __VLS_706({
                    key: (key),
                    prop: (key),
                    label: (`${key.toString()}分位数`),
                }));
                const __VLS_708 = __VLS_707({
                    key: (key),
                    prop: (key),
                    label: (`${key.toString()}分位数`),
                }, ...__VLS_functionalComponentArgsRest(__VLS_707));
            }
            var __VLS_705;
            var __VLS_701;
            const __VLS_710 = {}.ElCollapseItem;
            /** @type {[typeof __VLS_components.ElCollapseItem, typeof __VLS_components.elCollapseItem, typeof __VLS_components.ElCollapseItem, typeof __VLS_components.elCollapseItem, ]} */ ;
            // @ts-ignore
            const __VLS_711 = __VLS_asFunctionalComponent(__VLS_710, new __VLS_710({
                title: "值分布",
            }));
            const __VLS_712 = __VLS_711({
                title: "值分布",
            }, ...__VLS_functionalComponentArgsRest(__VLS_711));
            __VLS_713.slots.default;
            const __VLS_714 = {}.ElTable;
            /** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
            // @ts-ignore
            const __VLS_715 = __VLS_asFunctionalComponent(__VLS_714, new __VLS_714({
                data: (Object.entries(dist.value_counts).map(([value, count]) => ({ value, count }))),
                ...{ style: {} },
            }));
            const __VLS_716 = __VLS_715({
                data: (Object.entries(dist.value_counts).map(([value, count]) => ({ value, count }))),
                ...{ style: {} },
            }, ...__VLS_functionalComponentArgsRest(__VLS_715));
            __VLS_717.slots.default;
            const __VLS_718 = {}.ElTableColumn;
            /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
            // @ts-ignore
            const __VLS_719 = __VLS_asFunctionalComponent(__VLS_718, new __VLS_718({
                prop: "value",
                label: "值",
            }));
            const __VLS_720 = __VLS_719({
                prop: "value",
                label: "值",
            }, ...__VLS_functionalComponentArgsRest(__VLS_719));
            const __VLS_722 = {}.ElTableColumn;
            /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
            // @ts-ignore
            const __VLS_723 = __VLS_asFunctionalComponent(__VLS_722, new __VLS_722({
                prop: "count",
                label: "计数",
            }));
            const __VLS_724 = __VLS_723({
                prop: "count",
                label: "计数",
            }, ...__VLS_functionalComponentArgsRest(__VLS_723));
            var __VLS_717;
            var __VLS_713;
            var __VLS_697;
            if (__VLS_ctx.selectedResultParsed.charts && __VLS_ctx.selectedResultParsed.charts[column]) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "chart-container" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
                    src: (__VLS_ctx.selectedResultParsed.charts[column]),
                    alt: (`${column}分布图`),
                    ...{ style: {} },
                });
            }
        }
    }
    else if (__VLS_ctx.selectedResultParsed.anomalies) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "anomaly-result" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
        for (const [anomaly, column] of __VLS_getVForSourceType((__VLS_ctx.selectedResultParsed.anomalies))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                key: (column),
                ...{ class: "column-anomaly" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.h5, __VLS_intrinsicElements.h5)({});
            (column);
            const __VLS_726 = {}.ElCard;
            /** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
            // @ts-ignore
            const __VLS_727 = __VLS_asFunctionalComponent(__VLS_726, new __VLS_726({
                ...{ class: "anomaly-info-card" },
            }));
            const __VLS_728 = __VLS_727({
                ...{ class: "anomaly-info-card" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_727));
            __VLS_729.slots.default;
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "anomaly-stats" },
            });
            const __VLS_730 = {}.ElStatistic;
            /** @type {[typeof __VLS_components.ElStatistic, typeof __VLS_components.elStatistic, ]} */ ;
            // @ts-ignore
            const __VLS_731 = __VLS_asFunctionalComponent(__VLS_730, new __VLS_730({
                title: "下限值",
                value: (anomaly.lower_bound),
                precision: (2),
            }));
            const __VLS_732 = __VLS_731({
                title: "下限值",
                value: (anomaly.lower_bound),
                precision: (2),
            }, ...__VLS_functionalComponentArgsRest(__VLS_731));
            const __VLS_734 = {}.ElStatistic;
            /** @type {[typeof __VLS_components.ElStatistic, typeof __VLS_components.elStatistic, ]} */ ;
            // @ts-ignore
            const __VLS_735 = __VLS_asFunctionalComponent(__VLS_734, new __VLS_734({
                title: "上限值",
                value: (anomaly.upper_bound),
                precision: (2),
            }));
            const __VLS_736 = __VLS_735({
                title: "上限值",
                value: (anomaly.upper_bound),
                precision: (2),
            }, ...__VLS_functionalComponentArgsRest(__VLS_735));
            const __VLS_738 = {}.ElStatistic;
            /** @type {[typeof __VLS_components.ElStatistic, typeof __VLS_components.elStatistic, ]} */ ;
            // @ts-ignore
            const __VLS_739 = __VLS_asFunctionalComponent(__VLS_738, new __VLS_738({
                title: "异常值数量",
                value: (anomaly.outlier_count),
            }));
            const __VLS_740 = __VLS_739({
                title: "异常值数量",
                value: (anomaly.outlier_count),
            }, ...__VLS_functionalComponentArgsRest(__VLS_739));
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "anomaly-values" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.h6, __VLS_intrinsicElements.h6)({});
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "outlier-tags" },
            });
            for (const [val, idx] of __VLS_getVForSourceType((anomaly.outliers))) {
                const __VLS_742 = {}.ElTag;
                /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
                // @ts-ignore
                const __VLS_743 = __VLS_asFunctionalComponent(__VLS_742, new __VLS_742({
                    key: (idx),
                    type: "danger",
                    ...{ class: "outlier-tag" },
                }));
                const __VLS_744 = __VLS_743({
                    key: (idx),
                    type: "danger",
                    ...{ class: "outlier-tag" },
                }, ...__VLS_functionalComponentArgsRest(__VLS_743));
                __VLS_745.slots.default;
                (val);
                var __VLS_745;
            }
            var __VLS_729;
            if (__VLS_ctx.selectedResultParsed.charts && __VLS_ctx.selectedResultParsed.charts[column]) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "chart-container" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
                    src: (__VLS_ctx.selectedResultParsed.charts[column]),
                    alt: (`${column}箱线图`),
                    ...{ style: {} },
                });
            }
        }
    }
    else if (__VLS_ctx.selectedResultParsed.trends) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "trend-result" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
        for (const [_, column] of __VLS_getVForSourceType((__VLS_ctx.selectedResultParsed.trends))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                key: (column),
                ...{ class: "column-trend" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.h5, __VLS_intrinsicElements.h5)({});
            (column);
            if (__VLS_ctx.selectedResultParsed.charts && __VLS_ctx.selectedResultParsed.charts[column]) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "chart-container" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
                    src: (__VLS_ctx.selectedResultParsed.charts[column]),
                    alt: (`${column}趋势图`),
                    ...{ style: {} },
                });
            }
        }
    }
    else if (__VLS_ctx.selectedResultParsed.time_series) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "time-series-result" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
        for (const [ts, column] of __VLS_getVForSourceType((__VLS_ctx.selectedResultParsed.time_series))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                key: (column),
                ...{ class: "column-time-series" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.h5, __VLS_intrinsicElements.h5)({});
            (column);
            const __VLS_746 = {}.ElCard;
            /** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
            // @ts-ignore
            const __VLS_747 = __VLS_asFunctionalComponent(__VLS_746, new __VLS_746({
                ...{ class: "ts-stats-card" },
            }));
            const __VLS_748 = __VLS_747({
                ...{ class: "ts-stats-card" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_747));
            __VLS_749.slots.default;
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "ts-stats" },
            });
            const __VLS_750 = {}.ElStatistic;
            /** @type {[typeof __VLS_components.ElStatistic, typeof __VLS_components.elStatistic, ]} */ ;
            // @ts-ignore
            const __VLS_751 = __VLS_asFunctionalComponent(__VLS_750, new __VLS_750({
                title: "均值",
                value: (ts.mean),
                precision: (2),
            }));
            const __VLS_752 = __VLS_751({
                title: "均值",
                value: (ts.mean),
                precision: (2),
            }, ...__VLS_functionalComponentArgsRest(__VLS_751));
            const __VLS_754 = {}.ElStatistic;
            /** @type {[typeof __VLS_components.ElStatistic, typeof __VLS_components.elStatistic, ]} */ ;
            // @ts-ignore
            const __VLS_755 = __VLS_asFunctionalComponent(__VLS_754, new __VLS_754({
                title: "标准差",
                value: (ts.std),
                precision: (2),
            }));
            const __VLS_756 = __VLS_755({
                title: "标准差",
                value: (ts.std),
                precision: (2),
            }, ...__VLS_functionalComponentArgsRest(__VLS_755));
            var __VLS_749;
            if (__VLS_ctx.selectedResultParsed.charts && __VLS_ctx.selectedResultParsed.charts[column]) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "chart-container" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
                    src: (__VLS_ctx.selectedResultParsed.charts[column]),
                    alt: (`${column}时间序列图`),
                    ...{ style: {} },
                });
            }
        }
    }
    else if (__VLS_ctx.selectedResultParsed.predictions) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "prediction-result" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
        if (__VLS_ctx.selectedResultParsed.predictions) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "prediction-info" },
            });
            const __VLS_758 = {}.ElCard;
            /** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
            // @ts-ignore
            const __VLS_759 = __VLS_asFunctionalComponent(__VLS_758, new __VLS_758({}));
            const __VLS_760 = __VLS_759({}, ...__VLS_functionalComponentArgsRest(__VLS_759));
            __VLS_761.slots.default;
            if (__VLS_ctx.selectedResultParsed.predictions.model) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "model-info" },
                });
                const __VLS_762 = {}.ElDescriptions;
                /** @type {[typeof __VLS_components.ElDescriptions, typeof __VLS_components.elDescriptions, typeof __VLS_components.ElDescriptions, typeof __VLS_components.elDescriptions, ]} */ ;
                // @ts-ignore
                const __VLS_763 = __VLS_asFunctionalComponent(__VLS_762, new __VLS_762({
                    column: (2),
                    border: true,
                }));
                const __VLS_764 = __VLS_763({
                    column: (2),
                    border: true,
                }, ...__VLS_functionalComponentArgsRest(__VLS_763));
                __VLS_765.slots.default;
                const __VLS_766 = {}.ElDescriptionsItem;
                /** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
                // @ts-ignore
                const __VLS_767 = __VLS_asFunctionalComponent(__VLS_766, new __VLS_766({
                    label: "模型",
                }));
                const __VLS_768 = __VLS_767({
                    label: "模型",
                }, ...__VLS_functionalComponentArgsRest(__VLS_767));
                __VLS_769.slots.default;
                (__VLS_ctx.selectedResultParsed.predictions.model);
                var __VLS_769;
                const __VLS_770 = {}.ElDescriptionsItem;
                /** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
                // @ts-ignore
                const __VLS_771 = __VLS_asFunctionalComponent(__VLS_770, new __VLS_770({
                    label: "目标列",
                }));
                const __VLS_772 = __VLS_771({
                    label: "目标列",
                }, ...__VLS_functionalComponentArgsRest(__VLS_771));
                __VLS_773.slots.default;
                (__VLS_ctx.selectedResultParsed.predictions.target_column);
                var __VLS_773;
                const __VLS_774 = {}.ElDescriptionsItem;
                /** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
                // @ts-ignore
                const __VLS_775 = __VLS_asFunctionalComponent(__VLS_774, new __VLS_774({
                    label: "特征列",
                }));
                const __VLS_776 = __VLS_775({
                    label: "特征列",
                }, ...__VLS_functionalComponentArgsRest(__VLS_775));
                __VLS_777.slots.default;
                (__VLS_ctx.selectedResultParsed.predictions.feature_columns?.join(', '));
                var __VLS_777;
                const __VLS_778 = {}.ElDescriptionsItem;
                /** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
                // @ts-ignore
                const __VLS_779 = __VLS_asFunctionalComponent(__VLS_778, new __VLS_778({
                    label: "均方误差",
                }));
                const __VLS_780 = __VLS_779({
                    label: "均方误差",
                }, ...__VLS_functionalComponentArgsRest(__VLS_779));
                __VLS_781.slots.default;
                (__VLS_ctx.selectedResultParsed.predictions.mse?.toFixed(4));
                var __VLS_781;
                const __VLS_782 = {}.ElDescriptionsItem;
                /** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
                // @ts-ignore
                const __VLS_783 = __VLS_asFunctionalComponent(__VLS_782, new __VLS_782({
                    label: "R²分数",
                    span: (2),
                }));
                const __VLS_784 = __VLS_783({
                    label: "R²分数",
                    span: (2),
                }, ...__VLS_functionalComponentArgsRest(__VLS_783));
                __VLS_785.slots.default;
                (__VLS_ctx.selectedResultParsed.predictions.r2?.toFixed(4));
                var __VLS_785;
                var __VLS_765;
            }
            var __VLS_761;
            if (__VLS_ctx.selectedResultParsed.charts && __VLS_ctx.selectedResultParsed.charts.prediction) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "chart-container" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
                    src: (__VLS_ctx.selectedResultParsed.charts.prediction),
                    alt: "预测图表",
                    ...{ style: {} },
                });
            }
        }
    }
    else if (__VLS_ctx.selectedAnalysisResult.result_data) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "result-data" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.pre, __VLS_intrinsicElements.pre)({});
        (__VLS_ctx.selectedAnalysisResult.result_data);
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "no-result" },
        });
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "result-report" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "markdown-content" },
    });
    __VLS_asFunctionalDirective(__VLS_directives.vHtml)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.renderMarkdown(__VLS_ctx.selectedAnalysisResult.result_summary || '')) }, null, null);
}
var __VLS_617;
/** @type {__VLS_StyleScopedClasses['analysis-page-container']} */ ;
/** @type {__VLS_StyleScopedClasses['no-padding']} */ ;
/** @type {__VLS_StyleScopedClasses['analysis-sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['analysis-main-container']} */ ;
/** @type {__VLS_StyleScopedClasses['analysis-sidebar-toggle']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['analysis-main']} */ ;
/** @type {__VLS_StyleScopedClasses['analysis-container']} */ ;
/** @type {__VLS_StyleScopedClasses['analysis-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-header']} */ ;
/** @type {__VLS_StyleScopedClasses['analysis-tabs']} */ ;
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
/** @type {__VLS_StyleScopedClasses['data-source-form']} */ ;
/** @type {__VLS_StyleScopedClasses['data-preview']} */ ;
/** @type {__VLS_StyleScopedClasses['analysis-type-card']} */ ;
/** @type {__VLS_StyleScopedClasses['analysis-form']} */ ;
/** @type {__VLS_StyleScopedClasses['column-hint']} */ ;
/** @type {__VLS_StyleScopedClasses['column-hint']} */ ;
/** @type {__VLS_StyleScopedClasses['generated-requirement']} */ ;
/** @type {__VLS_StyleScopedClasses['requirement-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['analysis-suggestions']} */ ;
/** @type {__VLS_StyleScopedClasses['suggestion-tag']} */ ;
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
/** @type {__VLS_StyleScopedClasses['analysis-result']} */ ;
/** @type {__VLS_StyleScopedClasses['result-tabs']} */ ;
/** @type {__VLS_StyleScopedClasses['result-card']} */ ;
/** @type {__VLS_StyleScopedClasses['correlation-result']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-container']} */ ;
/** @type {__VLS_StyleScopedClasses['analysis-result-content']} */ ;
/** @type {__VLS_StyleScopedClasses['descriptive-result']} */ ;
/** @type {__VLS_StyleScopedClasses['column-stats']} */ ;
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
/** @type {__VLS_StyleScopedClasses['outlier-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-container']} */ ;
/** @type {__VLS_StyleScopedClasses['trend-result']} */ ;
/** @type {__VLS_StyleScopedClasses['column-trend']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-container']} */ ;
/** @type {__VLS_StyleScopedClasses['time-series-result']} */ ;
/** @type {__VLS_StyleScopedClasses['column-time-series']} */ ;
/** @type {__VLS_StyleScopedClasses['ts-stats-card']} */ ;
/** @type {__VLS_StyleScopedClasses['ts-stats']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-container']} */ ;
/** @type {__VLS_StyleScopedClasses['prediction-result']} */ ;
/** @type {__VLS_StyleScopedClasses['prediction-info']} */ ;
/** @type {__VLS_StyleScopedClasses['model-info']} */ ;
/** @type {__VLS_StyleScopedClasses['error-message']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-container']} */ ;
/** @type {__VLS_StyleScopedClasses['clustering-result']} */ ;
/** @type {__VLS_StyleScopedClasses['clustering-info']} */ ;
/** @type {__VLS_StyleScopedClasses['model-info']} */ ;
/** @type {__VLS_StyleScopedClasses['error-message']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-container']} */ ;
/** @type {__VLS_StyleScopedClasses['regression-result']} */ ;
/** @type {__VLS_StyleScopedClasses['regression-info']} */ ;
/** @type {__VLS_StyleScopedClasses['model-info']} */ ;
/** @type {__VLS_StyleScopedClasses['error-message']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-container']} */ ;
/** @type {__VLS_StyleScopedClasses['report-card']} */ ;
/** @type {__VLS_StyleScopedClasses['markdown-content']} */ ;
/** @type {__VLS_StyleScopedClasses['history-section']} */ ;
/** @type {__VLS_StyleScopedClasses['result-dialog-content']} */ ;
/** @type {__VLS_StyleScopedClasses['result-query']} */ ;
/** @type {__VLS_StyleScopedClasses['result-content']} */ ;
/** @type {__VLS_StyleScopedClasses['correlation-result']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-container']} */ ;
/** @type {__VLS_StyleScopedClasses['descriptive-result']} */ ;
/** @type {__VLS_StyleScopedClasses['column-stats']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-container']} */ ;
/** @type {__VLS_StyleScopedClasses['clustering-result']} */ ;
/** @type {__VLS_StyleScopedClasses['clustering-info']} */ ;
/** @type {__VLS_StyleScopedClasses['model-info']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-container']} */ ;
/** @type {__VLS_StyleScopedClasses['regression-result']} */ ;
/** @type {__VLS_StyleScopedClasses['regression-info']} */ ;
/** @type {__VLS_StyleScopedClasses['model-info']} */ ;
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
/** @type {__VLS_StyleScopedClasses['outlier-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-container']} */ ;
/** @type {__VLS_StyleScopedClasses['trend-result']} */ ;
/** @type {__VLS_StyleScopedClasses['column-trend']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-container']} */ ;
/** @type {__VLS_StyleScopedClasses['time-series-result']} */ ;
/** @type {__VLS_StyleScopedClasses['column-time-series']} */ ;
/** @type {__VLS_StyleScopedClasses['ts-stats-card']} */ ;
/** @type {__VLS_StyleScopedClasses['ts-stats']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-container']} */ ;
/** @type {__VLS_StyleScopedClasses['prediction-result']} */ ;
/** @type {__VLS_StyleScopedClasses['prediction-info']} */ ;
/** @type {__VLS_StyleScopedClasses['model-info']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-container']} */ ;
/** @type {__VLS_StyleScopedClasses['result-data']} */ ;
/** @type {__VLS_StyleScopedClasses['no-result']} */ ;
/** @type {__VLS_StyleScopedClasses['result-report']} */ ;
/** @type {__VLS_StyleScopedClasses['markdown-content']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            AnalysisChatList: AnalysisChatList,
            icon_sidebar_outlined: icon_sidebar_outlined,
            icon_new_chat_outlined: icon_new_chat_outlined,
            sidebarVisible: sidebarVisible,
            currentChatId: currentChatId,
            currentChat: currentChat,
            isLoadingChat: isLoadingChat,
            hideSidebar: hideSidebar,
            showSidebar: showSidebar,
            createNewAnalysis: createNewAnalysis,
            onChatCreated: onChatCreated,
            onChatHistory: onChatHistory,
            chatMessages: chatMessages,
            chatInput: chatInput,
            dataSourceForm: dataSourceForm,
            datasources: datasources,
            tables: tables,
            dataPreview: dataPreview,
            dataColumns: dataColumns,
            analysisSuggestions: analysisSuggestions,
            analysisResult: analysisResult,
            analysisResults: analysisResults,
            resultDialogVisible: resultDialogVisible,
            selectedAnalysisResult: selectedAnalysisResult,
            basicStatsResult: basicStatsResult,
            analysisTypes: analysisTypes,
            analysisForm: analysisForm,
            generatedRequirement: generatedRequirement,
            isAnalyzing: isAnalyzing,
            activeTab: activeTab,
            resultTab: resultTab,
            isLoadingBasicStats: isLoadingBasicStats,
            isLoadingAnalysisTypes: isLoadingAnalysisTypes,
            isGeneratingRequirement: isGeneratingRequirement,
            loadTables: loadTables,
            loadDataPreview: loadDataPreview,
            useSuggestion: useSuggestion,
            sendMessage: sendMessage,
            openResultDialog: openResultDialog,
            currentAnalysisType: currentAnalysisType,
            filteredColumns: filteredColumns,
            handleAnalysisTypeChange: handleAnalysisTypeChange,
            getBasicStats: getBasicStats,
            generateRequirement: generateRequirement,
            useGeneratedRequirement: useGeneratedRequirement,
            renderMarkdown: renderMarkdown,
            isCorrelationAnalysis: isCorrelationAnalysis,
            parsedAnalysisResult: parsedAnalysisResult,
            selectedResultParsed: selectedResultParsed,
            selectedCorrelationMatrixData: selectedCorrelationMatrixData,
            selectedCorrelationColumns: selectedCorrelationColumns,
            isDescriptiveAnalysis: isDescriptiveAnalysis,
            isDistributionAnalysis: isDistributionAnalysis,
            isAnomalyAnalysis: isAnomalyAnalysis,
            isTrendAnalysis: isTrendAnalysis,
            isTimeSeriesAnalysis: isTimeSeriesAnalysis,
            isPredictionAnalysis: isPredictionAnalysis,
            isClusteringAnalysis: isClusteringAnalysis,
            isRegressionAnalysis: isRegressionAnalysis,
            formatStatKey: formatStatKey,
            correlationMatrixData: correlationMatrixData,
            correlationColumns: correlationColumns,
            getCorrelationClass: getCorrelationClass,
        };
    },
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeProps: {},
});
; /* PartiallyEnd: #4569/main.vue */
