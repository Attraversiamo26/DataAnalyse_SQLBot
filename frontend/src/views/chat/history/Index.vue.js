import { ref, computed, onMounted, reactive } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { chatApi } from '@/api/chat';
import { Refresh, Search } from '@element-plus/icons-vue';
const loading = ref(false);
const sessions = ref([]);
const total = ref(0);
const filterTool = ref('');
const dateRange = ref(null);
const searchKeyword = ref('');
const state = reactive({
    tableData: [],
    pageInfo: {
        currentPage: 1,
        pageSize: 20,
        total: 0,
    },
});
const filteredSessions = computed(() => {
    let result = [...sessions.value];
    // 按工具类型筛选
    if (filterTool.value) {
        result = result.filter(session => session.tool === filterTool.value);
    }
    // 按日期范围筛选
    if (dateRange.value) {
        const startDate = dateRange.value[0].getTime();
        const endDate = dateRange.value[1].getTime();
        result = result.filter(session => {
            const createTime = new Date(session.create_time).getTime();
            return createTime >= startDate && createTime <= endDate;
        });
    }
    // 按关键词搜索
    if (searchKeyword.value) {
        const keyword = searchKeyword.value.toLowerCase();
        result = result.filter(session => session.question.toLowerCase().includes(keyword) ||
            (session.result && session.result.toLowerCase().includes(keyword)) ||
            (session.datasource_name && session.datasource_name.toLowerCase().includes(keyword)));
    }
    return result;
});
const loadSessions = async () => {
    loading.value = true;
    try {
        // 首先获取所有聊天会话
        const chatListResponse = await chatApi.list();
        console.log('Chat list response:', chatListResponse);
        // 为每个聊天会话获取完整的详细信息（包含records）
        const chatInfos = [];
        for (const chat of chatListResponse) {
            if (chat.id) {
                try {
                    const chatInfo = await chatApi.get(chat.id);
                    console.log('Chat info:', chatInfo);
                    chatInfos.push(chatInfo);
                }
                catch (error) {
                    console.error(`获取会话 ${chat.id} 详情失败:`, error);
                }
            }
        }
        // 转换为表格需要的格式
        const records = [];
        chatInfos.forEach(chatInfo => {
            chatInfo.records.forEach((record) => {
                // 只显示非首次对话且已完成的记录（有结果数据的记录）
                if (!record.first_chat && record.finish_time) {
                    // 获取返回结果
                    let result = '';
                    // 根据 chatInfo.chat_type 来区分会话类型
                    const toolType = chatInfo.chat_type === 'analysis' ? 'analysis' : 'chat';
                    if (toolType === 'analysis') {
                        // 数据分析 - 同时显示分析报告和分析数据摘要
                        const parts = [];
                        // 添加分析报告
                        if (record.analysis) {
                            try {
                                const analysisObj = typeof record.analysis === 'string' ? JSON.parse(record.analysis) : record.analysis;
                                const reportContent = analysisObj.content || analysisObj.report || '';
                                if (reportContent) {
                                    parts.push(`报告: ${reportContent.substring(0, 150)}${reportContent.length > 150 ? '...' : ''}`);
                                }
                            }
                            catch (e) {
                                const analysisStr = typeof record.analysis === 'string' ? record.analysis : JSON.stringify(record.analysis);
                                parts.push(`报告: ${analysisStr.substring(0, 150)}${analysisStr.length > 150 ? '...' : ''}`);
                            }
                        }
                        // 添加分析数据摘要
                        if (record.data) {
                            try {
                                const dataObj = typeof record.data === 'string' ? JSON.parse(record.data) : record.data;
                                // 提取关键信息作为摘要
                                let dataSummary = '';
                                if (dataObj.analysis_type) {
                                    dataSummary += `分析类型: ${dataObj.analysis_type}`;
                                }
                                if (dataObj.columns && Array.isArray(dataObj.columns)) {
                                    dataSummary += `, 列: ${dataObj.columns.join(', ')}`;
                                }
                                if (!dataSummary) {
                                    // 如果没有结构化数据，显示数据长度
                                    dataSummary = `数据长度: ${record.data.length} 字符`;
                                }
                                parts.push(dataSummary);
                            }
                            catch (e) {
                                parts.push(`数据长度: ${record.data.length} 字符`);
                            }
                        }
                        result = parts.length > 0 ? parts.join(' | ') : '失败';
                    }
                    else {
                        // 智能问数 - 只显示有数据的记录
                        let hasData = false;
                        if (record.data) {
                            // 后端修改后，record.data 是对象，表格数据在 record.data.data 中
                            if (typeof record.data === 'object') {
                                if (Array.isArray(record.data.data) && record.data.data.length > 0) {
                                    hasData = true;
                                }
                                else if (Array.isArray(record.data) && record.data.length > 0) {
                                    // 兼容旧格式
                                    hasData = true;
                                }
                            }
                        }
                        if (hasData) {
                            result = '查询成功';
                        }
                        else if (record.sql_answer) {
                            result = record.sql_answer.substring(0, 100) + (record.sql_answer.length > 100 ? '...' : '');
                        }
                        else if (record.chart_answer) {
                            result = record.chart_answer.substring(0, 100) + (record.chart_answer.length > 100 ? '...' : '');
                        }
                        else {
                            return; // 跳过没有结果的记录
                        }
                    }
                    const sessionData = {
                        id: record.id,
                        chat_id: chatInfo.id,
                        tool: toolType,
                        question: record.question,
                        result: result,
                        create_time: record.create_time,
                        finish_time: record.finish_time,
                        datasource_name: chatInfo.datasource_name,
                        status: 'completed'
                    };
                    console.log('Session data:', sessionData);
                    records.push(sessionData);
                }
            });
        });
        sessions.value = records;
        state.tableData = records;
        total.value = records.length;
        state.pageInfo.total = records.length;
    }
    catch (error) {
        ElMessage.error('获取会话记录失败');
        console.error('Error loading sessions:', error);
    }
    finally {
        loading.value = false;
    }
};
const refreshSessions = () => {
    state.pageInfo.currentPage = 1;
    loadSessions();
};
const handleSearch = () => {
    state.pageInfo.currentPage = 1;
    loadSessions();
};
// 查看会话结果
const selectedSession = ref(null);
const showResultDialog = ref(false);
const viewSession = async (session) => {
    try {
        console.log('Viewing session:', session);
        // 加载会话的详细信息
        const chatInfo = await chatApi.get(session.chat_id);
        console.log('Chat info:', chatInfo);
        if (chatInfo) {
            // 找到对应的记录
            console.log('Looking for record with id:', session.id);
            console.log('Available records:', chatInfo.records.map((r) => r.id));
            const record = chatInfo.records.find((r) => r.id === session.id);
            console.log('Found record:', record);
            if (record) {
                // 准备结果数据
                let resultData = {};
                let resultType = 'text';
                if (record.analysis_record_id) {
                    // 数据分析
                    let charts = {};
                    let rawData = {};
                    let correlationColumns = [];
                    // 后端已解析并格式化数据，直接使用
                    if (record.data && typeof record.data === 'object') {
                        // 提取图表
                        if (record.data.charts && typeof record.data.charts === 'object') {
                            charts = record.data.charts;
                        }
                        // 提取原始分析数据（用于展示表格）
                        rawData = record.data;
                        // 提取相关性矩阵的列名
                        if (record.data.correlation_matrix && Array.isArray(record.data.correlation_matrix) && record.data.correlation_matrix.length > 0) {
                            correlationColumns = Object.keys(record.data.correlation_matrix[0]);
                        }
                    }
                    if (record.analysis) {
                        // 分析报告已经被后端处理为内容字符串或JSON对象
                        if (typeof record.analysis === 'string') {
                            // 如果是字符串，尝试解析为JSON
                            try {
                                const analysisObj = JSON.parse(record.analysis);
                                resultData = { content: analysisObj.content || analysisObj.report || '' };
                            }
                            catch (e) {
                                // 如果不是JSON，直接作为内容
                                resultData = { content: record.analysis };
                            }
                        }
                        else if (typeof record.analysis === 'object' && record.analysis.content) {
                            resultData = { content: record.analysis.content };
                        }
                        else {
                            resultData = { content: record.analysis };
                        }
                        resultType = 'analysis';
                    }
                    else if (record.data) {
                        resultData = { content: JSON.stringify(record.data, null, 2) };
                        resultType = 'text';
                    }
                    selectedSession.value = {
                        ...session,
                        record: record,
                        resultData: resultData,
                        resultType: resultType,
                        charts: charts,
                        rawData: rawData,
                        correlationColumns: correlationColumns
                    };
                    showResultDialog.value = true;
                    return;
                }
                else {
                    // 智能问数
                    if (record.data) {
                        try {
                            // 后端已格式化数据，智能问数的数据在 record.data.data 中
                            const dataObj = typeof record.data === 'string' ? JSON.parse(record.data) : record.data;
                            // 如果是对象且包含 data 数组，使用 data 数组作为表格数据
                            if (dataObj && typeof dataObj === 'object' && Array.isArray(dataObj.data)) {
                                resultData = dataObj.data;
                            }
                            else if (Array.isArray(dataObj)) {
                                // 兼容旧格式
                                resultData = dataObj;
                            }
                            else {
                                resultData = { content: JSON.stringify(dataObj, null, 2) };
                                resultType = 'text';
                                showResultDialog.value = true;
                                return;
                            }
                            resultType = 'table';
                        }
                        catch (e) {
                            resultData = { content: record.data };
                            resultType = 'text';
                        }
                    }
                    else if (record.sql_answer) {
                        resultData = { content: record.sql_answer };
                        resultType = 'text';
                    }
                    else if (record.chart_answer) {
                        resultData = { content: record.chart_answer };
                        resultType = 'text';
                    }
                }
                selectedSession.value = {
                    ...session,
                    record: record,
                    resultData: resultData,
                    resultType: resultType
                };
                showResultDialog.value = true;
            }
            else {
                console.error('Record not found:', session.id);
                ElMessage.error('找不到对应的会话记录');
            }
        }
    }
    catch (error) {
        console.error('Failed to load session details:', error);
        ElMessage.error('加载会话详情失败');
    }
};
const deleteSession = (id) => {
    ElMessageBox.confirm('确定要删除这个会话记录吗？', '删除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(async () => {
        try {
            // 这里应该调用后端API删除会话记录
            // await chatApi.deleteRecord(id)
            sessions.value = sessions.value.filter(session => session.id !== id);
            state.tableData = sessions.value;
            total.value = sessions.value.length;
            state.pageInfo.total = sessions.value.length;
            ElMessage.success('删除成功');
        }
        catch (error) {
            ElMessage.error('删除失败');
            console.error('Error deleting session:', error);
        }
    });
};
const handleSizeChange = (size) => {
    state.pageInfo.pageSize = size;
    state.pageInfo.currentPage = 1;
    loadSessions();
};
const handleCurrentChange = (current) => {
    state.pageInfo.currentPage = current;
    loadSessions();
};
// 统计有结果数据的会话
const countSessionsWithResults = () => {
    const sessionsWithResults = sessions.value.filter(session => session.result && session.result !== '失败');
    console.log(`有结果数据的会话数量: ${sessionsWithResults.length}`);
    console.log('会话ID列表:', sessionsWithResults.map(session => session.id));
    ElMessage.success(`有结果数据的会话数量: ${sessionsWithResults.length}\n会话ID: ${sessionsWithResults.map(session => session.id).join(', ')}`);
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
onMounted(() => {
    loadSessions();
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "sqlbot-table-container professional-container" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "tool-left" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "page-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "search-bar" },
});
const __VLS_0 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onKeydown': {} },
    modelValue: (__VLS_ctx.searchKeyword),
    ...{ style: {} },
    placeholder: "搜索会话内容",
    clearable: true,
}));
const __VLS_2 = __VLS_1({
    ...{ 'onKeydown': {} },
    modelValue: (__VLS_ctx.searchKeyword),
    ...{ style: {} },
    placeholder: "搜索会话内容",
    clearable: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onKeydown: (__VLS_ctx.handleSearch)
};
__VLS_3.slots.default;
{
    const { prefix: __VLS_thisSlot } = __VLS_3.slots;
    const __VLS_8 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({}));
    const __VLS_10 = __VLS_9({}, ...__VLS_functionalComponentArgsRest(__VLS_9));
    __VLS_11.slots.default;
    const __VLS_12 = {}.Search;
    /** @type {[typeof __VLS_components.Search, ]} */ ;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({}));
    const __VLS_14 = __VLS_13({}, ...__VLS_functionalComponentArgsRest(__VLS_13));
    var __VLS_11;
}
var __VLS_3;
const __VLS_16 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    modelValue: (__VLS_ctx.filterTool),
    placeholder: "按工具类型筛选",
    ...{ style: {} },
}));
const __VLS_18 = __VLS_17({
    modelValue: (__VLS_ctx.filterTool),
    placeholder: "按工具类型筛选",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
__VLS_19.slots.default;
const __VLS_20 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    label: "全部",
    value: "",
}));
const __VLS_22 = __VLS_21({
    label: "全部",
    value: "",
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
const __VLS_24 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    label: "智能问数",
    value: "chat",
}));
const __VLS_26 = __VLS_25({
    label: "智能问数",
    value: "chat",
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
const __VLS_28 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
    label: "数据分析",
    value: "analysis",
}));
const __VLS_30 = __VLS_29({
    label: "数据分析",
    value: "analysis",
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
var __VLS_19;
const __VLS_32 = {}.ElDatePicker;
/** @type {[typeof __VLS_components.ElDatePicker, typeof __VLS_components.elDatePicker, ]} */ ;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
    modelValue: (__VLS_ctx.dateRange),
    type: "daterange",
    rangeSeparator: "至",
    startPlaceholder: "开始日期",
    endPlaceholder: "结束日期",
    ...{ style: {} },
}));
const __VLS_34 = __VLS_33({
    modelValue: (__VLS_ctx.dateRange),
    type: "daterange",
    rangeSeparator: "至",
    startPlaceholder: "开始日期",
    endPlaceholder: "结束日期",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
const __VLS_36 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_38 = __VLS_37({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_37));
let __VLS_40;
let __VLS_41;
let __VLS_42;
const __VLS_43 = {
    onClick: (__VLS_ctx.refreshSessions)
};
__VLS_39.slots.default;
{
    const { icon: __VLS_thisSlot } = __VLS_39.slots;
    const __VLS_44 = {}.Refresh;
    /** @type {[typeof __VLS_components.Refresh, ]} */ ;
    // @ts-ignore
    const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({}));
    const __VLS_46 = __VLS_45({}, ...__VLS_functionalComponentArgsRest(__VLS_45));
}
var __VLS_39;
const __VLS_48 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
    ...{ 'onClick': {} },
    type: "info",
}));
const __VLS_50 = __VLS_49({
    ...{ 'onClick': {} },
    type: "info",
}, ...__VLS_functionalComponentArgsRest(__VLS_49));
let __VLS_52;
let __VLS_53;
let __VLS_54;
const __VLS_55 = {
    onClick: (__VLS_ctx.countSessionsWithResults)
};
__VLS_51.slots.default;
var __VLS_51;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "sqlbot-table_session" },
});
const __VLS_56 = {}.ElTable;
/** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
// @ts-ignore
const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
    data: (__VLS_ctx.filteredSessions),
    ...{ style: {} },
    border: true,
    defaultSort: ({ prop: 'create_time', order: 'descending' }),
    headerCellStyle: ({ background: '#f5f7fa' }),
    cellStyle: ({ padding: '8px 12px' }),
}));
const __VLS_58 = __VLS_57({
    data: (__VLS_ctx.filteredSessions),
    ...{ style: {} },
    border: true,
    defaultSort: ({ prop: 'create_time', order: 'descending' }),
    headerCellStyle: ({ background: '#f5f7fa' }),
    cellStyle: ({ padding: '8px 12px' }),
}, ...__VLS_functionalComponentArgsRest(__VLS_57));
__VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loading) }, null, null);
__VLS_59.slots.default;
const __VLS_60 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
    prop: "id",
    label: "会话ID",
    width: "120",
}));
const __VLS_62 = __VLS_61({
    prop: "id",
    label: "会话ID",
    width: "120",
}, ...__VLS_functionalComponentArgsRest(__VLS_61));
const __VLS_64 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
    prop: "tool",
    label: "工具类型",
    width: "100",
}));
const __VLS_66 = __VLS_65({
    prop: "tool",
    label: "工具类型",
    width: "100",
}, ...__VLS_functionalComponentArgsRest(__VLS_65));
__VLS_67.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_67.slots;
    const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_68 = {}.ElTag;
    /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
    // @ts-ignore
    const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
        type: (scope.row.tool === 'chat' ? 'success' : 'primary'),
    }));
    const __VLS_70 = __VLS_69({
        type: (scope.row.tool === 'chat' ? 'success' : 'primary'),
    }, ...__VLS_functionalComponentArgsRest(__VLS_69));
    __VLS_71.slots.default;
    (scope.row.tool === 'chat' ? '智能问数' : '数据分析');
    var __VLS_71;
}
var __VLS_67;
const __VLS_72 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
    prop: "question",
    label: "问题",
    minWidth: "300",
    showOverflowTooltip: true,
}));
const __VLS_74 = __VLS_73({
    prop: "question",
    label: "问题",
    minWidth: "300",
    showOverflowTooltip: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_73));
const __VLS_76 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
    prop: "create_time",
    label: "创建时间",
    width: "180",
}));
const __VLS_78 = __VLS_77({
    prop: "create_time",
    label: "创建时间",
    width: "180",
}, ...__VLS_functionalComponentArgsRest(__VLS_77));
const __VLS_80 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
    prop: "finish_time",
    label: "结束时间",
    width: "180",
}));
const __VLS_82 = __VLS_81({
    prop: "finish_time",
    label: "结束时间",
    width: "180",
}, ...__VLS_functionalComponentArgsRest(__VLS_81));
const __VLS_84 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({
    prop: "datasource_name",
    label: "数据源",
    width: "150",
}));
const __VLS_86 = __VLS_85({
    prop: "datasource_name",
    label: "数据源",
    width: "150",
}, ...__VLS_functionalComponentArgsRest(__VLS_85));
const __VLS_88 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({
    prop: "status",
    label: "状态",
    width: "100",
}));
const __VLS_90 = __VLS_89({
    prop: "status",
    label: "状态",
    width: "100",
}, ...__VLS_functionalComponentArgsRest(__VLS_89));
__VLS_91.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_91.slots;
    const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_92 = {}.ElTag;
    /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
    // @ts-ignore
    const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({
        type: (scope.row.status === 'completed' ? 'success' : 'warning'),
    }));
    const __VLS_94 = __VLS_93({
        type: (scope.row.status === 'completed' ? 'success' : 'warning'),
    }, ...__VLS_functionalComponentArgsRest(__VLS_93));
    __VLS_95.slots.default;
    (scope.row.status === 'completed' ? '已完成' : '处理中');
    var __VLS_95;
}
var __VLS_91;
const __VLS_96 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_97 = __VLS_asFunctionalComponent(__VLS_96, new __VLS_96({
    label: "返回结果",
    minWidth: "200",
    showOverflowTooltip: true,
}));
const __VLS_98 = __VLS_97({
    label: "返回结果",
    minWidth: "200",
    showOverflowTooltip: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_97));
__VLS_99.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_99.slots;
    const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
    if (scope.row.result) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "result-content" },
        });
        (scope.row.result);
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "result-failed" },
        });
    }
}
var __VLS_99;
const __VLS_100 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({
    label: "操作",
    width: "200",
    fixed: "right",
}));
const __VLS_102 = __VLS_101({
    label: "操作",
    width: "200",
    fixed: "right",
}, ...__VLS_functionalComponentArgsRest(__VLS_101));
__VLS_103.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_103.slots;
    const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "table-operate" },
    });
    const __VLS_104 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_105 = __VLS_asFunctionalComponent(__VLS_104, new __VLS_104({
        ...{ 'onClick': {} },
        type: "primary",
        size: "small",
    }));
    const __VLS_106 = __VLS_105({
        ...{ 'onClick': {} },
        type: "primary",
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_105));
    let __VLS_108;
    let __VLS_109;
    let __VLS_110;
    const __VLS_111 = {
        onClick: (...[$event]) => {
            __VLS_ctx.viewSession(scope.row);
        }
    };
    __VLS_107.slots.default;
    var __VLS_107;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "line" },
    });
    const __VLS_112 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_113 = __VLS_asFunctionalComponent(__VLS_112, new __VLS_112({
        ...{ 'onClick': {} },
        type: "danger",
        size: "small",
    }));
    const __VLS_114 = __VLS_113({
        ...{ 'onClick': {} },
        type: "danger",
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_113));
    let __VLS_116;
    let __VLS_117;
    let __VLS_118;
    const __VLS_119 = {
        onClick: (...[$event]) => {
            __VLS_ctx.deleteSession(scope.row.id);
        }
    };
    __VLS_115.slots.default;
    var __VLS_115;
}
var __VLS_103;
var __VLS_59;
if (__VLS_ctx.state.tableData.length) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "pagination-container" },
    });
    const __VLS_120 = {}.ElPagination;
    /** @type {[typeof __VLS_components.ElPagination, typeof __VLS_components.elPagination, ]} */ ;
    // @ts-ignore
    const __VLS_121 = __VLS_asFunctionalComponent(__VLS_120, new __VLS_120({
        ...{ 'onSizeChange': {} },
        ...{ 'onCurrentChange': {} },
        currentPage: (__VLS_ctx.state.pageInfo.currentPage),
        pageSize: (__VLS_ctx.state.pageInfo.pageSize),
        pageSizes: ([10, 20, 30]),
        background: (true),
        layout: "total, sizes, prev, pager, next, jumper",
        total: (__VLS_ctx.total),
    }));
    const __VLS_122 = __VLS_121({
        ...{ 'onSizeChange': {} },
        ...{ 'onCurrentChange': {} },
        currentPage: (__VLS_ctx.state.pageInfo.currentPage),
        pageSize: (__VLS_ctx.state.pageInfo.pageSize),
        pageSizes: ([10, 20, 30]),
        background: (true),
        layout: "total, sizes, prev, pager, next, jumper",
        total: (__VLS_ctx.total),
    }, ...__VLS_functionalComponentArgsRest(__VLS_121));
    let __VLS_124;
    let __VLS_125;
    let __VLS_126;
    const __VLS_127 = {
        onSizeChange: (__VLS_ctx.handleSizeChange)
    };
    const __VLS_128 = {
        onCurrentChange: (__VLS_ctx.handleCurrentChange)
    };
    var __VLS_123;
}
const __VLS_129 = {}.ElDialog;
/** @type {[typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ]} */ ;
// @ts-ignore
const __VLS_130 = __VLS_asFunctionalComponent(__VLS_129, new __VLS_129({
    modelValue: (__VLS_ctx.showResultDialog),
    title: (`查看会话结果 - ${__VLS_ctx.selectedSession?.tool === 'chat' ? '智能问数' : '数据分析'}`),
    width: "80%",
    destroyOnClose: true,
}));
const __VLS_131 = __VLS_130({
    modelValue: (__VLS_ctx.showResultDialog),
    title: (`查看会话结果 - ${__VLS_ctx.selectedSession?.tool === 'chat' ? '智能问数' : '数据分析'}`),
    width: "80%",
    destroyOnClose: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_130));
