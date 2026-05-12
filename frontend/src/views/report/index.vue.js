import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Upload } from '@element-plus/icons-vue';
import { request } from '@/utils/request';
import { dataAgentApi } from '@/api/dataAgent';
import { chatApi } from '@/api/chat';
// 当前激活的标签页
const activeTab = ref('template');
// 模板上传相关
const isDragOver = ref(false);
const parsedFocusContent = ref('');
const generatedQuestions = ref([]);
const selectedQuestions = ref([]);
const isGeneratingQuestions = ref(false);
const fileInput = ref(null);
// 模板输入方式
const templateInputMode = ref('upload');
const templateContent = ref('');
// 处理上传区域点击
const handleUploadClick = () => {
    if (fileInput.value) {
        fileInput.value.click();
    }
};
// 会话相关
const chatRecords = ref([]);
const selectedChatRecords = ref([]);
const showChatDetailDialog = ref(false);
const selectedChatDetail = ref(null);
// 报告生成相关
const isGeneratingReport = ref(false);
const generatedReport = ref(null);
// 数据源相关
const datasourceList = ref([]);
const selectedDatasource = ref('');
const reports = ref([]);
// 处理文件拖放
const handleDrop = (event) => {
    isDragOver.value = false;
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
        processFile(files[0]);
    }
};
// 处理文件选择
const handleFileSelect = (event) => {
    const target = event.target;
    const files = target.files;
    if (files && files.length > 0) {
        processFile(files[0]);
    }
};
// 处理文件
const processFile = async (file) => {
    try {
        console.log('开始上传文件:', file.name);
        const formData = new FormData();
        formData.append('file', file);
        const response = await request.post('/data-agent/upload-template', formData);
        console.log('上传响应:', response);
        if (response.success) {
            parsedFocusContent.value = response.focus_content || '';
            generatedQuestions.value = [];
            selectedQuestions.value = [];
            console.log('解析到的重点内容:', parsedFocusContent.value);
        }
        else {
            console.error('上传失败:', response.error);
        }
    }
    catch (error) {
        console.error('上传错误:', error);
    }
};
// 解析直接输入的模板内容
const parseTemplateContent = async () => {
    if (!templateContent.value.trim()) {
        console.warn('请输入模板内容');
        return;
    }
    try {
        console.log('开始解析模板内容:', templateContent.value.substring(0, 100));
        // 提取【重点关注】部分
        const focusMatch = templateContent.value.match(/【重点关注】([\s\S]*?)(?=【|$)/);
        if (focusMatch && focusMatch[1]) {
            parsedFocusContent.value = focusMatch[1].trim();
            console.log('提取到的重点内容:', parsedFocusContent.value);
            // 清空之前的问题列表
            generatedQuestions.value = [];
            selectedQuestions.value = [];
            console.log('模板解析成功');
        }
        else {
            // 如果没有找到【重点关注】标签，就使用全部内容
            parsedFocusContent.value = templateContent.value.trim();
            console.log('使用全部内容作为重点:', parsedFocusContent.value);
            generatedQuestions.value = [];
            selectedQuestions.value = [];
            console.log('模板解析成功');
        }
    }
    catch (error) {
        console.error('解析模板错误:', error);
    }
};
// 清空解析内容
const clearFocusContent = () => {
    parsedFocusContent.value = '';
    generatedQuestions.value = [];
    selectedQuestions.value = [];
};
// 全选问题
const selectAllQuestions = () => {
    selectedQuestions.value = [...generatedQuestions.value];
};
// 取消全选
const deselectAllQuestions = () => {
    selectedQuestions.value = [];
};
// 生成问题列表
const generateQuestions = async () => {
    if (!parsedFocusContent.value) {
        console.warn('请先上传或输入模板');
        return;
    }
    console.log('开始生成问题，重点内容:', parsedFocusContent.value);
    isGeneratingQuestions.value = true;
    try {
        const response = await dataAgentApi.generateQuestions({
            focus_content: parsedFocusContent.value,
        });
        console.log('生成问题响应:', response);
        if (response.success) {
            generatedQuestions.value = response.questions || [];
            selectedQuestions.value = [...generatedQuestions.value];
            console.log('问题生成成功');
            console.log('生成的问题:', generatedQuestions.value);
        }
        else {
            console.error('生成失败:', response.error);
        }
    }
    catch (error) {
        console.error('生成问题错误:', error);
    }
    finally {
        isGeneratingQuestions.value = false;
    }
};
// 从模板生成报告
const generateReportFromTemplate = async () => {
    if (selectedQuestions.value.length === 0) {
        ElMessage.warning('请选择问题');
        return;
    }
    // 如果用户没有选择数据源，提示用户选择
    if (!selectedDatasource.value) {
        ElMessage.warning('请选择数据源');
        return;
    }
    console.log('开始生成报告，选择的问题:', selectedQuestions.value);
    console.log('选择的数据源:', selectedDatasource.value);
    isGeneratingReport.value = true;
    try {
        // 解析选中的数据源
        const datasource = JSON.parse(selectedDatasource.value);
        const response = await dataAgentApi.generateReportFromTemplate({
            name: `报告_${new Date().toLocaleDateString()}`,
            questions: selectedQuestions.value,
            datasource_id: datasource.id,
            datasource_name: datasource.name,
            datasource_type: datasource.type,
        });
        console.log('生成报告响应:', response);
        generatedReport.value = response;
        console.log('报告生成成功');
        ElMessage.success('报告生成成功');
        // 刷新报告列表
        await loadReports();
    }
    catch (error) {
        console.error('生成报告错误:', error);
        ElMessage.error('生成报告失败');
    }
    finally {
        isGeneratingReport.value = false;
    }
};
// 加载会话记录
const loadChatRecords = async () => {
    try {
        // 获取所有聊天会话
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
        chatInfos.forEach((chatInfo) => {
            if (chatInfo && chatInfo.records && Array.isArray(chatInfo.records)) {
                chatInfo.records.forEach((record) => {
                    // 只收集有问题内容的记录（排除第一条空记录）
                    if (record && record.id && record.question && record.question.trim()) {
                        let result = '';
                        const toolType = chatInfo.chat_type === 'analysis' ? 'analysis' : 'chat';
                        if (toolType === 'analysis') {
                            // 数据分析
                            const parts = [];
                            if (record.analysis) {
                                try {
                                    const analysisObj = typeof record.analysis === 'string'
                                        ? JSON.parse(record.analysis)
                                        : record.analysis;
                                    const reportContent = analysisObj.content || analysisObj.report || '';
                                    if (reportContent) {
                                        parts.push(`报告: ${reportContent.substring(0, 100)}${reportContent.length > 100 ? '...' : ''}`);
                                    }
                                }
                                catch {
                                    const analysisStr = typeof record.analysis === 'string'
                                        ? record.analysis
                                        : JSON.stringify(record.analysis);
                                    parts.push(`报告: ${analysisStr.substring(0, 100)}${analysisStr.length > 100 ? '...' : ''}`);
                                }
                            }
                            result = parts.length > 0 ? parts.join(' | ') : '失败';
                        }
                        else {
                            // 智能问数
                            if (record.data) {
                                const dataObj = typeof record.data === 'string' ? JSON.parse(record.data) : record.data;
                                if (typeof dataObj === 'object' &&
                                    Array.isArray(dataObj.data) &&
                                    dataObj.data.length > 0) {
                                    result = '查询成功';
                                }
                                else if (Array.isArray(dataObj) && dataObj.length > 0) {
                                    result = '查询成功';
                                }
                            }
                            if (!result && record.sql_answer) {
                                result =
                                    record.sql_answer.substring(0, 100) +
                                        (record.sql_answer.length > 100 ? '...' : '');
                            }
                            if (!result && record.chart_answer) {
                                result =
                                    record.chart_answer.substring(0, 100) +
                                        (record.chart_answer.length > 100 ? '...' : '');
                            }
                            if (!result) {
                                return; // 跳过没有结果的记录
                            }
                        }
                        records.push({
                            id: record.id,
                            chat_id: chatInfo.id,
                            question: record.question,
                            tool: toolType,
                            datasource_name: chatInfo.datasource_name || '未知数据源',
                            create_time: record.create_time,
                            finish_time: record.finish_time || '',
                            status: record.finish ? 'completed' : 'processing',
                            result: result,
                        });
                    }
                });
            }
        });
        chatRecords.value = records;
    }
    catch (error) {
        console.error('加载会话记录失败:', error);
    }
};
// 处理会话选择变化
const handleChatSelectionChange = (val) => {
    selectedChatRecords.value = val.map((item) => item.id);
};
// 查看会话详情
const viewChatDetail = async (record) => {
    try {
        // 获取完整的会话详情
        const chatInfo = await chatApi.get(record.chat_id);
        if (chatInfo && chatInfo.records) {
            const fullRecord = chatInfo.records.find((r) => r.id === record.id);
            if (fullRecord) {
                let resultData = {};
                let resultType = 'text';
                let rawData = {};
                let charts = {};
                let correlationColumns = [];
                if (record.tool === 'analysis') {
                    // 数据分析
                    if (fullRecord.data && typeof fullRecord.data === 'object') {
                        if (fullRecord.data.charts && typeof fullRecord.data.charts === 'object') {
                            charts = fullRecord.data.charts;
                        }
                        rawData = fullRecord.data;
                        if (fullRecord.data.correlation_matrix &&
                            Array.isArray(fullRecord.data.correlation_matrix) &&
                            fullRecord.data.correlation_matrix.length > 0) {
                            correlationColumns = Object.keys(fullRecord.data.correlation_matrix[0]);
                        }
                    }
                    if (fullRecord.analysis) {
                        const analysisVal = fullRecord.analysis;
                        if (typeof analysisVal === 'string') {
                            try {
                                const analysisObj = JSON.parse(analysisVal);
                                resultData = { content: analysisObj.content || analysisObj.report || '' };
                            }
                            catch {
                                resultData = { content: analysisVal };
                            }
                        }
                        else if (typeof analysisVal === 'object' && analysisVal !== null) {
                            const analysisObj = analysisVal;
                            resultData = { content: analysisObj.content || '' };
                        }
                        resultType = 'analysis';
                    }
                }
                else {
                    // 智能问数
                    if (fullRecord.data) {
                        const dataObj = typeof fullRecord.data === 'string' ? JSON.parse(fullRecord.data) : fullRecord.data;
                        if (typeof dataObj === 'object' && Array.isArray(dataObj.data)) {
                            resultData = dataObj.data;
                            resultType = 'table';
                        }
                        else if (Array.isArray(dataObj)) {
                            resultData = dataObj;
                            resultType = 'table';
                        }
                        else {
                            resultData = { content: JSON.stringify(dataObj, null, 2) };
                            resultType = 'text';
                        }
                    }
                    else if (fullRecord.sql_answer) {
                        resultData = { content: fullRecord.sql_answer };
                        resultType = 'text';
                    }
                    else if (fullRecord.chart_answer) {
                        resultData = { content: fullRecord.chart_answer };
                        resultType = 'text';
                    }
                }
                selectedChatDetail.value = {
                    ...record,
                    resultData: resultData,
                    resultType: resultType,
                    rawData: rawData,
                    charts: charts,
                    correlationColumns: correlationColumns,
                };
            }
            else {
                selectedChatDetail.value = record;
            }
        }
        else {
            selectedChatDetail.value = record;
        }
        showChatDetailDialog.value = true;
    }
    catch (error) {
        console.error('获取会话详情失败:', error);
        selectedChatDetail.value = record;
        showChatDetailDialog.value = true;
    }
};
// 删除会话记录
const deleteChatRecord = (record) => {
    ElMessageBox.confirm('确定要删除这条会话记录吗？', '删除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
    })
        .then(async () => {
        try {
            // 从列表中移除
            chatRecords.value = chatRecords.value.filter((r) => r.id !== record.id);
            // 从选中列表中移除
            selectedChatRecords.value = selectedChatRecords.value.filter((id) => id !== record.id);
            ElMessage.success('删除成功');
        }
        catch (error) {
            ElMessage.error('删除失败');
            console.error('删除会话记录错误:', error);
        }
    })
        .catch(() => {
        // 用户取消删除
    });
};
// 从会话生成报告
const generateReportFromChats = async () => {
    if (selectedChatRecords.value.length === 0) {
        ElMessage.warning('请选择会话');
        return;
    }
    isGeneratingReport.value = true;
    try {
        const response = await dataAgentApi.generateReportFromChats({
            name: `综合报告_${new Date().toLocaleDateString()}`,
            chat_record_ids: selectedChatRecords.value,
        });
        generatedReport.value = response;
        ElMessage.success('报告生成成功');
        // 刷新报告列表
        await loadReports();
    }
    catch (error) {
        ElMessage.error('生成报告失败');
        console.error('生成报告错误:', error);
    }
    finally {
        isGeneratingReport.value = false;
    }
};
// 查看报告
const viewReport = async (reportId) => {
    try {
        const report = await dataAgentApi.getReport(reportId);
        generatedReport.value = report;
    }
    catch (error) {
        ElMessage.error('获取报告失败');
        console.error('获取报告错误:', error);
    }
};
// 编辑报告
const editReport = () => {
    ElMessage.info('编辑报告功能开发中');
};
// 下载报告
const downloadReport = () => {
    if (generatedReport.value && generatedReport.value.report_content) {
        const blob = new Blob([generatedReport.value.report_content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${generatedReport.value.name || 'report'}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        ElMessage.success('报告下载成功');
    }
};
// 删除报告
const deleteReport = (_reportId) => {
    ElMessage.info('删除报告功能开发中');
};
// 渲染Markdown
const renderMarkdown = (content) => {
    if (!content)
        return '';
    return content
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/gim, '<em>$1</em>')
        .replace(/!\[([^\]]*)\]\(([^)]+)\)/gim, '<img src="$2" alt="$1" style="max-width: 100%; height: auto; margin: 10px 0;" />')
        .replace(/```(\w+)?\n([\s\S]*?)```/gim, '<pre><code>$2</code></pre>')
        .replace(/`([^`]+)`/gim, '<code>$1</code>')
        .replace(/^- (.*$)/gim, '<li>$1</li>')
        .replace(/^(\d+)\. (.*$)/gim, '<li>$1. $2</li>')
        .replace(/\n/gim, '<br>');
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
// 加载数据源列表
const loadDatasourceList = async () => {
    try {
        const response = await dataAgentApi.getDatasources();
        datasourceList.value = response;
        console.log('数据源列表:', datasourceList.value);
    }
    catch (error) {
        console.error('加载数据源列表失败:', error);
    }
};
// 页面加载时获取数据
onMounted(async () => {
    await loadReports();
    await loadChatRecords();
    await loadDatasourceList();
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['upload-area']} */ ;
/** @type {__VLS_StyleScopedClasses['upload-area']} */ ;
/** @type {__VLS_StyleScopedClasses['question-item']} */ ;
/** @type {__VLS_StyleScopedClasses['question-item']} */ ;
/** @type {__VLS_StyleScopedClasses['question-item']} */ ;
/** @type {__VLS_StyleScopedClasses['question-item']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['custom-green-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['custom-green-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['custom-green-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['report-header']} */ ;
/** @type {__VLS_StyleScopedClasses['table-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['markdown-content']} */ ;
/** @type {__VLS_StyleScopedClasses['markdown-content']} */ ;
/** @type {__VLS_StyleScopedClasses['markdown-content']} */ ;
/** @type {__VLS_StyleScopedClasses['markdown-content']} */ ;
/** @type {__VLS_StyleScopedClasses['markdown-content']} */ ;
/** @type {__VLS_StyleScopedClasses['markdown-content']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "report-container" },
});
const __VLS_0 = {}.ElCard;
/** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ class: "report-card" },
}));
const __VLS_2 = __VLS_1({
    ...{ class: "report-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
{
    const { header: __VLS_thisSlot } = __VLS_3.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "card-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    const __VLS_4 = {}.ElTabs;
    /** @type {[typeof __VLS_components.ElTabs, typeof __VLS_components.elTabs, typeof __VLS_components.ElTabs, typeof __VLS_components.elTabs, ]} */ ;
    // @ts-ignore
    const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
        modelValue: (__VLS_ctx.activeTab),
        ...{ class: "report-tabs" },
    }));
    const __VLS_6 = __VLS_5({
        modelValue: (__VLS_ctx.activeTab),
        ...{ class: "report-tabs" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_5));
    __VLS_7.slots.default;
    const __VLS_8 = {}.ElTabPane;
    /** @type {[typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
        label: "模板生成",
        name: "template",
    }));
    const __VLS_10 = __VLS_9({
        label: "模板生成",
        name: "template",
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    const __VLS_12 = {}.ElTabPane;
    /** @type {[typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, ]} */ ;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
        label: "会话汇总",
        name: "chat",
    }));
    const __VLS_14 = __VLS_13({
        label: "会话汇总",
        name: "chat",
    }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    var __VLS_7;
}
if (__VLS_ctx.activeTab === 'template') {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    const __VLS_16 = {}.ElDivider;
    /** @type {[typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, ]} */ ;
    // @ts-ignore
    const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
        contentPosition: "left",
    }));
    const __VLS_18 = __VLS_17({
        contentPosition: "left",
    }, ...__VLS_functionalComponentArgsRest(__VLS_17));
    __VLS_19.slots.default;
    var __VLS_19;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "template-input-section" },
    });
    const __VLS_20 = {}.ElRadioGroup;
    /** @type {[typeof __VLS_components.ElRadioGroup, typeof __VLS_components.elRadioGroup, typeof __VLS_components.ElRadioGroup, typeof __VLS_components.elRadioGroup, ]} */ ;
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
        modelValue: (__VLS_ctx.templateInputMode),
        ...{ class: "input-mode-selector" },
    }));
    const __VLS_22 = __VLS_21({
        modelValue: (__VLS_ctx.templateInputMode),
        ...{ class: "input-mode-selector" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_21));
    __VLS_23.slots.default;
    const __VLS_24 = {}.ElRadioButton;
    /** @type {[typeof __VLS_components.ElRadioButton, typeof __VLS_components.elRadioButton, typeof __VLS_components.ElRadioButton, typeof __VLS_components.elRadioButton, ]} */ ;
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
        value: "upload",
    }));
    const __VLS_26 = __VLS_25({
        value: "upload",
    }, ...__VLS_functionalComponentArgsRest(__VLS_25));
    __VLS_27.slots.default;
    var __VLS_27;
    const __VLS_28 = {}.ElRadioButton;
    /** @type {[typeof __VLS_components.ElRadioButton, typeof __VLS_components.elRadioButton, typeof __VLS_components.ElRadioButton, typeof __VLS_components.elRadioButton, ]} */ ;
    // @ts-ignore
    const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
        value: "input",
    }));
    const __VLS_30 = __VLS_29({
        value: "input",
    }, ...__VLS_functionalComponentArgsRest(__VLS_29));
    __VLS_31.slots.default;
    var __VLS_31;
    var __VLS_23;
    if (__VLS_ctx.templateInputMode === 'upload') {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "upload-section" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ onDrop: (__VLS_ctx.handleDrop) },
            ...{ onDragover: (...[$event]) => {
                    if (!(__VLS_ctx.activeTab === 'template'))
                        return;
                    if (!(__VLS_ctx.templateInputMode === 'upload'))
                        return;
                    __VLS_ctx.isDragOver = true;
                } },
            ...{ onDragleave: (...[$event]) => {
                    if (!(__VLS_ctx.activeTab === 'template'))
                        return;
                    if (!(__VLS_ctx.templateInputMode === 'upload'))
                        return;
                    __VLS_ctx.isDragOver = false;
                } },
            ...{ onClick: (__VLS_ctx.handleUploadClick) },
            ...{ class: "upload-area" },
            ...{ class: ({ 'drag-over': __VLS_ctx.isDragOver }) },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
            ...{ onChange: (__VLS_ctx.handleFileSelect) },
            ref: "fileInput",
            type: "file",
            ...{ class: "upload-input" },
            accept: ".md,.txt",
        });
        /** @type {typeof __VLS_ctx.fileInput} */ ;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "upload-content" },
        });
        const __VLS_32 = {}.ElIcon;
        /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
        // @ts-ignore
        const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
            ...{ class: "upload-icon" },
            size: "48",
        }));
        const __VLS_34 = __VLS_33({
            ...{ class: "upload-icon" },
            size: "48",
        }, ...__VLS_functionalComponentArgsRest(__VLS_33));
        __VLS_35.slots.default;
        const __VLS_36 = {}.Upload;
        /** @type {[typeof __VLS_components.Upload, ]} */ ;
        // @ts-ignore
        const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({}));
        const __VLS_38 = __VLS_37({}, ...__VLS_functionalComponentArgsRest(__VLS_37));
        var __VLS_35;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
            ...{ class: "upload-hint" },
        });
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "input-section" },
        });
        const __VLS_40 = {}.ElInput;
        /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
        // @ts-ignore
        const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
            modelValue: (__VLS_ctx.templateContent),
            type: "textarea",
            rows: (10),
            placeholder: "\u8bf7\u8f93\u5165\u62a5\u544a\u6a21\u677f\u5185\u5bb9\uff0c\u4f8b\u5982\uff1a\u000a\u000a\u3010\u91cd\u70b9\u5173\u6ce8\u3011\u000a\u5206\u6790\u9500\u552e\u6570\u636e\u8d8b\u52bf\u000a\u5bf9\u6bd4\u4e0d\u540c\u533a\u57df\u4e1a\u7ee9\u000a\u8bc6\u522b\u5f02\u5e38\u6ce2\u52a8\u000a\u000a\u3010\u62a5\u544a\u683c\u5f0f\u3011\u000a\u4f7f\u7528\u0020\u006d\u0061\u0072\u006b\u0064\u006f\u0077\u006e\u0020\u683c\u5f0f\u000a\u5305\u542b\u56fe\u8868\u548c\u6570\u636e\u8868\u683c",
            ...{ class: "template-textarea" },
        }));
        const __VLS_42 = __VLS_41({
            modelValue: (__VLS_ctx.templateContent),
            type: "textarea",
            rows: (10),
            placeholder: "\u8bf7\u8f93\u5165\u62a5\u544a\u6a21\u677f\u5185\u5bb9\uff0c\u4f8b\u5982\uff1a\u000a\u000a\u3010\u91cd\u70b9\u5173\u6ce8\u3011\u000a\u5206\u6790\u9500\u552e\u6570\u636e\u8d8b\u52bf\u000a\u5bf9\u6bd4\u4e0d\u540c\u533a\u57df\u4e1a\u7ee9\u000a\u8bc6\u522b\u5f02\u5e38\u6ce2\u52a8\u000a\u000a\u3010\u62a5\u544a\u683c\u5f0f\u3011\u000a\u4f7f\u7528\u0020\u006d\u0061\u0072\u006b\u0064\u006f\u0077\u006e\u0020\u683c\u5f0f\u000a\u5305\u542b\u56fe\u8868\u548c\u6570\u636e\u8868\u683c",
            ...{ class: "template-textarea" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_41));
        const __VLS_44 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
            ...{ 'onClick': {} },
            type: "primary",
            disabled: (!__VLS_ctx.templateContent.trim()),
            ...{ class: "parse-button" },
        }));
        const __VLS_46 = __VLS_45({
            ...{ 'onClick': {} },
            type: "primary",
            disabled: (!__VLS_ctx.templateContent.trim()),
            ...{ class: "parse-button" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_45));
        let __VLS_48;
        let __VLS_49;
        let __VLS_50;
        const __VLS_51 = {
            onClick: (__VLS_ctx.parseTemplateContent)
        };
        __VLS_47.slots.default;
        var __VLS_47;
    }
    if (__VLS_ctx.parsedFocusContent) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "focus-content" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "focus-header" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "focus-title" },
        });
        const __VLS_52 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
            ...{ 'onClick': {} },
            type: "danger",
            size: "small",
            ...{ class: "clear-button" },
        }));
        const __VLS_54 = __VLS_53({
            ...{ 'onClick': {} },
            type: "danger",
            size: "small",
            ...{ class: "clear-button" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_53));
        let __VLS_56;
        let __VLS_57;
        let __VLS_58;
        const __VLS_59 = {
            onClick: (__VLS_ctx.clearFocusContent)
        };
        __VLS_55.slots.default;
        var __VLS_55;
        const __VLS_60 = {}.ElCard;
        /** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
        // @ts-ignore
        const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
            ...{ class: "focus-card" },
        }));
        const __VLS_62 = __VLS_61({
            ...{ class: "focus-card" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_61));
        __VLS_63.slots.default;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "focus-text" },
        });
        (__VLS_ctx.parsedFocusContent);
        var __VLS_63;
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "datasource-section" },
    });
    const __VLS_64 = {}.ElDivider;
    /** @type {[typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, ]} */ ;
    // @ts-ignore
    const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
        contentPosition: "left",
    }));
    const __VLS_66 = __VLS_65({
        contentPosition: "left",
    }, ...__VLS_functionalComponentArgsRest(__VLS_65));
    __VLS_67.slots.default;
    var __VLS_67;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "datasource-selector" },
    });
    const __VLS_68 = {}.ElSelect;
    /** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
    // @ts-ignore
    const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
        modelValue: (__VLS_ctx.selectedDatasource),
        placeholder: "请选择数据源",
        ...{ class: "datasource-select" },
    }));
    const __VLS_70 = __VLS_69({
        modelValue: (__VLS_ctx.selectedDatasource),
        placeholder: "请选择数据源",
        ...{ class: "datasource-select" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_69));
    __VLS_71.slots.default;
    for (const [ds] of __VLS_getVForSourceType((__VLS_ctx.datasourceList))) {
        const __VLS_72 = {}.ElOption;
        /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
        // @ts-ignore
        const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
            key: (ds.id),
            label: (`${ds.name} (${ds.type_name})`),
            value: (JSON.stringify({ id: ds.id, name: ds.name, type: ds.type })),
        }));
        const __VLS_74 = __VLS_73({
            key: (ds.id),
            label: (`${ds.name} (${ds.type_name})`),
            value: (JSON.stringify({ id: ds.id, name: ds.name, type: ds.type })),
        }, ...__VLS_functionalComponentArgsRest(__VLS_73));
    }
    var __VLS_71;
    if (__VLS_ctx.selectedDatasource) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "selected-datasource-info" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "info-label" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "info-value" },
        });
        (JSON.parse(__VLS_ctx.selectedDatasource).name);
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "template-actions" },
    });
    const __VLS_76 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
        ...{ 'onClick': {} },
        type: "primary",
        loading: (__VLS_ctx.isGeneratingQuestions),
        disabled: (!__VLS_ctx.parsedFocusContent),
        ...{ class: "action-button" },
    }));
    const __VLS_78 = __VLS_77({
        ...{ 'onClick': {} },
        type: "primary",
        loading: (__VLS_ctx.isGeneratingQuestions),
        disabled: (!__VLS_ctx.parsedFocusContent),
        ...{ class: "action-button" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_77));
    let __VLS_80;
    let __VLS_81;
    let __VLS_82;
    const __VLS_83 = {
        onClick: (__VLS_ctx.generateQuestions)
    };
    __VLS_79.slots.default;
    (__VLS_ctx.isGeneratingQuestions ? '生成中...' : '生成问题列表');
    var __VLS_79;
    const __VLS_84 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({
        ...{ 'onClick': {} },
        ...{ class: "custom-green-btn action-button" },
        loading: (__VLS_ctx.isGeneratingReport),
        disabled: (__VLS_ctx.selectedQuestions.length === 0),
    }));
    const __VLS_86 = __VLS_85({
        ...{ 'onClick': {} },
        ...{ class: "custom-green-btn action-button" },
        loading: (__VLS_ctx.isGeneratingReport),
        disabled: (__VLS_ctx.selectedQuestions.length === 0),
    }, ...__VLS_functionalComponentArgsRest(__VLS_85));
    let __VLS_88;
    let __VLS_89;
    let __VLS_90;
    const __VLS_91 = {
        onClick: (__VLS_ctx.generateReportFromTemplate)
    };
    __VLS_87.slots.default;
    (__VLS_ctx.isGeneratingReport ? '生成报告中...' : '生成报告');
    var __VLS_87;
    if (__VLS_ctx.generatedQuestions.length > 0) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "questions-section" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "questions-header" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "questions-title" },
        });
        const __VLS_92 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({
            ...{ 'onClick': {} },
            size: "small",
            disabled: (__VLS_ctx.selectedQuestions.length === __VLS_ctx.generatedQuestions.length),
        }));
        const __VLS_94 = __VLS_93({
            ...{ 'onClick': {} },
            size: "small",
            disabled: (__VLS_ctx.selectedQuestions.length === __VLS_ctx.generatedQuestions.length),
        }, ...__VLS_functionalComponentArgsRest(__VLS_93));
        let __VLS_96;
        let __VLS_97;
        let __VLS_98;
        const __VLS_99 = {
            onClick: (__VLS_ctx.selectAllQuestions)
        };
        __VLS_95.slots.default;
        var __VLS_95;
        const __VLS_100 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({
            ...{ 'onClick': {} },
            size: "small",
            disabled: (__VLS_ctx.selectedQuestions.length === 0),
        }));
        const __VLS_102 = __VLS_101({
            ...{ 'onClick': {} },
            size: "small",
            disabled: (__VLS_ctx.selectedQuestions.length === 0),
        }, ...__VLS_functionalComponentArgsRest(__VLS_101));
        let __VLS_104;
        let __VLS_105;
        let __VLS_106;
        const __VLS_107 = {
            onClick: (__VLS_ctx.deselectAllQuestions)
        };
        __VLS_103.slots.default;
        var __VLS_103;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "questions-container" },
        });
        const __VLS_108 = {}.ElCheckboxGroup;
        /** @type {[typeof __VLS_components.ElCheckboxGroup, typeof __VLS_components.elCheckboxGroup, typeof __VLS_components.ElCheckboxGroup, typeof __VLS_components.elCheckboxGroup, ]} */ ;
        // @ts-ignore
        const __VLS_109 = __VLS_asFunctionalComponent(__VLS_108, new __VLS_108({
            modelValue: (__VLS_ctx.selectedQuestions),
            ...{ class: "questions-group" },
        }));
        const __VLS_110 = __VLS_109({
            modelValue: (__VLS_ctx.selectedQuestions),
            ...{ class: "questions-group" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_109));
        __VLS_111.slots.default;
        for (const [question, index] of __VLS_getVForSourceType((__VLS_ctx.generatedQuestions))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                key: (index),
                ...{ class: "question-item" },
            });
            const __VLS_112 = {}.ElCheckbox;
            /** @type {[typeof __VLS_components.ElCheckbox, typeof __VLS_components.elCheckbox, typeof __VLS_components.ElCheckbox, typeof __VLS_components.elCheckbox, ]} */ ;
            // @ts-ignore
            const __VLS_113 = __VLS_asFunctionalComponent(__VLS_112, new __VLS_112({
                label: (question),
            }));
            const __VLS_114 = __VLS_113({
                label: (question),
            }, ...__VLS_functionalComponentArgsRest(__VLS_113));
            __VLS_115.slots.default;
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "question-index" },
            });
            (index + 1);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "question-text" },
            });
            (question);
            var __VLS_115;
        }
        var __VLS_111;
    }
}
if (__VLS_ctx.activeTab === 'chat') {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "chat-summary-container" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "chat-content" },
    });
    const __VLS_116 = {}.ElDivider;
    /** @type {[typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, ]} */ ;
    // @ts-ignore
    const __VLS_117 = __VLS_asFunctionalComponent(__VLS_116, new __VLS_116({
        contentPosition: "left",
    }));
    const __VLS_118 = __VLS_117({
        contentPosition: "left",
    }, ...__VLS_functionalComponentArgsRest(__VLS_117));
    __VLS_119.slots.default;
    var __VLS_119;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "chat-section" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "table-wrapper" },
    });
    const __VLS_120 = {}.ElTable;
    /** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
    // @ts-ignore
    const __VLS_121 = __VLS_asFunctionalComponent(__VLS_120, new __VLS_120({
        ...{ 'onSelectionChange': {} },
        data: (__VLS_ctx.chatRecords),
        fit: true,
        rowKey: ((record) => record.id),
        defaultSort: ({ prop: 'create_time', order: 'descending' }),
        border: true,
    }));
    const __VLS_122 = __VLS_121({
        ...{ 'onSelectionChange': {} },
        data: (__VLS_ctx.chatRecords),
        fit: true,
        rowKey: ((record) => record.id),
        defaultSort: ({ prop: 'create_time', order: 'descending' }),
        border: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_121));
    let __VLS_124;
    let __VLS_125;
    let __VLS_126;
    const __VLS_127 = {
        onSelectionChange: (__VLS_ctx.handleChatSelectionChange)
    };
    __VLS_123.slots.default;
    const __VLS_128 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_129 = __VLS_asFunctionalComponent(__VLS_128, new __VLS_128({
        type: "selection",
        minWidth: "40",
    }));
    const __VLS_130 = __VLS_129({
        type: "selection",
        minWidth: "40",
    }, ...__VLS_functionalComponentArgsRest(__VLS_129));
    const __VLS_132 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_133 = __VLS_asFunctionalComponent(__VLS_132, new __VLS_132({
        prop: "tool",
        label: "工具类型",
        minWidth: "90",
    }));
    const __VLS_134 = __VLS_133({
        prop: "tool",
        label: "工具类型",
        minWidth: "90",
    }, ...__VLS_functionalComponentArgsRest(__VLS_133));
    __VLS_135.slots.default;
    {
        const { default: __VLS_thisSlot } = __VLS_135.slots;
        const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_136 = {}.ElTag;
        /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
        // @ts-ignore
        const __VLS_137 = __VLS_asFunctionalComponent(__VLS_136, new __VLS_136({
            type: (scope.row.tool === 'chat' ? 'primary' : 'success'),
        }));
        const __VLS_138 = __VLS_137({
            type: (scope.row.tool === 'chat' ? 'primary' : 'success'),
        }, ...__VLS_functionalComponentArgsRest(__VLS_137));
        __VLS_139.slots.default;
        (scope.row.tool === 'chat' ? '智能问数' : '数据分析');
        var __VLS_139;
    }
    var __VLS_135;
    const __VLS_140 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_141 = __VLS_asFunctionalComponent(__VLS_140, new __VLS_140({
        prop: "question",
        label: "问题",
        minWidth: "200",
        showOverflowTooltip: true,
    }));
    const __VLS_142 = __VLS_141({
        prop: "question",
        label: "问题",
        minWidth: "200",
        showOverflowTooltip: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_141));
    const __VLS_144 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_145 = __VLS_asFunctionalComponent(__VLS_144, new __VLS_144({
        prop: "datasource_name",
        label: "数据源",
        minWidth: "100",
    }));
    const __VLS_146 = __VLS_145({
        prop: "datasource_name",
        label: "数据源",
        minWidth: "100",
    }, ...__VLS_functionalComponentArgsRest(__VLS_145));
    const __VLS_148 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_149 = __VLS_asFunctionalComponent(__VLS_148, new __VLS_148({
        prop: "create_time",
        label: "创建时间",
        minWidth: "160",
    }));
    const __VLS_150 = __VLS_149({
        prop: "create_time",
        label: "创建时间",
        minWidth: "160",
    }, ...__VLS_functionalComponentArgsRest(__VLS_149));
    const __VLS_152 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_153 = __VLS_asFunctionalComponent(__VLS_152, new __VLS_152({
        prop: "finish_time",
        label: "结束时间",
        minWidth: "160",
    }));
    const __VLS_154 = __VLS_153({
        prop: "finish_time",
        label: "结束时间",
        minWidth: "160",
    }, ...__VLS_functionalComponentArgsRest(__VLS_153));
    const __VLS_156 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_157 = __VLS_asFunctionalComponent(__VLS_156, new __VLS_156({
        prop: "status",
        label: "状态",
        minWidth: "80",
    }));
    const __VLS_158 = __VLS_157({
        prop: "status",
        label: "状态",
        minWidth: "80",
    }, ...__VLS_functionalComponentArgsRest(__VLS_157));
    __VLS_159.slots.default;
    {
        const { default: __VLS_thisSlot } = __VLS_159.slots;
        const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_160 = {}.ElTag;
        /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
        // @ts-ignore
        const __VLS_161 = __VLS_asFunctionalComponent(__VLS_160, new __VLS_160({
            type: (scope.row.status === 'completed' ? 'success' : 'warning'),
        }));
        const __VLS_162 = __VLS_161({
            type: (scope.row.status === 'completed' ? 'success' : 'warning'),
        }, ...__VLS_functionalComponentArgsRest(__VLS_161));
        __VLS_163.slots.default;
        (scope.row.status === 'completed' ? '已完成' : '处理中');
        var __VLS_163;
    }
    var __VLS_159;
    const __VLS_164 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_165 = __VLS_asFunctionalComponent(__VLS_164, new __VLS_164({
        prop: "result",
        label: "返回结果",
        minWidth: "150",
        showOverflowTooltip: true,
    }));
    const __VLS_166 = __VLS_165({
        prop: "result",
        label: "返回结果",
        minWidth: "150",
        showOverflowTooltip: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_165));
    __VLS_167.slots.default;
    {
        const { default: __VLS_thisSlot } = __VLS_167.slots;
        const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: (scope.row.result === '失败' ? 'result-failed' : 'result-content') },
        });
        (scope.row.result);
    }
    var __VLS_167;
    const __VLS_168 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_169 = __VLS_asFunctionalComponent(__VLS_168, new __VLS_168({
        label: "操作",
        minWidth: "140",
    }));
    const __VLS_170 = __VLS_169({
        label: "操作",
        minWidth: "140",
    }, ...__VLS_functionalComponentArgsRest(__VLS_169));
    __VLS_171.slots.default;
    {
        const { default: __VLS_thisSlot } = __VLS_171.slots;
        const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "table-operate" },
        });
        const __VLS_172 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_173 = __VLS_asFunctionalComponent(__VLS_172, new __VLS_172({
            ...{ 'onClick': {} },
            size: "small",
            ...{ class: "custom-green-btn" },
            ...{ style: {} },
        }));
        const __VLS_174 = __VLS_173({
            ...{ 'onClick': {} },
            size: "small",
            ...{ class: "custom-green-btn" },
            ...{ style: {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_173));
        let __VLS_176;
        let __VLS_177;
        let __VLS_178;
        const __VLS_179 = {
            onClick: (...[$event]) => {
                if (!(__VLS_ctx.activeTab === 'chat'))
                    return;
                __VLS_ctx.viewChatDetail(scope.row);
            }
        };
        __VLS_175.slots.default;
        var __VLS_175;
        const __VLS_180 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_181 = __VLS_asFunctionalComponent(__VLS_180, new __VLS_180({
            ...{ 'onClick': {} },
            size: "small",
            type: "danger",
        }));
        const __VLS_182 = __VLS_181({
            ...{ 'onClick': {} },
            size: "small",
            type: "danger",
        }, ...__VLS_functionalComponentArgsRest(__VLS_181));
        let __VLS_184;
        let __VLS_185;
        let __VLS_186;
        const __VLS_187 = {
            onClick: (...[$event]) => {
                if (!(__VLS_ctx.activeTab === 'chat'))
                    return;
                __VLS_ctx.deleteChatRecord(scope.row);
            }
        };
        __VLS_183.slots.default;
        var __VLS_183;
    }
    var __VLS_171;
    var __VLS_123;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "chat-actions" },
    });
    const __VLS_188 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_189 = __VLS_asFunctionalComponent(__VLS_188, new __VLS_188({
        ...{ 'onClick': {} },
        ...{ class: "custom-green-btn" },
        loading: (__VLS_ctx.isGeneratingReport),
        disabled: (__VLS_ctx.selectedChatRecords.length === 0),
    }));
    const __VLS_190 = __VLS_189({
        ...{ 'onClick': {} },
        ...{ class: "custom-green-btn" },
        loading: (__VLS_ctx.isGeneratingReport),
        disabled: (__VLS_ctx.selectedChatRecords.length === 0),
    }, ...__VLS_functionalComponentArgsRest(__VLS_189));
    let __VLS_192;
    let __VLS_193;
    let __VLS_194;
    const __VLS_195 = {
        onClick: (__VLS_ctx.generateReportFromChats)
    };
    __VLS_191.slots.default;
    (__VLS_ctx.isGeneratingReport
        ? '生成报告中...'
        : `生成综合报告 (已选${__VLS_ctx.selectedChatRecords.length}条)`);
    var __VLS_191;
}
const __VLS_196 = {}.ElDialog;
/** @type {[typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ]} */ ;
// @ts-ignore
const __VLS_197 = __VLS_asFunctionalComponent(__VLS_196, new __VLS_196({
    modelValue: (__VLS_ctx.showChatDetailDialog),
    title: (`查看会话详情 - ${__VLS_ctx.selectedChatDetail?.tool === 'chat' ? '智能问数' : '数据分析'}`),
    width: "80%",
    destroyOnClose: true,
}));
const __VLS_198 = __VLS_197({
    modelValue: (__VLS_ctx.showChatDetailDialog),
    title: (`查看会话详情 - ${__VLS_ctx.selectedChatDetail?.tool === 'chat' ? '智能问数' : '数据分析'}`),
    width: "80%",
    destroyOnClose: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_197));
__VLS_199.slots.default;
if (__VLS_ctx.selectedChatDetail) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "dialog-section" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    const __VLS_200 = {}.ElDescriptions;
    /** @type {[typeof __VLS_components.ElDescriptions, typeof __VLS_components.elDescriptions, typeof __VLS_components.ElDescriptions, typeof __VLS_components.elDescriptions, ]} */ ;
    // @ts-ignore
    const __VLS_201 = __VLS_asFunctionalComponent(__VLS_200, new __VLS_200({
        column: (2),
        border: true,
    }));
    const __VLS_202 = __VLS_201({
        column: (2),
        border: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_201));
    __VLS_203.slots.default;
    const __VLS_204 = {}.ElDescriptionsItem;
    /** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
    // @ts-ignore
    const __VLS_205 = __VLS_asFunctionalComponent(__VLS_204, new __VLS_204({
        label: "会话ID",
    }));
    const __VLS_206 = __VLS_205({
        label: "会话ID",
    }, ...__VLS_functionalComponentArgsRest(__VLS_205));
    __VLS_207.slots.default;
    (__VLS_ctx.selectedChatDetail.id);
    var __VLS_207;
    const __VLS_208 = {}.ElDescriptionsItem;
    /** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
    // @ts-ignore
    const __VLS_209 = __VLS_asFunctionalComponent(__VLS_208, new __VLS_208({
        label: "工具类型",
    }));
    const __VLS_210 = __VLS_209({
        label: "工具类型",
    }, ...__VLS_functionalComponentArgsRest(__VLS_209));
    __VLS_211.slots.default;
    (__VLS_ctx.selectedChatDetail.tool === 'chat' ? '智能问数' : '数据分析');
    var __VLS_211;
    const __VLS_212 = {}.ElDescriptionsItem;
    /** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
    // @ts-ignore
    const __VLS_213 = __VLS_asFunctionalComponent(__VLS_212, new __VLS_212({
        label: "问题",
    }));
    const __VLS_214 = __VLS_213({
        label: "问题",
    }, ...__VLS_functionalComponentArgsRest(__VLS_213));
    __VLS_215.slots.default;
    (__VLS_ctx.selectedChatDetail.question);
    var __VLS_215;
    const __VLS_216 = {}.ElDescriptionsItem;
    /** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
    // @ts-ignore
    const __VLS_217 = __VLS_asFunctionalComponent(__VLS_216, new __VLS_216({
        label: "数据源",
    }));
    const __VLS_218 = __VLS_217({
        label: "数据源",
    }, ...__VLS_functionalComponentArgsRest(__VLS_217));
    __VLS_219.slots.default;
    (__VLS_ctx.selectedChatDetail.datasource_name);
    var __VLS_219;
    const __VLS_220 = {}.ElDescriptionsItem;
    /** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
    // @ts-ignore
    const __VLS_221 = __VLS_asFunctionalComponent(__VLS_220, new __VLS_220({
        label: "创建时间",
    }));
    const __VLS_222 = __VLS_221({
        label: "创建时间",
    }, ...__VLS_functionalComponentArgsRest(__VLS_221));
    __VLS_223.slots.default;
    (__VLS_ctx.selectedChatDetail.create_time);
    var __VLS_223;
    const __VLS_224 = {}.ElDescriptionsItem;
    /** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
    // @ts-ignore
    const __VLS_225 = __VLS_asFunctionalComponent(__VLS_224, new __VLS_224({
        label: "结束时间",
        span: (2),
    }));
    const __VLS_226 = __VLS_225({
        label: "结束时间",
        span: (2),
    }, ...__VLS_functionalComponentArgsRest(__VLS_225));
    __VLS_227.slots.default;
    (__VLS_ctx.selectedChatDetail.finish_time || '未完成');
    var __VLS_227;
    var __VLS_203;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "dialog-section" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    if (__VLS_ctx.selectedChatDetail.resultType === 'table' &&
        __VLS_ctx.selectedChatDetail.resultData &&
        Array.isArray(__VLS_ctx.selectedChatDetail.resultData)) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        const __VLS_228 = {}.ElTable;
        /** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
        // @ts-ignore
        const __VLS_229 = __VLS_asFunctionalComponent(__VLS_228, new __VLS_228({
            data: (__VLS_ctx.selectedChatDetail.resultData),
            ...{ style: {} },
            border: true,
        }));
        const __VLS_230 = __VLS_229({
            data: (__VLS_ctx.selectedChatDetail.resultData),
            ...{ style: {} },
            border: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_229));
        __VLS_231.slots.default;
        for (const [_, key] of __VLS_getVForSourceType((__VLS_ctx.selectedChatDetail.resultData[0]))) {
            const __VLS_232 = {}.ElTableColumn;
            /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
            // @ts-ignore
            const __VLS_233 = __VLS_asFunctionalComponent(__VLS_232, new __VLS_232({
                key: (key),
                prop: (key),
                label: (key),
            }));
            const __VLS_234 = __VLS_233({
                key: (key),
                prop: (key),
                label: (key),
            }, ...__VLS_functionalComponentArgsRest(__VLS_233));
        }
        var __VLS_231;
    }
    else if (__VLS_ctx.selectedChatDetail.resultType === 'analysis') {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        if (__VLS_ctx.selectedChatDetail.rawData) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "analysis-data" },
            });
            if (__VLS_ctx.selectedChatDetail.rawData.correlation_matrix) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "correlation-result" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
                const __VLS_236 = {}.ElTable;
                /** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
                // @ts-ignore
                const __VLS_237 = __VLS_asFunctionalComponent(__VLS_236, new __VLS_236({
                    data: (__VLS_ctx.selectedChatDetail.rawData.correlation_matrix),
                    border: true,
                }));
                const __VLS_238 = __VLS_237({
                    data: (__VLS_ctx.selectedChatDetail.rawData.correlation_matrix),
                    border: true,
                }, ...__VLS_functionalComponentArgsRest(__VLS_237));
                __VLS_239.slots.default;
                const __VLS_240 = {}.ElTableColumn;
                /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
                // @ts-ignore
                const __VLS_241 = __VLS_asFunctionalComponent(__VLS_240, new __VLS_240({
                    prop: "column",
                    label: "列名",
                    width: "120",
                }));
                const __VLS_242 = __VLS_241({
                    prop: "column",
                    label: "列名",
                    width: "120",
                }, ...__VLS_functionalComponentArgsRest(__VLS_241));
                for (const [col] of __VLS_getVForSourceType((__VLS_ctx.selectedChatDetail.correlationColumns))) {
                    const __VLS_244 = {}.ElTableColumn;
                    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
                    // @ts-ignore
                    const __VLS_245 = __VLS_asFunctionalComponent(__VLS_244, new __VLS_244({
                        key: (col),
                        prop: (col),
                        label: (col),
                    }));
                    const __VLS_246 = __VLS_245({
                        key: (col),
                        prop: (col),
                        label: (col),
                    }, ...__VLS_functionalComponentArgsRest(__VLS_245));
                }
                var __VLS_239;
                if (__VLS_ctx.selectedChatDetail.rawData.charts &&
                    __VLS_ctx.selectedChatDetail.rawData.charts.correlation_matrix) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                        ...{ class: "chart-container" },
                    });
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
                        src: (__VLS_ctx.selectedChatDetail.rawData.charts.correlation_matrix),
                        alt: "相关性矩阵热力图",
                        ...{ style: {} },
                    });
                }
            }
            if (__VLS_ctx.selectedChatDetail.rawData.stats) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "descriptive-result" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
                for (const [stats, column] of __VLS_getVForSourceType((__VLS_ctx.selectedChatDetail.rawData.stats))) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                        key: (column),
                    });
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.h5, __VLS_intrinsicElements.h5)({});
                    (column);
                    const __VLS_248 = {}.ElTable;
                    /** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
                    // @ts-ignore
                    const __VLS_249 = __VLS_asFunctionalComponent(__VLS_248, new __VLS_248({
                        data: ([stats]),
                        border: true,
                    }));
                    const __VLS_250 = __VLS_249({
                        data: ([stats]),
                        border: true,
                    }, ...__VLS_functionalComponentArgsRest(__VLS_249));
                    __VLS_251.slots.default;
                    for (const [_, key] of __VLS_getVForSourceType((stats))) {
                        const __VLS_252 = {}.ElTableColumn;
                        /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
                        // @ts-ignore
                        const __VLS_253 = __VLS_asFunctionalComponent(__VLS_252, new __VLS_252({
                            key: (key),
                            prop: (key),
                            label: (key),
                        }));
                        const __VLS_254 = __VLS_253({
                            key: (key),
                            prop: (key),
                            label: (key),
                        }, ...__VLS_functionalComponentArgsRest(__VLS_253));
                    }
                    var __VLS_251;
                    if (__VLS_ctx.selectedChatDetail.rawData.charts &&
                        __VLS_ctx.selectedChatDetail.rawData.charts[column]) {
                        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                            ...{ class: "chart-container" },
                        });
                        __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
                            src: (__VLS_ctx.selectedChatDetail.rawData.charts[column]),
                            alt: (`${column}统计图表`),
                            ...{ style: {} },
                        });
                    }
                }
            }
            if (__VLS_ctx.selectedChatDetail.rawData.clusters) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "clusters-result" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
                if (__VLS_ctx.selectedChatDetail.rawData.clusters.centers) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.h5, __VLS_intrinsicElements.h5)({});
                    const __VLS_256 = {}.ElTable;
                    /** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
                    // @ts-ignore
                    const __VLS_257 = __VLS_asFunctionalComponent(__VLS_256, new __VLS_256({
                        data: (__VLS_ctx.selectedChatDetail.rawData.clusters.centers),
                        border: true,
                    }));
                    const __VLS_258 = __VLS_257({
                        data: (__VLS_ctx.selectedChatDetail.rawData.clusters.centers),
                        border: true,
                    }, ...__VLS_functionalComponentArgsRest(__VLS_257));
                    __VLS_259.slots.default;
                    for (const [key] of __VLS_getVForSourceType((Object.keys(__VLS_ctx.selectedChatDetail.rawData.clusters.centers[0] || {})))) {
                        const __VLS_260 = {}.ElTableColumn;
                        /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
                        // @ts-ignore
                        const __VLS_261 = __VLS_asFunctionalComponent(__VLS_260, new __VLS_260({
                            key: (key),
                            prop: (key),
                            label: (key),
                        }));
                        const __VLS_262 = __VLS_261({
                            key: (key),
                            prop: (key),
                            label: (key),
                        }, ...__VLS_functionalComponentArgsRest(__VLS_261));
                    }
                    var __VLS_259;
                }
                if (__VLS_ctx.selectedChatDetail.rawData.clusters.counts) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.h5, __VLS_intrinsicElements.h5)({});
                    const __VLS_264 = {}.ElTable;
                    /** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
                    // @ts-ignore
                    const __VLS_265 = __VLS_asFunctionalComponent(__VLS_264, new __VLS_264({
                        data: (__VLS_ctx.selectedChatDetail.rawData.clusters.counts),
                        border: true,
                    }));
                    const __VLS_266 = __VLS_265({
                        data: (__VLS_ctx.selectedChatDetail.rawData.clusters.counts),
                        border: true,
                    }, ...__VLS_functionalComponentArgsRest(__VLS_265));
                    __VLS_267.slots.default;
                    const __VLS_268 = {}.ElTableColumn;
                    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
                    // @ts-ignore
                    const __VLS_269 = __VLS_asFunctionalComponent(__VLS_268, new __VLS_268({
                        prop: "cluster",
                        label: "簇",
                    }));
                    const __VLS_270 = __VLS_269({
                        prop: "cluster",
                        label: "簇",
                    }, ...__VLS_functionalComponentArgsRest(__VLS_269));
                    const __VLS_272 = {}.ElTableColumn;
                    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
                    // @ts-ignore
                    const __VLS_273 = __VLS_asFunctionalComponent(__VLS_272, new __VLS_272({
                        prop: "count",
                        label: "数量",
                    }));
                    const __VLS_274 = __VLS_273({
                        prop: "count",
                        label: "数量",
                    }, ...__VLS_functionalComponentArgsRest(__VLS_273));
                    const __VLS_276 = {}.ElTableColumn;
                    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
                    // @ts-ignore
                    const __VLS_277 = __VLS_asFunctionalComponent(__VLS_276, new __VLS_276({
                        prop: "percentage",
                        label: "占比",
                    }));
                    const __VLS_278 = __VLS_277({
                        prop: "percentage",
                        label: "占比",
                    }, ...__VLS_functionalComponentArgsRest(__VLS_277));
                    var __VLS_267;
                }
                if (__VLS_ctx.selectedChatDetail.rawData.charts &&
                    __VLS_ctx.selectedChatDetail.rawData.charts.cluster_plot) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
                        src: (__VLS_ctx.selectedChatDetail.rawData.charts.cluster_plot),
                        alt: "聚类分布图",
                        ...{ style: {} },
                    });
                }
            }
            if (__VLS_ctx.selectedChatDetail.rawData.regression) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "regression-result" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
                __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
                (__VLS_ctx.selectedChatDetail.rawData.regression.mse);
                __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
                (__VLS_ctx.selectedChatDetail.rawData.regression.r2_score);
                if (__VLS_ctx.selectedChatDetail.rawData.regression.coefficients) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.h5, __VLS_intrinsicElements.h5)({});
                    const __VLS_280 = {}.ElTable;
                    /** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
                    // @ts-ignore
                    const __VLS_281 = __VLS_asFunctionalComponent(__VLS_280, new __VLS_280({
                        data: (__VLS_ctx.selectedChatDetail.rawData.regression.coefficients),
                        border: true,
                    }));
                    const __VLS_282 = __VLS_281({
                        data: (__VLS_ctx.selectedChatDetail.rawData.regression.coefficients),
                        border: true,
                    }, ...__VLS_functionalComponentArgsRest(__VLS_281));
                    __VLS_283.slots.default;
                    const __VLS_284 = {}.ElTableColumn;
                    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
                    // @ts-ignore
                    const __VLS_285 = __VLS_asFunctionalComponent(__VLS_284, new __VLS_284({
                        prop: "feature",
                        label: "特征",
                    }));
                    const __VLS_286 = __VLS_285({
                        prop: "feature",
                        label: "特征",
                    }, ...__VLS_functionalComponentArgsRest(__VLS_285));
                    const __VLS_288 = {}.ElTableColumn;
                    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
                    // @ts-ignore
                    const __VLS_289 = __VLS_asFunctionalComponent(__VLS_288, new __VLS_288({
                        prop: "coefficient",
                        label: "系数",
                    }));
                    const __VLS_290 = __VLS_289({
                        prop: "coefficient",
                        label: "系数",
                    }, ...__VLS_functionalComponentArgsRest(__VLS_289));
                    var __VLS_283;
                }
                if (__VLS_ctx.selectedChatDetail.rawData.charts &&
                    __VLS_ctx.selectedChatDetail.rawData.charts.regression_plot) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
                        src: (__VLS_ctx.selectedChatDetail.rawData.charts.regression_plot),
                        alt: "回归拟合图",
                        ...{ style: {} },
                    });
                }
            }
            if (__VLS_ctx.selectedChatDetail.rawData.anomalies) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "anomaly-result" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
                for (const [anomaly, colName] of __VLS_getVForSourceType((__VLS_ctx.selectedChatDetail.rawData.anomalies))) {
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
                if (__VLS_ctx.selectedChatDetail.rawData.charts &&
                    __VLS_ctx.selectedChatDetail.rawData.charts.anomaly_plot) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
                        src: (__VLS_ctx.selectedChatDetail.rawData.charts.anomaly_plot),
                        alt: "异常检测图",
                        ...{ style: {} },
                    });
                }
            }
            if (__VLS_ctx.selectedChatDetail.rawData.distributions) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "distribution-result" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
                for (const [dist, column] of __VLS_getVForSourceType((__VLS_ctx.selectedChatDetail.rawData.distributions))) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                        key: (column),
                    });
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.h5, __VLS_intrinsicElements.h5)({});
                    (column);
                    if (dist.quantiles) {
                        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
                        __VLS_asFunctionalElement(__VLS_intrinsicElements.h6, __VLS_intrinsicElements.h6)({});
                        const __VLS_292 = {}.ElTable;
                        /** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
                        // @ts-ignore
                        const __VLS_293 = __VLS_asFunctionalComponent(__VLS_292, new __VLS_292({
                            data: ([dist.quantiles]),
                            border: true,
                        }));
                        const __VLS_294 = __VLS_293({
                            data: ([dist.quantiles]),
                            border: true,
                        }, ...__VLS_functionalComponentArgsRest(__VLS_293));
                        __VLS_295.slots.default;
                        for (const [_, key] of __VLS_getVForSourceType((dist.quantiles))) {
                            const __VLS_296 = {}.ElTableColumn;
                            /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
                            // @ts-ignore
                            const __VLS_297 = __VLS_asFunctionalComponent(__VLS_296, new __VLS_296({
                                key: (key),
                                prop: (key),
                                label: (`${key}分位数`),
                            }));
                            const __VLS_298 = __VLS_297({
                                key: (key),
                                prop: (key),
                                label: (`${key}分位数`),
                            }, ...__VLS_functionalComponentArgsRest(__VLS_297));
                        }
                        var __VLS_295;
                    }
                    if (__VLS_ctx.selectedChatDetail.rawData.charts &&
                        __VLS_ctx.selectedChatDetail.rawData.charts[column]) {
                        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
                        __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
                            src: (__VLS_ctx.selectedChatDetail.rawData.charts[column]),
                            alt: (`${column}分布图`),
                            ...{ style: {} },
                        });
                    }
                }
            }
            if (__VLS_ctx.selectedChatDetail.rawData.trends) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "trend-result" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
                if (__VLS_ctx.selectedChatDetail.rawData.charts &&
                    __VLS_ctx.selectedChatDetail.rawData.charts.trend_plot) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
                        src: (__VLS_ctx.selectedChatDetail.rawData.charts.trend_plot),
                        alt: "趋势图",
                        ...{ style: {} },
                    });
                }
            }
            if (__VLS_ctx.selectedChatDetail.rawData.time_series) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "timeseries-result" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
                __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
                (__VLS_ctx.selectedChatDetail.rawData.time_series.mean);
                __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
                (__VLS_ctx.selectedChatDetail.rawData.time_series.std);
                if (__VLS_ctx.selectedChatDetail.rawData.charts &&
                    __VLS_ctx.selectedChatDetail.rawData.charts.time_series_plot) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
                        src: (__VLS_ctx.selectedChatDetail.rawData.charts.time_series_plot),
                        alt: "时间序列图",
                        ...{ style: {} },
                    });
                }
            }
        }
        if (__VLS_ctx.selectedChatDetail.resultData.content) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "analysis-content" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "markdown-content" },
            });
            __VLS_asFunctionalDirective(__VLS_directives.vHtml)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.renderMarkdown(__VLS_ctx.selectedChatDetail.resultData.content)) }, null, null);
        }
    }
    else if (__VLS_ctx.selectedChatDetail.resultData && __VLS_ctx.selectedChatDetail.resultData.content) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "text-content" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.pre, __VLS_intrinsicElements.pre)({});
        (__VLS_ctx.selectedChatDetail.resultData.content);
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
var __VLS_199;
if (__VLS_ctx.generatedReport) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "generated-report" },
    });
    const __VLS_300 = {}.ElDivider;
    /** @type {[typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, ]} */ ;
    // @ts-ignore
    const __VLS_301 = __VLS_asFunctionalComponent(__VLS_300, new __VLS_300({
        contentPosition: "left",
    }));
    const __VLS_302 = __VLS_301({
        contentPosition: "left",
    }, ...__VLS_functionalComponentArgsRest(__VLS_301));
    __VLS_303.slots.default;
    var __VLS_303;
    const __VLS_304 = {}.ElCard;
    /** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
    // @ts-ignore
    const __VLS_305 = __VLS_asFunctionalComponent(__VLS_304, new __VLS_304({
        ...{ class: "report-content" },
    }));
    const __VLS_306 = __VLS_305({
        ...{ class: "report-content" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_305));
    __VLS_307.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "report-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    (__VLS_ctx.generatedReport.name);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "report-time" },
    });
    (__VLS_ctx.generatedReport.create_time);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "markdown-content" },
    });
    __VLS_asFunctionalDirective(__VLS_directives.vHtml)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.renderMarkdown(__VLS_ctx.generatedReport.report_content || '')) }, null, null);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "report-actions" },
    });
    const __VLS_308 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_309 = __VLS_asFunctionalComponent(__VLS_308, new __VLS_308({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_310 = __VLS_309({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_309));
    let __VLS_312;
    let __VLS_313;
    let __VLS_314;
    const __VLS_315 = {
        onClick: (__VLS_ctx.editReport)
    };
    __VLS_311.slots.default;
    var __VLS_311;
    const __VLS_316 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_317 = __VLS_asFunctionalComponent(__VLS_316, new __VLS_316({
        ...{ 'onClick': {} },
    }));
    const __VLS_318 = __VLS_317({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_317));
    let __VLS_320;
    let __VLS_321;
    let __VLS_322;
    const __VLS_323 = {
        onClick: (__VLS_ctx.downloadReport)
    };
    __VLS_319.slots.default;
    var __VLS_319;
    var __VLS_307;
}
const __VLS_324 = {}.ElDivider;
/** @type {[typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, ]} */ ;
// @ts-ignore
const __VLS_325 = __VLS_asFunctionalComponent(__VLS_324, new __VLS_324({
    contentPosition: "left",
}));
const __VLS_326 = __VLS_325({
    contentPosition: "left",
}, ...__VLS_functionalComponentArgsRest(__VLS_325));
__VLS_327.slots.default;
var __VLS_327;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "reports-table-wrapper" },
});
const __VLS_328 = {}.ElTable;
/** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
// @ts-ignore
const __VLS_329 = __VLS_asFunctionalComponent(__VLS_328, new __VLS_328({
    data: (__VLS_ctx.reports),
    ...{ style: {} },
    border: true,
    stripe: true,
    highlightCurrentRow: true,
    fit: true,
}));
const __VLS_330 = __VLS_329({
    data: (__VLS_ctx.reports),
    ...{ style: {} },
    border: true,
    stripe: true,
    highlightCurrentRow: true,
    fit: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_329));
__VLS_331.slots.default;
const __VLS_332 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_333 = __VLS_asFunctionalComponent(__VLS_332, new __VLS_332({
    prop: "name",
    label: "名称",
    minWidth: "200",
    align: "left",
    showOverflowTooltip: true,
}));
const __VLS_334 = __VLS_333({
    prop: "name",
    label: "名称",
    minWidth: "200",
    align: "left",
    showOverflowTooltip: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_333));
const __VLS_336 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_337 = __VLS_asFunctionalComponent(__VLS_336, new __VLS_336({
    prop: "create_time",
    label: "创建时间",
    minWidth: "160",
    align: "center",
    showOverflowTooltip: true,
}));
const __VLS_338 = __VLS_337({
    prop: "create_time",
    label: "创建时间",
    minWidth: "160",
    align: "center",
    showOverflowTooltip: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_337));
const __VLS_340 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_341 = __VLS_asFunctionalComponent(__VLS_340, new __VLS_340({
    prop: "status",
    label: "状态",
    minWidth: "80",
    align: "center",
}));
const __VLS_342 = __VLS_341({
    prop: "status",
    label: "状态",
    minWidth: "80",
    align: "center",
}, ...__VLS_functionalComponentArgsRest(__VLS_341));
__VLS_343.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_343.slots;
    const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_344 = {}.ElTag;
    /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
    // @ts-ignore
    const __VLS_345 = __VLS_asFunctionalComponent(__VLS_344, new __VLS_344({
        type: (scope.row.status === 'generated' ? 'success' : 'warning'),
        size: "small",
    }));
    const __VLS_346 = __VLS_345({
        type: (scope.row.status === 'generated' ? 'success' : 'warning'),
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_345));
    __VLS_347.slots.default;
    (scope.row.status === 'generated' ? '已生成' : scope.row.status);
    var __VLS_347;
}
var __VLS_343;
const __VLS_348 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_349 = __VLS_asFunctionalComponent(__VLS_348, new __VLS_348({
    label: "操作",
    minWidth: "120",
    align: "center",
}));
const __VLS_350 = __VLS_349({
    label: "操作",
    minWidth: "120",
    align: "center",
}, ...__VLS_functionalComponentArgsRest(__VLS_349));
__VLS_351.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_351.slots;
    const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ style: {} },
    });
    const __VLS_352 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_353 = __VLS_asFunctionalComponent(__VLS_352, new __VLS_352({
        ...{ 'onClick': {} },
        size: "small",
        type: "primary",
    }));
    const __VLS_354 = __VLS_353({
        ...{ 'onClick': {} },
        size: "small",
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_353));
    let __VLS_356;
    let __VLS_357;
    let __VLS_358;
    const __VLS_359 = {
        onClick: (...[$event]) => {
            __VLS_ctx.viewReport(scope.row.id);
        }
    };
    __VLS_355.slots.default;
    var __VLS_355;
    const __VLS_360 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_361 = __VLS_asFunctionalComponent(__VLS_360, new __VLS_360({
        ...{ 'onClick': {} },
        size: "small",
        type: "danger",
    }));
    const __VLS_362 = __VLS_361({
        ...{ 'onClick': {} },
        size: "small",
        type: "danger",
    }, ...__VLS_functionalComponentArgsRest(__VLS_361));
    let __VLS_364;
    let __VLS_365;
    let __VLS_366;
    const __VLS_367 = {
        onClick: (...[$event]) => {
            __VLS_ctx.deleteReport(scope.row.id);
        }
    };
    __VLS_363.slots.default;
    var __VLS_363;
}
var __VLS_351;
var __VLS_331;
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['report-container']} */ ;
/** @type {__VLS_StyleScopedClasses['report-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-header']} */ ;
/** @type {__VLS_StyleScopedClasses['report-tabs']} */ ;
/** @type {__VLS_StyleScopedClasses['template-input-section']} */ ;
/** @type {__VLS_StyleScopedClasses['input-mode-selector']} */ ;
/** @type {__VLS_StyleScopedClasses['upload-section']} */ ;
/** @type {__VLS_StyleScopedClasses['upload-area']} */ ;
/** @type {__VLS_StyleScopedClasses['drag-over']} */ ;
/** @type {__VLS_StyleScopedClasses['upload-input']} */ ;
/** @type {__VLS_StyleScopedClasses['upload-content']} */ ;
/** @type {__VLS_StyleScopedClasses['upload-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['upload-hint']} */ ;
/** @type {__VLS_StyleScopedClasses['input-section']} */ ;
/** @type {__VLS_StyleScopedClasses['template-textarea']} */ ;
/** @type {__VLS_StyleScopedClasses['parse-button']} */ ;
/** @type {__VLS_StyleScopedClasses['focus-content']} */ ;
/** @type {__VLS_StyleScopedClasses['focus-header']} */ ;
/** @type {__VLS_StyleScopedClasses['focus-title']} */ ;
/** @type {__VLS_StyleScopedClasses['clear-button']} */ ;
/** @type {__VLS_StyleScopedClasses['focus-card']} */ ;
/** @type {__VLS_StyleScopedClasses['focus-text']} */ ;
/** @type {__VLS_StyleScopedClasses['datasource-section']} */ ;
/** @type {__VLS_StyleScopedClasses['datasource-selector']} */ ;
/** @type {__VLS_StyleScopedClasses['datasource-select']} */ ;
/** @type {__VLS_StyleScopedClasses['selected-datasource-info']} */ ;
/** @type {__VLS_StyleScopedClasses['info-label']} */ ;
/** @type {__VLS_StyleScopedClasses['info-value']} */ ;
/** @type {__VLS_StyleScopedClasses['template-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['action-button']} */ ;
/** @type {__VLS_StyleScopedClasses['custom-green-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['action-button']} */ ;
/** @type {__VLS_StyleScopedClasses['questions-section']} */ ;
/** @type {__VLS_StyleScopedClasses['questions-header']} */ ;
/** @type {__VLS_StyleScopedClasses['questions-title']} */ ;
/** @type {__VLS_StyleScopedClasses['questions-container']} */ ;
/** @type {__VLS_StyleScopedClasses['questions-group']} */ ;
/** @type {__VLS_StyleScopedClasses['question-item']} */ ;
/** @type {__VLS_StyleScopedClasses['question-index']} */ ;
/** @type {__VLS_StyleScopedClasses['question-text']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-summary-container']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-content']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-section']} */ ;
/** @type {__VLS_StyleScopedClasses['table-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['table-operate']} */ ;
/** @type {__VLS_StyleScopedClasses['custom-green-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['custom-green-btn']} */ ;
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
/** @type {__VLS_StyleScopedClasses['generated-report']} */ ;
/** @type {__VLS_StyleScopedClasses['report-content']} */ ;
/** @type {__VLS_StyleScopedClasses['report-header']} */ ;
/** @type {__VLS_StyleScopedClasses['report-time']} */ ;
/** @type {__VLS_StyleScopedClasses['markdown-content']} */ ;
/** @type {__VLS_StyleScopedClasses['report-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['reports-table-wrapper']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            Upload: Upload,
            activeTab: activeTab,
            isDragOver: isDragOver,
            parsedFocusContent: parsedFocusContent,
            generatedQuestions: generatedQuestions,
            selectedQuestions: selectedQuestions,
            isGeneratingQuestions: isGeneratingQuestions,
            fileInput: fileInput,
            templateInputMode: templateInputMode,
            templateContent: templateContent,
            handleUploadClick: handleUploadClick,
            chatRecords: chatRecords,
            selectedChatRecords: selectedChatRecords,
            showChatDetailDialog: showChatDetailDialog,
            selectedChatDetail: selectedChatDetail,
            isGeneratingReport: isGeneratingReport,
            generatedReport: generatedReport,
            datasourceList: datasourceList,
            selectedDatasource: selectedDatasource,
            reports: reports,
            handleDrop: handleDrop,
            handleFileSelect: handleFileSelect,
            parseTemplateContent: parseTemplateContent,
            clearFocusContent: clearFocusContent,
            selectAllQuestions: selectAllQuestions,
            deselectAllQuestions: deselectAllQuestions,
            generateQuestions: generateQuestions,
            generateReportFromTemplate: generateReportFromTemplate,
            handleChatSelectionChange: handleChatSelectionChange,
            viewChatDetail: viewChatDetail,
            deleteChatRecord: deleteChatRecord,
            generateReportFromChats: generateReportFromChats,
            viewReport: viewReport,
            editReport: editReport,
            downloadReport: downloadReport,
            deleteReport: deleteReport,
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
