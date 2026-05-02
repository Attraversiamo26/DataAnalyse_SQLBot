import { ref, computed, onMounted, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import { chatApi } from '@/api/chat';
import { Refresh, Search, FileText } from '@element-plus/icons-vue';
const loading = ref(false);
const sessions = ref([]);
const filterTool = ref('');
const dateRange = ref(null);
const searchKeyword = ref('');
const selectedSessionIds = ref(new Set());
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
    if (filterTool.value) {
        result = result.filter(session => session.tool === filterTool.value);
    }
    if (dateRange.value) {
        const startDate = dateRange.value[0].getTime();
        const endDate = dateRange.value[1].getTime();
        result = result.filter(session => {
            const createTime = new Date(session.create_time).getTime();
            return createTime >= startDate && createTime <= endDate;
        });
    }
    if (searchKeyword.value) {
        const keyword = searchKeyword.value.toLowerCase();
        result = result.filter(session => session.question.toLowerCase().includes(keyword) ||
            (session.result && session.result.toLowerCase().includes(keyword)) ||
            (session.datasource_name && session.datasource_name.toLowerCase().includes(keyword)));
    }
    return result;
});
const selectAll = (val) => {
    if (val) {
        filteredSessions.value.forEach(session => {
            selectedSessionIds.value.add(session.id);
        });
    }
    else {
        selectedSessionIds.value.clear();
    }
};
const toggleSelect = (id) => {
    if (selectedSessionIds.value.has(id)) {
        selectedSessionIds.value.delete(id);
    }
    else {
        selectedSessionIds.value.add(id);
    }
};
const isSelected = (id) => selectedSessionIds.value.has(id);
// 会话去重函数：去除重复问题，如果重复问题则保留工具类型为数据分析的
const deduplicateSessions = (records) => {
    const questionMap = new Map();
    records.forEach(record => {
        const question = record.question.trim();
        if (questionMap.has(question)) {
            const existing = questionMap.get(question);
            if (record.tool === 'analysis' && existing.tool !== 'analysis') {
                questionMap.set(question, record);
            }
        }
        else {
            questionMap.set(question, record);
        }
    });
    const deduplicated = Array.from(questionMap.values());
    deduplicated.sort((a, b) => new Date(b.create_time).getTime() - new Date(a.create_time).getTime());
    return deduplicated;
};
const loadSessions = async () => {
    loading.value = true;
    try {
        const chatListResponse = await chatApi.list();
        const chatInfos = [];
        for (const chat of chatListResponse) {
            if (chat.id) {
                try {
                    const chatInfo = await chatApi.get(chat.id);
                    chatInfos.push(chatInfo);
                }
                catch (error) {
                    console.error(`获取会话 ${chat.id} 详情失败:`, error);
                }
            }
        }
        const records = [];
        chatInfos.forEach(chatInfo => {
            chatInfo.records.forEach((record) => {
                if (!record.first_chat && record.finish_time) {
                    let result = '';
                    const toolType = chatInfo.chat_type === 'analysis' ? 'analysis' : 'chat';
                    if (toolType === 'analysis') {
                        const parts = [];
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
                        if (record.data) {
                            try {
                                const dataObj = typeof record.data === 'string' ? JSON.parse(record.data) : record.data;
                                let dataSummary = '';
                                if (dataObj.analysis_type) {
                                    dataSummary += `分析类型: ${dataObj.analysis_type}`;
                                }
                                if (dataObj.columns && Array.isArray(dataObj.columns)) {
                                    dataSummary += `, 列: ${dataObj.columns.join(', ')}`;
                                }
                                if (!dataSummary) {
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
                        if (record.data && record.data.length > 0) {
                            result = '查询成功';
                        }
                        else if (record.sql_answer) {
                            result = record.sql_answer.substring(0, 100) + (record.sql_answer.length > 100 ? '...' : '');
                        }
                        else if (record.chart_answer) {
                            result = record.chart_answer.substring(0, 100) + (record.chart_answer.length > 100 ? '...' : '');
                        }
                        else {
                            return;
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
                    records.push(sessionData);
                }
            });
        });
        const deduplicatedRecords = deduplicateSessions(records);
        sessions.value = deduplicatedRecords;
        state.tableData = deduplicatedRecords;
        state.pageInfo.total = deduplicatedRecords.length;
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
    selectedSessionIds.value.clear();
    loadSessions();
};
const handleSearch = () => {
    state.pageInfo.currentPage = 1;
    loadSessions();
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
const generateReport = async () => {
    const selectedIds = Array.from(selectedSessionIds.value);
    if (selectedIds.length === 0) {
        ElMessage.warning('请先选择要生成报告的会话');
        return;
    }
    try {
        loading.value = true;
        // 调用后端API生成报告
        const response = await fetch('/api/v1/report/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: `分析报告_${new Date().toISOString().split('T')[0]}`,
                chat_record_ids: selectedIds
            })
        });
        const result = await response.json();
        if (result.success) {
            ElMessage.success('报告生成成功');
            // 可以跳转到报告详情页面或下载报告
            console.log('报告生成结果:', result);
        }
        else {
            ElMessage.error(result.error || '报告生成失败');
        }
    }
    catch (error) {
        ElMessage.error('报告生成失败');
        console.error('Error generating report:', error);
    }
    finally {
        loading.value = false;
    }
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
    ...{ class: "report-tool-container" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "report-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "header-left" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({
    ...{ class: "page-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "page-subtitle" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "header-right" },
});
const __VLS_0 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onClick': {} },
    type: "primary",
    disabled: (__VLS_ctx.selectedSessionIds.size === 0),
}));
const __VLS_2 = __VLS_1({
    ...{ 'onClick': {} },
    type: "primary",
    disabled: (__VLS_ctx.selectedSessionIds.size === 0),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onClick: (__VLS_ctx.generateReport)
};
__VLS_3.slots.default;
{
    const { icon: __VLS_thisSlot } = __VLS_3.slots;
    const __VLS_8 = {}.FileText;
    /** @type {[typeof __VLS_components.FileText, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({}));
    const __VLS_10 = __VLS_9({}, ...__VLS_functionalComponentArgsRest(__VLS_9));
}
(__VLS_ctx.selectedSessionIds.size);
var __VLS_3;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "search-bar" },
});
const __VLS_12 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    ...{ 'onKeydown': {} },
    modelValue: (__VLS_ctx.searchKeyword),
    ...{ style: {} },
    placeholder: "搜索会话内容",
    clearable: true,
}));
const __VLS_14 = __VLS_13({
    ...{ 'onKeydown': {} },
    modelValue: (__VLS_ctx.searchKeyword),
    ...{ style: {} },
    placeholder: "搜索会话内容",
    clearable: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
let __VLS_16;
let __VLS_17;
let __VLS_18;
const __VLS_19 = {
    onKeydown: (__VLS_ctx.handleSearch)
};
__VLS_15.slots.default;
{
    const { prefix: __VLS_thisSlot } = __VLS_15.slots;
    const __VLS_20 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({}));
    const __VLS_22 = __VLS_21({}, ...__VLS_functionalComponentArgsRest(__VLS_21));
    __VLS_23.slots.default;
    const __VLS_24 = {}.Search;
    /** @type {[typeof __VLS_components.Search, ]} */ ;
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({}));
    const __VLS_26 = __VLS_25({}, ...__VLS_functionalComponentArgsRest(__VLS_25));
    var __VLS_23;
}
var __VLS_15;
const __VLS_28 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
    modelValue: (__VLS_ctx.filterTool),
    placeholder: "按工具类型筛选",
    ...{ style: {} },
}));
const __VLS_30 = __VLS_29({
    modelValue: (__VLS_ctx.filterTool),
    placeholder: "按工具类型筛选",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
__VLS_31.slots.default;
const __VLS_32 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
    label: "全部",
    value: "",
}));
const __VLS_34 = __VLS_33({
    label: "全部",
    value: "",
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
const __VLS_36 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
    label: "智能问数",
    value: "chat",
}));
const __VLS_38 = __VLS_37({
    label: "智能问数",
    value: "chat",
}, ...__VLS_functionalComponentArgsRest(__VLS_37));
const __VLS_40 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
    label: "数据分析",
    value: "analysis",
}));
const __VLS_42 = __VLS_41({
    label: "数据分析",
    value: "analysis",
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
var __VLS_31;
const __VLS_44 = {}.ElDatePicker;
/** @type {[typeof __VLS_components.ElDatePicker, typeof __VLS_components.elDatePicker, ]} */ ;
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
    modelValue: (__VLS_ctx.dateRange),
    type: "daterange",
    rangeSeparator: "至",
    startPlaceholder: "开始日期",
    endPlaceholder: "结束日期",
    ...{ style: {} },
}));
const __VLS_46 = __VLS_45({
    modelValue: (__VLS_ctx.dateRange),
    type: "daterange",
    rangeSeparator: "至",
    startPlaceholder: "开始日期",
    endPlaceholder: "结束日期",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_45));