__VLS_132.slots.default;
if (__VLS_ctx.selectedSession) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "dialog-section" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    const __VLS_133 = {}.ElDescriptions;
    /** @type {[typeof __VLS_components.ElDescriptions, typeof __VLS_components.elDescriptions, typeof __VLS_components.ElDescriptions, typeof __VLS_components.elDescriptions, ]} */ ;
    // @ts-ignore
    const __VLS_134 = __VLS_asFunctionalComponent(__VLS_133, new __VLS_133({
        column: (2),
        border: true,
    }));
    const __VLS_135 = __VLS_134({
        column: (2),
        border: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_134));
    __VLS_136.slots.default;
    const __VLS_137 = {}.ElDescriptionsItem;
    /** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
    // @ts-ignore
    const __VLS_138 = __VLS_asFunctionalComponent(__VLS_137, new __VLS_137({
        label: "会话ID",
    }));
    const __VLS_139 = __VLS_138({
        label: "会话ID",
    }, ...__VLS_functionalComponentArgsRest(__VLS_138));
    __VLS_140.slots.default;
    (__VLS_ctx.selectedSession.id);
    var __VLS_140;
    const __VLS_141 = {}.ElDescriptionsItem;
    /** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
    // @ts-ignore
    const __VLS_142 = __VLS_asFunctionalComponent(__VLS_141, new __VLS_141({
        label: "工具类型",
    }));
    const __VLS_143 = __VLS_142({
        label: "工具类型",
    }, ...__VLS_functionalComponentArgsRest(__VLS_142));
    __VLS_144.slots.default;
    (__VLS_ctx.selectedSession.tool === 'chat' ? '智能问数' : '数据分析');
    var __VLS_144;
    const __VLS_145 = {}.ElDescriptionsItem;
    /** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
    // @ts-ignore
    const __VLS_146 = __VLS_asFunctionalComponent(__VLS_145, new __VLS_145({
        label: "问题",
    }));
    const __VLS_147 = __VLS_146({
        label: "问题",
    }, ...__VLS_functionalComponentArgsRest(__VLS_146));
    __VLS_148.slots.default;
    (__VLS_ctx.selectedSession.question);
    var __VLS_148;
    const __VLS_149 = {}.ElDescriptionsItem;
    /** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
    // @ts-ignore
    const __VLS_150 = __VLS_asFunctionalComponent(__VLS_149, new __VLS_149({
        label: "创建时间",
    }));
    const __VLS_151 = __VLS_150({
        label: "创建时间",
    }, ...__VLS_functionalComponentArgsRest(__VLS_150));
    __VLS_152.slots.default;
    (__VLS_ctx.selectedSession.create_time);
    var __VLS_152;
    const __VLS_153 = {}.ElDescriptionsItem;
    /** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
    // @ts-ignore
    const __VLS_154 = __VLS_asFunctionalComponent(__VLS_153, new __VLS_153({
        label: "结束时间",
        span: (2),
    }));
    const __VLS_155 = __VLS_154({
        label: "结束时间",
        span: (2),
    }, ...__VLS_functionalComponentArgsRest(__VLS_154));
    __VLS_156.slots.default;
    (__VLS_ctx.selectedSession.finish_time || '未完成');
    var __VLS_156;
    var __VLS_136;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "dialog-section" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    if (__VLS_ctx.selectedSession.resultType === 'table' && __VLS_ctx.selectedSession.resultData && Array.isArray(__VLS_ctx.selectedSession.resultData)) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        const __VLS_157 = {}.ElTable;
        /** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
        // @ts-ignore
        const __VLS_158 = __VLS_asFunctionalComponent(__VLS_157, new __VLS_157({
            data: (__VLS_ctx.selectedSession.resultData),
            ...{ style: {} },
            border: true,
        }));
        const __VLS_159 = __VLS_158({
            data: (__VLS_ctx.selectedSession.resultData),
            ...{ style: {} },
            border: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_158));
        __VLS_160.slots.default;
        for (const [_, key] of __VLS_getVForSourceType((__VLS_ctx.selectedSession.resultData[0]))) {
            const __VLS_161 = {}.ElTableColumn;
            /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
            // @ts-ignore
            const __VLS_162 = __VLS_asFunctionalComponent(__VLS_161, new __VLS_161({
                key: (key),
                prop: (key),
                label: (key),
            }));
            const __VLS_163 = __VLS_162({
                key: (key),
                prop: (key),
                label: (key),
            }, ...__VLS_functionalComponentArgsRest(__VLS_162));
        }
        var __VLS_160;
    }
    else if (__VLS_ctx.selectedSession.resultType === 'analysis') {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        if (__VLS_ctx.selectedSession.rawData) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "analysis-data" },
            });
            if (__VLS_ctx.selectedSession.rawData.correlation_matrix) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "correlation-result" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
                const __VLS_165 = {}.ElTable;
                /** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
                // @ts-ignore
                const __VLS_166 = __VLS_asFunctionalComponent(__VLS_165, new __VLS_165({
                    data: (__VLS_ctx.selectedSession.rawData.correlation_matrix),
                    border: true,
                }));
                const __VLS_167 = __VLS_166({
                    data: (__VLS_ctx.selectedSession.rawData.correlation_matrix),
                    border: true,
                }, ...__VLS_functionalComponentArgsRest(__VLS_166));
                __VLS_168.slots.default;
                const __VLS_169 = {}.ElTableColumn;
                /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
                // @ts-ignore
                const __VLS_170 = __VLS_asFunctionalComponent(__VLS_169, new __VLS_169({
                    prop: "column",
                    label: "列名",
                    width: "120",
                }));
                const __VLS_171 = __VLS_170({
                    prop: "column",
                    label: "列名",
                    width: "120",
                }, ...__VLS_functionalComponentArgsRest(__VLS_170));
                for (const [col] of __VLS_getVForSourceType((__VLS_ctx.selectedSession.correlationColumns))) {
                    const __VLS_173 = {}.ElTableColumn;
                    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
                    // @ts-ignore
                    const __VLS_174 = __VLS_asFunctionalComponent(__VLS_173, new __VLS_173({
                        key: (col),
                        prop: (col),
                        label: (col),
                    }));
                    const __VLS_175 = __VLS_174({
                        key: (col),
                        prop: (col),
                        label: (col),
                    }, ...__VLS_functionalComponentArgsRest(__VLS_174));
                }
                var __VLS_168;
                if (__VLS_ctx.selectedSession.rawData.charts && __VLS_ctx.selectedSession.rawData.charts.correlation_matrix) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                        ...{ class: "chart-container" },
                    });
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
                        src: (__VLS_ctx.selectedSession.rawData.charts.correlation_matrix),
                        alt: "相关性矩阵热力图",
                        ...{ style: {} },
                    });
                }
            }
            if (__VLS_ctx.selectedSession.rawData.stats) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "descriptive-result" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
                for (const [stats, column] of __VLS_getVForSourceType((__VLS_ctx.selectedSession.rawData.stats))) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                        key: (column),
                    });
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.h5, __VLS_intrinsicElements.h5)({});
                    (column);
                    const __VLS_177 = {}.ElTable;
                    /** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
                    // @ts-ignore
                    const __VLS_178 = __VLS_asFunctionalComponent(__VLS_177, new __VLS_177({
                        data: ([stats]),
                        border: true,
                    }));
                    const __VLS_179 = __VLS_178({
                        data: ([stats]),
                        border: true,
                    }, ...__VLS_functionalComponentArgsRest(__VLS_178));
                    __VLS_180.slots.default;
                    for (const [_, key] of __VLS_getVForSourceType((stats))) {
                        const __VLS_181 = {}.ElTableColumn;
                        /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
                        // @ts-ignore
                        const __VLS_182 = __VLS_asFunctionalComponent(__VLS_181, new __VLS_181({
                            key: (key),
                            prop: (key),
                            label: (key),
                        }));
                        const __VLS_183 = __VLS_182({
                            key: (key),
                            prop: (key),
                            label: (key),
                        }, ...__VLS_functionalComponentArgsRest(__VLS_182));
                    }
                    var __VLS_180;
                    if (__VLS_ctx.selectedSession.rawData.charts && __VLS_ctx.selectedSession.rawData.charts[column]) {
                        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                            ...{ class: "chart-container" },
                        });
                        __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
                            src: (__VLS_ctx.selectedSession.rawData.charts[column]),
                            alt: (`${column}统计图表`),
                            ...{ style: {} },
                        });
                    }
                }
            }
            if (__VLS_ctx.selectedSession.rawData.clusters) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "clusters-result" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
                if (__VLS_ctx.selectedSession.rawData.clusters.centers) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.h5, __VLS_intrinsicElements.h5)({});
                    const __VLS_185 = {}.ElTable;
                    /** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
                    // @ts-ignore
                    const __VLS_186 = __VLS_asFunctionalComponent(__VLS_185, new __VLS_185({
                        data: (__VLS_ctx.selectedSession.rawData.clusters.centers),
                        border: true,
                    }));
                    const __VLS_187 = __VLS_186({
                        data: (__VLS_ctx.selectedSession.rawData.clusters.centers),
                        border: true,
                    }, ...__VLS_functionalComponentArgsRest(__VLS_186));
                    __VLS_188.slots.default;
                    for (const [key] of __VLS_getVForSourceType((Object.keys(__VLS_ctx.selectedSession.rawData.clusters.centers[0] || {})))) {
                        const __VLS_189 = {}.ElTableColumn;
                        /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
                        // @ts-ignore
                        const __VLS_190 = __VLS_asFunctionalComponent(__VLS_189, new __VLS_189({
                            key: (key),
                            prop: (key),
                            label: (key),
                        }));
                        const __VLS_191 = __VLS_190({
                            key: (key),
                            prop: (key),
                            label: (key),
                        }, ...__VLS_functionalComponentArgsRest(__VLS_190));
                    }
                    var __VLS_188;
                }
                if (__VLS_ctx.selectedSession.rawData.clusters.counts) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.h5, __VLS_intrinsicElements.h5)({});
                    const __VLS_193 = {}.ElTable;
                    /** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
                    // @ts-ignore
                    const __VLS_194 = __VLS_asFunctionalComponent(__VLS_193, new __VLS_193({
                        data: (__VLS_ctx.selectedSession.rawData.clusters.counts),
                        border: true,
                    }));
                    const __VLS_195 = __VLS_194({
                        data: (__VLS_ctx.selectedSession.rawData.clusters.counts),
                        border: true,
                    }, ...__VLS_functionalComponentArgsRest(__VLS_194));
                    __VLS_196.slots.default;
                    const __VLS_197 = {}.ElTableColumn;
                    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
                    // @ts-ignore
                    const __VLS_198 = __VLS_asFunctionalComponent(__VLS_197, new __VLS_197({
                        prop: "cluster",
                        label: "簇",
                    }));
                    const __VLS_199 = __VLS_198({
                        prop: "cluster",
                        label: "簇",
                    }, ...__VLS_functionalComponentArgsRest(__VLS_198));
                    const __VLS_201 = {}.ElTableColumn;
                    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
                    // @ts-ignore
                    const __VLS_202 = __VLS_asFunctionalComponent(__VLS_201, new __VLS_201({
                        prop: "count",
                        label: "数量",
                    }));
                    const __VLS_203 = __VLS_202({
                        prop: "count",
                        label: "数量",
                    }, ...__VLS_functionalComponentArgsRest(__VLS_202));
                    const __VLS_205 = {}.ElTableColumn;
                    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
                    // @ts-ignore
                    const __VLS_206 = __VLS_asFunctionalComponent(__VLS_205, new __VLS_205({
                        prop: "percentage",
                        label: "占比",
                    }));
                    const __VLS_207 = __VLS_206({
                        prop: "percentage",
                        label: "占比",
                    }, ...__VLS_functionalComponentArgsRest(__VLS_206));
                    var __VLS_196;
                }
                if (__VLS_ctx.selectedSession.rawData.charts && __VLS_ctx.selectedSession.rawData.charts.cluster_plot) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
                        src: (__VLS_ctx.selectedSession.rawData.charts.cluster_plot),
                        alt: "聚类分布图",
                        ...{ style: {} },
                    });
                }
            }
            if (__VLS_ctx.selectedSession.rawData.regression) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "regression-result" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
                __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
                (__VLS_ctx.selectedSession.rawData.regression.mse);
                __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
                (__VLS_ctx.selectedSession.rawData.regression.r2_score);
                if (__VLS_ctx.selectedSession.rawData.regression.coefficients) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.h5, __VLS_intrinsicElements.h5)({});
                    const __VLS_209 = {}.ElTable;
                    /** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
                    // @ts-ignore
                    const __VLS_210 = __VLS_asFunctionalComponent(__VLS_209, new __VLS_209({
                        data: (__VLS_ctx.selectedSession.rawData.regression.coefficients),
                        border: true,
                    }));
                    const __VLS_211 = __VLS_210({
                        data: (__VLS_ctx.selectedSession.rawData.regression.coefficients),
                        border: true,
                    }, ...__VLS_functionalComponentArgsRest(__VLS_210));
                    __VLS_212.slots.default;
                    const __VLS_213 = {}.ElTableColumn;
                    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
                    // @ts-ignore
                    const __VLS_214 = __VLS_asFunctionalComponent(__VLS_213, new __VLS_213({
                        prop: "feature",
                        label: "特征",
                    }));
                    const __VLS_215 = __VLS_214({
                        prop: "feature",
                        label: "特征",
                    }, ...__VLS_functionalComponentArgsRest(__VLS_214));
                    const __VLS_217 = {}.ElTableColumn;
                    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
                    // @ts-ignore
                    const __VLS_218 = __VLS_asFunctionalComponent(__VLS_217, new __VLS_217({
                        prop: "coefficient",
                        label: "系数",
                    }));
                    const __VLS_219 = __VLS_218({
                        prop: "coefficient",
                        label: "系数",
                    }, ...__VLS_functionalComponentArgsRest(__VLS_218));
                    var __VLS_212;
                }
                if (__VLS_ctx.selectedSession.rawData.charts && __VLS_ctx.selectedSession.rawData.charts.regression_plot) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
                        src: (__VLS_ctx.selectedSession.rawData.charts.regression_plot),
                        alt: "回归拟合图",
                        ...{ style: {} },
                    });
                }
            }
            if (__VLS_ctx.selectedSession.rawData.anomalies) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "anomaly-result" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
                for (const [anomaly, colName] of __VLS_getVForSourceType((__VLS_ctx.selectedSession.rawData.anomalies))) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                        key: (colName),
                    });
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.h5, __VLS_intrinsicElements.h5)({});
                    (colName);
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
                    (anomaly.outlier_count);
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
                    (anomaly.lower_bound);
                    (anomaly.upper_bound);
                }
                if (__VLS_ctx.selectedSession.rawData.charts && __VLS_ctx.selectedSession.rawData.charts.anomaly_plot) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
                        src: (__VLS_ctx.selectedSession.rawData.charts.anomaly_plot),
                        alt: "异常检测图",
                        ...{ style: {} },
                    });
                }
            }
            if (__VLS_ctx.selectedSession.rawData.distributions) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "distribution-result" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
                for (const [dist, column] of __VLS_getVForSourceType((__VLS_ctx.selectedSession.rawData.distributions))) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                        key: (column),
                    });
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.h5, __VLS_intrinsicElements.h5)({});
                    (column);
                    if (dist.quantiles) {
                        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
                        __VLS_asFunctionalElement(__VLS_intrinsicElements.h6, __VLS_intrinsicElements.h6)({});
                        const __VLS_221 = {}.ElTable;
                        /** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
                        // @ts-ignore
                        const __VLS_222 = __VLS_asFunctionalComponent(__VLS_221, new __VLS_221({
                            data: ([dist.quantiles]),
                            border: true,
                        }));
                        const __VLS_223 = __VLS_222({
                            data: ([dist.quantiles]),
                            border: true,
                        }, ...__VLS_functionalComponentArgsRest(__VLS_222));
                        __VLS_224.slots.default;
                        for (const [_, key] of __VLS_getVForSourceType((dist.quantiles))) {
                            const __VLS_225 = {}.ElTableColumn;
                            /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
                            // @ts-ignore
                            const __VLS_226 = __VLS_asFunctionalComponent(__VLS_225, new __VLS_225({
                                key: (key),
                                prop: (key),
                                label: (`${key}分位数`),
                            }));
                            const __VLS_227 = __VLS_226({
                                key: (key),
                                prop: (key),
                                label: (`${key}分位数`),
                            }, ...__VLS_functionalComponentArgsRest(__VLS_226));
                        }
                        var __VLS_224;
                    }
                    if (__VLS_ctx.selectedSession.rawData.charts && __VLS_ctx.selectedSession.rawData.charts[column]) {
                        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
                        __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
                            src: (__VLS_ctx.selectedSession.rawData.charts[column]),
                            alt: (`${column}分布图`),
                            ...{ style: {} },
                        });
                    }
                }
            }
            if (__VLS_ctx.selectedSession.rawData.trends) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "trend-result" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
                if (__VLS_ctx.selectedSession.rawData.charts && __VLS_ctx.selectedSession.rawData.charts.trend_plot) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
                        src: (__VLS_ctx.selectedSession.rawData.charts.trend_plot),
                        alt: "趋势图",
                        ...{ style: {} },
                    });
                }
            }
            if (__VLS_ctx.selectedSession.rawData.time_series) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "timeseries-result" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
                __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
                (__VLS_ctx.selectedSession.rawData.time_series.mean);
                __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
                (__VLS_ctx.selectedSession.rawData.time_series.std);
                if (__VLS_ctx.selectedSession.rawData.charts && __VLS_ctx.selectedSession.rawData.charts.time_series_plot) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
                        src: (__VLS_ctx.selectedSession.rawData.charts.time_series_plot),
                        alt: "时间序列图",
                        ...{ style: {} },
                    });
                }
            }
        }
        if (__VLS_ctx.selectedSession.resultData.content) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "analysis-content" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "markdown-content" },
            });
            __VLS_asFunctionalDirective(__VLS_directives.vHtml)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.renderMarkdown(__VLS_ctx.selectedSession.resultData.content)) }, null, null);
        }
    }
    else if (__VLS_ctx.selectedSession.resultData.content) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "text-content" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.pre, __VLS_intrinsicElements.pre)({});
        (__VLS_ctx.selectedSession.resultData.content);
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "empty-content" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "no-result-text" },
        });
    }
}
var __VLS_132;
/** @type {__VLS_StyleScopedClasses['sqlbot-table-container']} */ ;
/** @type {__VLS_StyleScopedClasses['professional-container']} */ ;
/** @type {__VLS_StyleScopedClasses['tool-left']} */ ;
/** @type {__VLS_StyleScopedClasses['page-title']} */ ;
/** @type {__VLS_StyleScopedClasses['search-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['sqlbot-table_session']} */ ;
/** @type {__VLS_StyleScopedClasses['result-content']} */ ;
/** @type {__VLS_StyleScopedClasses['result-failed']} */ ;
/** @type {__VLS_StyleScopedClasses['table-operate']} */ ;
/** @type {__VLS_StyleScopedClasses['line']} */ ;
/** @type {__VLS_StyleScopedClasses['pagination-container']} */ ;
/** @type {__VLS_StyleScopedClasses['dialog-section']} */ ;
/** @type {__VLS_StyleScopedClasses['dialog-section']} */ ;
/** @type {__VLS_StyleScopedClasses['analysis-data']} */ ;
/** @type {__VLS_StyleScopedClasses['correlation-result']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-container']} */ ;
/** @type {__VLS_StyleScopedClasses['descriptive-result']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-container']} */ ;
/** @type {__VLS_StyleScopedClasses['clusters-result']} */ ;
/** @type {__VLS_StyleScopedClasses['regression-result']} */ ;
/** @type {__VLS_StyleScopedClasses['anomaly-result']} */ ;
/** @type {__VLS_StyleScopedClasses['distribution-result']} */ ;
/** @type {__VLS_StyleScopedClasses['trend-result']} */ ;
/** @type {__VLS_StyleScopedClasses['timeseries-result']} */ ;
/** @type {__VLS_StyleScopedClasses['analysis-content']} */ ;
/** @type {__VLS_StyleScopedClasses['markdown-content']} */ ;
/** @type {__VLS_StyleScopedClasses['text-content']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-content']} */ ;
/** @type {__VLS_StyleScopedClasses['no-result-text']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            Refresh: Refresh,
            Search: Search,
            loading: loading,
            total: total,
            filterTool: filterTool,
            dateRange: dateRange,
            searchKeyword: searchKeyword,
            state: state,
            filteredSessions: filteredSessions,
            refreshSessions: refreshSessions,
            handleSearch: handleSearch,
            selectedSession: selectedSession,
            showResultDialog: showResultDialog,
            viewSession: viewSession,
            deleteSession: deleteSession,
            handleSizeChange: handleSizeChange,
            handleCurrentChange: handleCurrentChange,
            countSessionsWithResults: countSessionsWithResults,
            renderMarkdown: renderMarkdown,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