const __VLS_48 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_50 = __VLS_49({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_49));
let __VLS_52;
let __VLS_53;
let __VLS_54;
const __VLS_55 = {
    onClick: (__VLS_ctx.refreshSessions)
};
__VLS_51.slots.default;
{
    const { icon: __VLS_thisSlot } = __VLS_51.slots;
    const __VLS_56 = {}.Refresh;
    /** @type {[typeof __VLS_components.Refresh, ]} */ ;
    // @ts-ignore
    const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({}));
    const __VLS_58 = __VLS_57({}, ...__VLS_functionalComponentArgsRest(__VLS_57));
}
var __VLS_51;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "session-table" },
});
const __VLS_60 = {}.ElTable;
/** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
// @ts-ignore
const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
    data: (__VLS_ctx.filteredSessions),
    ...{ style: {} },
    border: true,
    defaultSort: ({ prop: 'create_time', order: 'descending' }),
    headerCellStyle: ({ background: '#f5f7fa' }),
}));
const __VLS_62 = __VLS_61({
    data: (__VLS_ctx.filteredSessions),
    ...{ style: {} },
    border: true,
    defaultSort: ({ prop: 'create_time', order: 'descending' }),
    headerCellStyle: ({ background: '#f5f7fa' }),
}, ...__VLS_functionalComponentArgsRest(__VLS_61));
__VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loading) }, null, null);
__VLS_63.slots.default;
const __VLS_64 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
    type: "selection",
    width: "55",
}));
const __VLS_66 = __VLS_65({
    type: "selection",
    width: "55",
}, ...__VLS_functionalComponentArgsRest(__VLS_65));
__VLS_67.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_67.slots;
    const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_68 = {}.ElCheckbox;
    /** @type {[typeof __VLS_components.ElCheckbox, typeof __VLS_components.elCheckbox, ]} */ ;
    // @ts-ignore
    const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
        ...{ 'onChange': {} },
        checked: (__VLS_ctx.isSelected(scope.row.id)),
    }));
    const __VLS_70 = __VLS_69({
        ...{ 'onChange': {} },
        checked: (__VLS_ctx.isSelected(scope.row.id)),
    }, ...__VLS_functionalComponentArgsRest(__VLS_69));
    let __VLS_72;
    let __VLS_73;
    let __VLS_74;
    const __VLS_75 = {
        onChange: (...[$event]) => {
            __VLS_ctx.toggleSelect(scope.row.id);
        }
    };
    var __VLS_71;
}
var __VLS_67;
const __VLS_76 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
    prop: "id",
    label: "会话ID",
    width: "100",
}));
const __VLS_78 = __VLS_77({
    prop: "id",
    label: "会话ID",
    width: "100",
}, ...__VLS_functionalComponentArgsRest(__VLS_77));
const __VLS_80 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
    prop: "tool",
    label: "工具类型",
    width: "100",
}));
const __VLS_82 = __VLS_81({
    prop: "tool",
    label: "工具类型",
    width: "100",
}, ...__VLS_functionalComponentArgsRest(__VLS_81));
__VLS_83.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_83.slots;
    const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_84 = {}.ElTag;
    /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
    // @ts-ignore
    const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({
        type: (scope.row.tool === 'chat' ? 'success' : 'primary'),
    }));
    const __VLS_86 = __VLS_85({
        type: (scope.row.tool === 'chat' ? 'success' : 'primary'),
    }, ...__VLS_functionalComponentArgsRest(__VLS_85));
    __VLS_87.slots.default;
    (scope.row.tool === 'chat' ? '智能问数' : '数据分析');
    var __VLS_87;
}
var __VLS_83;
const __VLS_88 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({
    prop: "question",
    label: "问题",
    minWidth: "300",
    showOverflowTooltip: true,
}));
const __VLS_90 = __VLS_89({
    prop: "question",
    label: "问题",
    minWidth: "300",
    showOverflowTooltip: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_89));
const __VLS_92 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({
    prop: "create_time",
    label: "创建时间",
    width: "180",
}));
const __VLS_94 = __VLS_93({
    prop: "create_time",
    label: "创建时间",
    width: "180",
}, ...__VLS_functionalComponentArgsRest(__VLS_93));
const __VLS_96 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_97 = __VLS_asFunctionalComponent(__VLS_96, new __VLS_96({
    prop: "datasource_name",
    label: "数据源",
    width: "150",
}));
const __VLS_98 = __VLS_97({
    prop: "datasource_name",
    label: "数据源",
    width: "150",
}, ...__VLS_functionalComponentArgsRest(__VLS_97));
const __VLS_100 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({
    prop: "result",
    label: "结果摘要",
    minWidth: "200",
    showOverflowTooltip: true,
}));
const __VLS_102 = __VLS_101({
    prop: "result",
    label: "结果摘要",
    minWidth: "200",
    showOverflowTooltip: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_101));
var __VLS_63;
if (__VLS_ctx.state.tableData.length) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "pagination-container" },
    });
    const __VLS_104 = {}.ElPagination;
    /** @type {[typeof __VLS_components.ElPagination, typeof __VLS_components.elPagination, ]} */ ;
    // @ts-ignore
    const __VLS_105 = __VLS_asFunctionalComponent(__VLS_104, new __VLS_104({
        ...{ 'onSizeChange': {} },
        ...{ 'onCurrentChange': {} },
        currentPage: (__VLS_ctx.state.pageInfo.currentPage),
        pageSize: (__VLS_ctx.state.pageInfo.pageSize),
        pageSizes: ([10, 20, 30]),
        background: (true),
        layout: "total, sizes, prev, pager, next, jumper",
        total: (__VLS_ctx.state.pageInfo.total),
    }));
    const __VLS_106 = __VLS_105({
        ...{ 'onSizeChange': {} },
        ...{ 'onCurrentChange': {} },
        currentPage: (__VLS_ctx.state.pageInfo.currentPage),
        pageSize: (__VLS_ctx.state.pageInfo.pageSize),
        pageSizes: ([10, 20, 30]),
        background: (true),
        layout: "total, sizes, prev, pager, next, jumper",
        total: (__VLS_ctx.state.pageInfo.total),
    }, ...__VLS_functionalComponentArgsRest(__VLS_105));
    let __VLS_108;
    let __VLS_109;
    let __VLS_110;
    const __VLS_111 = {
        onSizeChange: (__VLS_ctx.handleSizeChange)
    };
    const __VLS_112 = {
        onCurrentChange: (__VLS_ctx.handleCurrentChange)
    };
    var __VLS_107;
}
/** @type {__VLS_StyleScopedClasses['report-tool-container']} */ ;
/** @type {__VLS_StyleScopedClasses['report-header']} */ ;
/** @type {__VLS_StyleScopedClasses['header-left']} */ ;
/** @type {__VLS_StyleScopedClasses['page-title']} */ ;
/** @type {__VLS_StyleScopedClasses['page-subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['header-right']} */ ;
/** @type {__VLS_StyleScopedClasses['search-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['session-table']} */ ;
/** @type {__VLS_StyleScopedClasses['pagination-container']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            Refresh: Refresh,
            Search: Search,
            FileText: FileText,
            loading: loading,
            filterTool: filterTool,
            dateRange: dateRange,
            searchKeyword: searchKeyword,
            selectedSessionIds: selectedSessionIds,
            state: state,
            filteredSessions: filteredSessions,
            toggleSelect: toggleSelect,
            isSelected: isSelected,
            refreshSessions: refreshSessions,
            handleSearch: handleSearch,
            handleSizeChange: handleSizeChange,
            handleCurrentChange: handleCurrentChange,
            generateReport: generateReport,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
