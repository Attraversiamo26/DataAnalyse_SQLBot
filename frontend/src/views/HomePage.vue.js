import { ref, onMounted, nextTick, computed } from 'vue';
import { useRouter } from 'vue-router';
import { Upload, Document } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { datasourceApi } from '@/api/datasource.ts';
import { chatApi, ChatRecord } from '@/api/chat.ts';
import ChartAnswer from '@/views/chat/answer/ChartAnswer.vue';
import AnalysisAnswer from '@/views/chat/answer/AnalysisAnswer.vue';
const router = useRouter();
const datasources = ref([]);
const selectedDataSource = ref('');
const uploadedFile = ref(null);
const currentTableName = ref('');
const tables = ref([]);
const currentChatId = ref();
const currentChatInfo = ref(null);
const chatContainer = ref(null);
const userInput = ref('');
const isTyping = ref(false);
const loading = ref(false);
let chartAnswerRef = null;
let analysisAnswerRef = null;
const computedMessages = computed(() => {
    const messages = [];
    if (!currentChatInfo.value) {
        return messages;
    }
    for (let i = 0; i < currentChatInfo.value.records.length; i++) {
        const record = currentChatInfo.value.records[i];
        if (record.question !== undefined && !record.first_chat) {
            messages.push({
                role: 'user',
                create_time: record.create_time,
                record: record,
                content: record.question,
                index: i,
            });
        }
        messages.push({
            role: 'assistant',
            create_time: record.create_time,
            record: record,
            isTyping: i === currentChatInfo.value.records.length - 1 && isTyping.value,
            first_chat: record.first_chat,
            recommended_question: record.recommended_question,
            index: i,
        });
    }
    return messages;
});
const navigateTo = (path) => {
    router.push(path);
};
const formatTime = (time) => {
    if (!time)
        return '';
    const date = new Date(time);
    return date.toLocaleString();
};
const loadDataSources = async () => {
    try {
        const data = await datasourceApi.list();
        datasources.value = data.map((item) => ({
            id: item.id,
            name: item.name,
            type: 'database'
        }));
    }
    catch (error) {
        console.error('加载数据源失败:', error);
    }
};
const handleTableChange = (value) => {
    console.log('用户选择的表名:', value);
    currentTableName.value = value;
};
const handleDataSourceChange = async () => {
    if (!selectedDataSource.value) {
        return;
    }
    try {
        const [id] = selectedDataSource.value.split(':');
        const dataSourceId = parseInt(id);
        // 获取数据源的表名
        try {
            const tablesResult = await datasourceApi.getTables(dataSourceId);
            console.log('获取表名结果:', tablesResult);
            if (tablesResult?.length > 0) {
                tables.value = tablesResult;
                currentTableName.value = tablesResult[0].tableName;
                console.log('设置表名:', currentTableName.value);
            }
            else {
                console.error('未获取到表名:', tablesResult);
                tables.value = [];
                currentTableName.value = '';
            }
        }
        catch (error) {
            console.error('获取表名失败:', error);
            tables.value = [];
            currentTableName.value = '';
        }
        const chatInfo = await chatApi.startChat({ datasource: dataSourceId });
        currentChatId.value = chatInfo.id;
        currentChatInfo.value = chatInfo;
        ElMessage.success('数据源选择成功，已创建临时会话');
    }
    catch (error) {
        console.error('处理数据源选择失败:', error);
        ElMessage.error('数据源选择失败');
    }
};
const handleFileChange = async (file) => {
    if (!file.raw)
        return;
    try {
        uploadedFile.value = file;
        const formData = new FormData();
        formData.append('file', file.raw);
        const axios = (await import('axios')).default;
        const response = await axios.post(import.meta.env.VITE_API_BASE_URL + '/datasource/parseExcel', formData, {
            headers: {}
        });
        const parseResult = response.data?.code === 0 ? response.data.data : response.data;
        const sheetData = parseResult.data || [];
        if (!sheetData.length) {
            throw new Error('文件解析失败，没有数据');
        }
        const firstSheet = sheetData[0];
        const importResult = await datasourceApi.importToDb({
            filePath: parseResult.filePath,
            sheets: [{
                    sheetName: firstSheet.sheetName,
                    fields: firstSheet.fields
                }]
        });
        if (!importResult?.sheets?.length) {
            throw new Error('数据导入失败');
        }
        const importedSheet = importResult.sheets[0];
        // 设置表名
        currentTableName.value = importedSheet.tableName;
        const dsResult = await datasourceApi.add({
            name: `上传文件_${file.name}_${Date.now()}`,
            type: 'excel',
            configuration: {
                sheets: [{
                        tableName: importedSheet.tableName
                    }]
            }
        });
        if (!dsResult?.id) {
            throw new Error('数据源创建失败');
        }
        const chatInfo = await chatApi.startChat({
            datasource: dsResult.id
        });
        currentChatId.value = chatInfo.id;
        currentChatInfo.value = chatInfo;
        await loadDataSources();
        if (dsResult.id) {
            selectedDataSource.value = `${dsResult.id}:database`;
        }
        ElMessage.success('文件上传成功，已创建临时会话');
    }
    catch (error) {
        console.error('文件上传失败:', error);
        ElMessage.error(error.message || '文件上传失败');
    }
};
const clearUploadedFile = () => {
    uploadedFile.value = null;
};
const clearSession = () => {
    currentChatId.value = undefined;
    currentChatInfo.value = null;
    selectedDataSource.value = '';
    currentTableName.value = '';
    clearUploadedFile();
};
const handleKeyEnter = () => {
    if (userInput.value.trim()) {
        startAnalysis();
    }
};
const startAnalysis = async () => {
    if (!userInput.value.trim() || !currentChatId.value) {
        return;
    }
    if (!currentChatInfo.value) {
        ElMessage.error('请先选择数据源或上传文件');
        return;
    }
    try {
        loading.value = true;
        isTyping.value = true;
        // 创建新记录，不再使用临时id
        const newRecord = new ChatRecord();
        newRecord.chat_id = currentChatId.value;
        newRecord.question = userInput.value;
        newRecord.sql_answer = '';
        newRecord.sql = '';
        newRecord.chart_answer = '';
        newRecord.chart = '';
        newRecord.create_time = new Date();
        currentChatInfo.value.records.push(newRecord);
        const userQuestion = userInput.value;
        userInput.value = '';
        await nextTick();
        scrollToBottom();
        // 调用后端意图识别接口
        console.log('开始调用意图识别接口...');
        try {
            // 从selectedDataSource中获取数据源ID
            const [id] = selectedDataSource.value.split(':');
            const dataSourceId = parseInt(id);
            console.log('请求数据:', {
                question: userQuestion,
                datasource_id: dataSourceId,
                table_name: currentTableName.value,
                chat_id: currentChatId.value
            });
            const apiUrl = import.meta.env.VITE_API_BASE_URL + '/home/chat';
            console.log('API调用路径:', apiUrl);
            console.log('传递的参数:', {
                question: userQuestion,
                datasource_id: dataSourceId,
                table_name: currentTableName.value,
                chat_id: currentChatId.value
            });
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    question: userQuestion,
                    datasource_id: dataSourceId,
                    table_name: currentTableName.value,
                    chat_id: currentChatId.value
                })
            });
            console.log('响应状态:', response.status);
            console.log('响应头:', response.headers);
            const responseText = await response.text();
            console.log('响应文本:', responseText);
            if (!responseText) {
                throw new Error('空响应');
            }
            const result = JSON.parse(responseText);
            console.log('解析后的结果:', result);
            // 处理后端返回的包装结构
            const actualResult = result.data || result;
            console.log('实际结果:', actualResult);
            if (actualResult.success) {
                console.log('意图识别成功，工具类型:', actualResult.tool);
                // 更新chat_id（如果后端返回了新的）
                if (actualResult.result && actualResult.result.chat_id) {
                    currentChatId.value = actualResult.result.chat_id;
                    console.log('更新Chat ID:', currentChatId.value);
                }
                if (actualResult.tool === 'analysis') {
                    // 调用数据分析功能
                    ElMessage.success('数据分析已完成！');
                    console.log('开始处理数据分析任务...');
                    const lastIndex = currentChatInfo.value?.records.length - 1;
                    // 设置分析结果
                    if (lastIndex !== undefined && lastIndex >= 0 && actualResult.result) {
                        currentChatInfo.value.records[lastIndex].analysis_record_id = actualResult.result.analysis_record_id;
                        currentChatInfo.value.records[lastIndex].analysis = actualResult.result.report;
                        currentChatInfo.value.records[lastIndex].data = actualResult.result.result;
                        console.log('设置分析结果:', actualResult.result);
                    }
                    isTyping.value = false;
                }
                else {
                    // 调用智能问数功能
                    console.log('开始处理智能问数任务...');
                    // 设置record_id
                    const lastIndex = currentChatInfo.value?.records.length - 1;
                    if (lastIndex !== undefined && lastIndex >= 0 && actualResult.result) {
                        currentChatInfo.value.records[lastIndex].id = actualResult.result.record_id;
                        console.log('设置记录ID:', actualResult.result.record_id);
                    }
                    nextTick(async () => {
                        console.log('最后一条记录索引:', lastIndex);
                        console.log('chartAnswerRef:', chartAnswerRef);
                        if (chartAnswerRef && typeof chartAnswerRef.sendMessage === 'function') {
                            console.log('调用ChartAnswer组件的sendMessage方法...');
                            await chartAnswerRef.sendMessage();
                        }
                        else {
                            console.log('ChartAnswer组件还没有完全渲染，或者没有sendMessage方法');
                            // 尝试使用setTimeout延迟一下
                            setTimeout(async () => {
                                if (chartAnswerRef && typeof chartAnswerRef.sendMessage === 'function') {
                                    console.log('延迟后调用ChartAnswer组件的sendMessage方法...');
                                    await chartAnswerRef.sendMessage();
                                }
                                else {
                                    console.log('仍然无法调用sendMessage方法');
                                    isTyping.value = false;
                                    ElMessage.error('智能问数组件初始化失败');
                                }
                            }, 1000);
                        }
                    });
                }
            }
            else {
                throw new Error(result.error || '意图识别失败');
            }
        }
        catch (fetchError) {
            console.error('意图识别接口调用失败:', fetchError);
            throw fetchError;
        }
    }
    catch (error) {
        console.error('分析失败:', error);
        ElMessage.error('分析失败: ' + error.message);
        isTyping.value = false;
    }
    finally {
        loading.value = false;
    }
};
const onChartAnswerFinish = (recordId) => {
    console.log('分析完成:', recordId);
    isTyping.value = false;
    getRecordUsage(recordId);
    nextTick(() => {
        scrollToBottom();
    });
};
const onChartAnswerError = (recordId) => {
    console.log('分析错误:', recordId);
    isTyping.value = false;
    getRecordUsage(recordId);
};
const onAnalysisAnswerFinish = (recordId) => {
    console.log('数据分析完成:', recordId);
    isTyping.value = false;
    getRecordUsage(recordId);
    nextTick(() => {
        scrollToBottom();
    });
};
const onAnalysisAnswerError = (recordId) => {
    console.log('数据分析错误:', recordId);
    isTyping.value = false;
    if (recordId) {
        getRecordUsage(recordId);
    }
};
const onChatStop = () => {
    console.log('聊天停止');
    isTyping.value = false;
    loading.value = false;
};
const getRecordUsage = (recordId) => {
    if (!recordId) {
        console.log('recordId为undefined或null，跳过获取使用情况');
        return;
    }
    // 检查recordId是否是临时ID（临时ID通常是通过Date.now()生成的，比较大）
    // 真实的后端ID通常是较小的整数
    if (recordId > 1000000000000) {
        console.log('recordId是临时ID，跳过获取使用情况');
        return;
    }
    chatApi.get_chart_usage(recordId).then((res) => {
        const logHistory = chatApi.toChatLogHistory(res);
        if (logHistory && currentChatInfo.value) {
            const record = currentChatInfo.value.records.find(r => r.id === recordId);
            if (record) {
                record.duration = logHistory.duration;
                record.finish_time = logHistory.finish_time;
                record.total_tokens = logHistory.total_tokens;
            }
        }
    }).catch((e) => {
        console.error('获取记录使用情况失败:', e);
    });
};
const scrollToBottom = () => {
    nextTick(() => {
        if (chatContainer.value) {
            chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
        }
    });
};
onMounted(async () => {
    await loadDataSources();
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['file-upload']} */ ;
/** @type {__VLS_StyleScopedClasses['file-upload']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "home-container" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "welcome-section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
    ...{ style: {} },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "feature-cards" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.navigateTo('/tools/chat');
        } },
    ...{ class: "feature-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "card-icon chat-icon" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.svg, __VLS_intrinsicElements.svg)({
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 1024 1024",
    ...{ style: {} },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.path, __VLS_intrinsicElements.path)({
    fill: "currentColor",
    d: "m174.72 855.68 135.296-45.12 23.68 11.84C388.096 849.536 448.576 864 512 864c211.84 0 384-166.784 384-352S723.84 160 512 160 128 326.784 128 512c0 69.12 24.96 139.264 70.848 199.232l22.08 28.8-46.272 115.584zm-45.248 82.56A32 32 0 0 1 89.6 896l58.368-145.92C94.72 680.32 64 596.864 64 512 64 299.904 256 96 512 96s448 203.904 448 416-192 416-448 416a461.06 461.06 0 0 1-206.912-48.384l-175.616 58.56z",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.path, __VLS_intrinsicElements.path)({
    fill: "currentColor",
    d: "M352 576h320q32 0 32 32t-32 32H352q-32 0-32-32t32-32m32-192h256q32 0 32 32t-32 32H384q-32 0-32-32t32-32",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.navigateTo('/tools/analysis');
        } },
    ...{ class: "feature-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "card-icon analysis-icon" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.svg, __VLS_intrinsicElements.svg)({
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 1024 1024",
    ...{ style: {} },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.path, __VLS_intrinsicElements.path)({
    fill: "currentColor",
    d: "m665.216 768 110.848 192h-73.856L591.36 768H433.024L322.176 960H248.32l110.848-192H160a32 32 0 0 1-32-32V192H64a32 32 0 0 1 0-64h896a32 32 0 1 1 0 64h-64v544a32 32 0 0 1-32 32zM832 192H192v512h640zM352 448a32 32 0 0 1 32 32v64a32 32 0 0 1-64 0v-64a32 32 0 0 1 32-32m160-64a32 32 0 0 1 32 32v128a32 32 0 0 1-64 0V416a32 32 0 0 1 32-32m160-64a32 32 0 0 1 32 32v192a32 32 0 1 1-64 0V352a32 32 0 0 1 32-32",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.navigateTo('/tools/report');
        } },
    ...{ class: "feature-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "card-icon report-icon" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.svg, __VLS_intrinsicElements.svg)({
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 1024 1024",
    ...{ style: {} },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.path, __VLS_intrinsicElements.path)({
    fill: "currentColor",
    d: "M832 384H576V128H192v768h640zm-26.496-64L640 154.496V320zM160 64h480l256 256v608a32 32 0 0 1-32 32H160a32 32 0 0 1-32-32V96a32 32 0 0 1 32-32m160 448h384v64H320zm0-192h160v64H320zm0 384h384v64H320z",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "chat-section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "chat-history" },
    ref: "chatContainer",
});
/** @type {typeof __VLS_ctx.chatContainer} */ ;
if (__VLS_ctx.currentChatInfo) {
    for (const [msg, index] of __VLS_getVForSourceType((__VLS_ctx.computedMessages))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (index),
            ...{ class: "chat-message-wrapper" },
        });
        if (msg.role === 'user') {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "chat-message user-message" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "message-header" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "message-role" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "message-time" },
            });
            (__VLS_ctx.formatTime(msg.create_time));
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "message-content" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "user-content" },
            });
            (msg.content);
        }
        else {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "chat-message system-message" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "message-header" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "message-role" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "message-time" },
            });
            (__VLS_ctx.formatTime(msg.create_time));
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "message-content" },
            });
            if (msg.record && !msg.record.analysis_record_id && !msg.record.predict_record_id) {
                /** @type {[typeof ChartAnswer, ]} */ ;
                // @ts-ignore
                const __VLS_0 = __VLS_asFunctionalComponent(ChartAnswer, new ChartAnswer({
                    ...{ 'onFinish': {} },
                    ...{ 'onError': {} },
                    ...{ 'onStop': {} },
                    ...{ 'onScrollBottom': {} },
                    ref: (el => { if (__VLS_ctx.currentChatInfo && msg.index === __VLS_ctx.currentChatInfo.records.length - 1)
                        __VLS_ctx.chartAnswerRef = el; }),
                    chatList: ([]),
                    currentChatId: (__VLS_ctx.currentChatId),
                    currentChat: (__VLS_ctx.currentChatInfo),
                    message: (msg),
                    loading: (msg.isTyping),
                    reasoningName: (['sql_answer', 'chart_answer']),
                }));
                const __VLS_1 = __VLS_0({
                    ...{ 'onFinish': {} },
                    ...{ 'onError': {} },
                    ...{ 'onStop': {} },
                    ...{ 'onScrollBottom': {} },
                    ref: (el => { if (__VLS_ctx.currentChatInfo && msg.index === __VLS_ctx.currentChatInfo.records.length - 1)
                        __VLS_ctx.chartAnswerRef = el; }),
                    chatList: ([]),
                    currentChatId: (__VLS_ctx.currentChatId),
                    currentChat: (__VLS_ctx.currentChatInfo),
                    message: (msg),
                    loading: (msg.isTyping),
                    reasoningName: (['sql_answer', 'chart_answer']),
                }, ...__VLS_functionalComponentArgsRest(__VLS_0));
                let __VLS_3;
                let __VLS_4;
                let __VLS_5;
                const __VLS_6 = {
                    onFinish: (__VLS_ctx.onChartAnswerFinish)
                };
                const __VLS_7 = {
                    onError: (__VLS_ctx.onChartAnswerError)
                };
                const __VLS_8 = {
                    onStop: (__VLS_ctx.onChatStop)
                };
                const __VLS_9 = {
                    onScrollBottom: (__VLS_ctx.scrollToBottom)
                };
                var __VLS_2;
            }
            if (msg.record && msg.record.analysis_record_id) {
                /** @type {[typeof AnalysisAnswer, ]} */ ;
                // @ts-ignore
                const __VLS_10 = __VLS_asFunctionalComponent(AnalysisAnswer, new AnalysisAnswer({
                    ...{ 'onFinish': {} },
                    ...{ 'onError': {} },
                    ...{ 'onStop': {} },
                    ref: (el => { if (__VLS_ctx.currentChatInfo && msg.index === __VLS_ctx.currentChatInfo.records.length - 1)
                        __VLS_ctx.analysisAnswerRef = el; }),
                    chatList: ([]),
                    currentChatId: (__VLS_ctx.currentChatId),
                    currentChat: (__VLS_ctx.currentChatInfo),
                    message: (msg),
                    loading: (msg.isTyping),
                }));
                const __VLS_11 = __VLS_10({
                    ...{ 'onFinish': {} },
                    ...{ 'onError': {} },
                    ...{ 'onStop': {} },
                    ref: (el => { if (__VLS_ctx.currentChatInfo && msg.index === __VLS_ctx.currentChatInfo.records.length - 1)
                        __VLS_ctx.analysisAnswerRef = el; }),
                    chatList: ([]),
                    currentChatId: (__VLS_ctx.currentChatId),
                    currentChat: (__VLS_ctx.currentChatInfo),
                    message: (msg),
                    loading: (msg.isTyping),
                }, ...__VLS_functionalComponentArgsRest(__VLS_10));
                let __VLS_13;
                let __VLS_14;
                let __VLS_15;
                const __VLS_16 = {
                    onFinish: (__VLS_ctx.onAnalysisAnswerFinish)
                };
                const __VLS_17 = {
                    onError: (__VLS_ctx.onAnalysisAnswerError)
                };
                const __VLS_18 = {
                    onStop: (__VLS_ctx.onChatStop)
                };
                var __VLS_12;
            }
        }
    }
}
if (!__VLS_ctx.currentChatInfo || __VLS_ctx.computedMessages.length === 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "empty-state" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "chat-input-section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "datasource-section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "datasource-select" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "label" },
});
const __VLS_19 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_20 = __VLS_asFunctionalComponent(__VLS_19, new __VLS_19({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.selectedDataSource),
    placeholder: "请选择数据源",
    ...{ style: {} },
    clearable: true,
}));
const __VLS_21 = __VLS_20({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.selectedDataSource),
    placeholder: "请选择数据源",
    ...{ style: {} },
    clearable: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_20));
let __VLS_23;
let __VLS_24;
let __VLS_25;
const __VLS_26 = {
    onChange: (__VLS_ctx.handleDataSourceChange)
};
__VLS_22.slots.default;
for (const [source] of __VLS_getVForSourceType((__VLS_ctx.datasources))) {
    const __VLS_27 = {}.ElOption;
    /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
    // @ts-ignore
    const __VLS_28 = __VLS_asFunctionalComponent(__VLS_27, new __VLS_27({
        key: (source.id + ':' + source.type),
        label: (source.name),
        value: (source.id + ':' + source.type),
    }));
    const __VLS_29 = __VLS_28({
        key: (source.id + ':' + source.type),
        label: (source.name),
        value: (source.id + ':' + source.type),
    }, ...__VLS_functionalComponentArgsRest(__VLS_28));
}
var __VLS_22;
if (__VLS_ctx.tables.length > 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "table-select" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "label" },
    });
    const __VLS_31 = {}.ElSelect;
    /** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
    // @ts-ignore
    const __VLS_32 = __VLS_asFunctionalComponent(__VLS_31, new __VLS_31({
        ...{ 'onChange': {} },
        modelValue: (__VLS_ctx.currentTableName),
        placeholder: "请选择数据表",
        ...{ style: {} },
    }));
    const __VLS_33 = __VLS_32({
        ...{ 'onChange': {} },
        modelValue: (__VLS_ctx.currentTableName),
        placeholder: "请选择数据表",
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_32));
    let __VLS_35;
    let __VLS_36;
    let __VLS_37;
    const __VLS_38 = {
        onChange: (__VLS_ctx.handleTableChange)
    };
    __VLS_34.slots.default;
    for (const [table] of __VLS_getVForSourceType((__VLS_ctx.tables))) {
        const __VLS_39 = {}.ElOption;
        /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
        // @ts-ignore
        const __VLS_40 = __VLS_asFunctionalComponent(__VLS_39, new __VLS_39({
            key: (table.tableName),
            label: (table.tableName),
            value: (table.tableName),
        }));
        const __VLS_41 = __VLS_40({
            key: (table.tableName),
            label: (table.tableName),
            value: (table.tableName),
        }, ...__VLS_functionalComponentArgsRest(__VLS_40));
    }
    var __VLS_34;
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "file-upload" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "label" },
});
const __VLS_43 = {}.ElUpload;
/** @type {[typeof __VLS_components.ElUpload, typeof __VLS_components.elUpload, typeof __VLS_components.ElUpload, typeof __VLS_components.elUpload, ]} */ ;
// @ts-ignore
const __VLS_44 = __VLS_asFunctionalComponent(__VLS_43, new __VLS_43({
    ...{ class: "file-upload" },
    drag: true,
    autoUpload: (true),
    onChange: (__VLS_ctx.handleFileChange),
    showFileList: (false),
    limit: (1),
    accept: ".xlsx,.xls,.csv",
}));
const __VLS_45 = __VLS_44({
    ...{ class: "file-upload" },
    drag: true,
    autoUpload: (true),
    onChange: (__VLS_ctx.handleFileChange),
    showFileList: (false),
    limit: (1),
    accept: ".xlsx,.xls,.csv",
}, ...__VLS_functionalComponentArgsRest(__VLS_44));
__VLS_46.slots.default;
const __VLS_47 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_48 = __VLS_asFunctionalComponent(__VLS_47, new __VLS_47({
    ...{ class: "el-icon--upload" },
}));
const __VLS_49 = __VLS_48({
    ...{ class: "el-icon--upload" },
}, ...__VLS_functionalComponentArgsRest(__VLS_48));
__VLS_50.slots.default;
const __VLS_51 = {}.Upload;
/** @type {[typeof __VLS_components.Upload, ]} */ ;
// @ts-ignore
const __VLS_52 = __VLS_asFunctionalComponent(__VLS_51, new __VLS_51({}));
const __VLS_53 = __VLS_52({}, ...__VLS_functionalComponentArgsRest(__VLS_52));
var __VLS_50;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "el-upload__text" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "drag-text" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.em, __VLS_intrinsicElements.em)({});
{
    const { tip: __VLS_thisSlot } = __VLS_46.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "el-upload__tip" },
    });
}
var __VLS_46;
if (__VLS_ctx.uploadedFile) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "file-info" },
    });
    const __VLS_55 = {}.Document;
    /** @type {[typeof __VLS_components.Document, ]} */ ;
    // @ts-ignore
    const __VLS_56 = __VLS_asFunctionalComponent(__VLS_55, new __VLS_55({
        ...{ class: "file-icon" },
    }));
    const __VLS_57 = __VLS_56({
        ...{ class: "file-icon" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_56));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "file-name" },
    });
    (__VLS_ctx.uploadedFile.name);
    const __VLS_59 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_60 = __VLS_asFunctionalComponent(__VLS_59, new __VLS_59({
        ...{ 'onClick': {} },
        size: "small",
        type: "danger",
        text: true,
    }));
    const __VLS_61 = __VLS_60({
        ...{ 'onClick': {} },
        size: "small",
        type: "danger",
        text: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_60));
    let __VLS_63;
    let __VLS_64;
    let __VLS_65;
    const __VLS_66 = {
        onClick: (__VLS_ctx.clearUploadedFile)
    };
    __VLS_62.slots.default;
    var __VLS_62;
}
if (__VLS_ctx.currentChatId && __VLS_ctx.currentChatInfo) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "session-info" },
    });
    const __VLS_67 = {}.ElTag;
    /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
    // @ts-ignore
    const __VLS_68 = __VLS_asFunctionalComponent(__VLS_67, new __VLS_67({
        type: "success",
    }));
    const __VLS_69 = __VLS_68({
        type: "success",
    }, ...__VLS_functionalComponentArgsRest(__VLS_68));
    __VLS_70.slots.default;
    (__VLS_ctx.currentChatId);
    var __VLS_70;
    if (__VLS_ctx.currentChatId) {
        const __VLS_71 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_72 = __VLS_asFunctionalComponent(__VLS_71, new __VLS_71({
            ...{ 'onClick': {} },
            text: true,
            type: "primary",
        }));
        const __VLS_73 = __VLS_72({
            ...{ 'onClick': {} },
            text: true,
            type: "primary",
        }, ...__VLS_functionalComponentArgsRest(__VLS_72));
        let __VLS_75;
        let __VLS_76;
        let __VLS_77;
        const __VLS_78 = {
            onClick: (__VLS_ctx.clearSession)
        };
        __VLS_74.slots.default;
        var __VLS_74;
    }
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "input-wrapper" },
});
const __VLS_79 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_80 = __VLS_asFunctionalComponent(__VLS_79, new __VLS_79({
    ...{ 'onKeydown': {} },
    modelValue: (__VLS_ctx.userInput),
    type: "textarea",
    rows: (2),
    placeholder: "请输入您的问题...",
    disabled: (!__VLS_ctx.currentChatId || __VLS_ctx.isTyping),
}));
const __VLS_81 = __VLS_80({
    ...{ 'onKeydown': {} },
    modelValue: (__VLS_ctx.userInput),
    type: "textarea",
    rows: (2),
    placeholder: "请输入您的问题...",
    disabled: (!__VLS_ctx.currentChatId || __VLS_ctx.isTyping),
}, ...__VLS_functionalComponentArgsRest(__VLS_80));
let __VLS_83;
let __VLS_84;
let __VLS_85;
const __VLS_86 = {
    onKeydown: (__VLS_ctx.handleKeyEnter)
};
var __VLS_82;
const __VLS_87 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_88 = __VLS_asFunctionalComponent(__VLS_87, new __VLS_87({
    ...{ 'onClick': {} },
    type: "primary",
    disabled: (!__VLS_ctx.currentChatId || !__VLS_ctx.userInput.trim() || __VLS_ctx.isTyping),
    ...{ style: {} },
    loading: (__VLS_ctx.isTyping),
}));
const __VLS_89 = __VLS_88({
    ...{ 'onClick': {} },
    type: "primary",
    disabled: (!__VLS_ctx.currentChatId || !__VLS_ctx.userInput.trim() || __VLS_ctx.isTyping),
    ...{ style: {} },
    loading: (__VLS_ctx.isTyping),
}, ...__VLS_functionalComponentArgsRest(__VLS_88));
let __VLS_91;
let __VLS_92;
let __VLS_93;
const __VLS_94 = {
    onClick: (__VLS_ctx.startAnalysis)
};
__VLS_90.slots.default;
(__VLS_ctx.isTyping ? '分析中...' : '开始分析');
var __VLS_90;
/** @type {__VLS_StyleScopedClasses['home-container']} */ ;
/** @type {__VLS_StyleScopedClasses['welcome-section']} */ ;
/** @type {__VLS_StyleScopedClasses['feature-cards']} */ ;
/** @type {__VLS_StyleScopedClasses['feature-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['feature-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['analysis-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['feature-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['report-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-section']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-history']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-message-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-message']} */ ;
/** @type {__VLS_StyleScopedClasses['user-message']} */ ;
/** @type {__VLS_StyleScopedClasses['message-header']} */ ;
/** @type {__VLS_StyleScopedClasses['message-role']} */ ;
/** @type {__VLS_StyleScopedClasses['message-time']} */ ;
/** @type {__VLS_StyleScopedClasses['message-content']} */ ;
/** @type {__VLS_StyleScopedClasses['user-content']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-message']} */ ;
/** @type {__VLS_StyleScopedClasses['system-message']} */ ;
/** @type {__VLS_StyleScopedClasses['message-header']} */ ;
/** @type {__VLS_StyleScopedClasses['message-role']} */ ;
/** @type {__VLS_StyleScopedClasses['message-time']} */ ;
/** @type {__VLS_StyleScopedClasses['message-content']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-input-section']} */ ;
/** @type {__VLS_StyleScopedClasses['datasource-section']} */ ;
/** @type {__VLS_StyleScopedClasses['datasource-select']} */ ;
/** @type {__VLS_StyleScopedClasses['label']} */ ;
/** @type {__VLS_StyleScopedClasses['table-select']} */ ;
/** @type {__VLS_StyleScopedClasses['label']} */ ;
/** @type {__VLS_StyleScopedClasses['file-upload']} */ ;
/** @type {__VLS_StyleScopedClasses['label']} */ ;
/** @type {__VLS_StyleScopedClasses['file-upload']} */ ;
/** @type {__VLS_StyleScopedClasses['el-icon--upload']} */ ;
/** @type {__VLS_StyleScopedClasses['el-upload__text']} */ ;
/** @type {__VLS_StyleScopedClasses['drag-text']} */ ;
/** @type {__VLS_StyleScopedClasses['el-upload__tip']} */ ;
/** @type {__VLS_StyleScopedClasses['file-info']} */ ;
/** @type {__VLS_StyleScopedClasses['file-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['file-name']} */ ;
/** @type {__VLS_StyleScopedClasses['session-info']} */ ;
/** @type {__VLS_StyleScopedClasses['input-wrapper']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            Upload: Upload,
            Document: Document,
            ChartAnswer: ChartAnswer,
            AnalysisAnswer: AnalysisAnswer,
            datasources: datasources,
            selectedDataSource: selectedDataSource,
            uploadedFile: uploadedFile,
            currentTableName: currentTableName,
            tables: tables,
            currentChatId: currentChatId,
            currentChatInfo: currentChatInfo,
            chatContainer: chatContainer,
            userInput: userInput,
            isTyping: isTyping,
            chartAnswerRef: chartAnswerRef,
            analysisAnswerRef: analysisAnswerRef,
            computedMessages: computedMessages,
            navigateTo: navigateTo,
            formatTime: formatTime,
            handleTableChange: handleTableChange,
            handleDataSourceChange: handleDataSourceChange,
            handleFileChange: handleFileChange,
            clearUploadedFile: clearUploadedFile,
            clearSession: clearSession,
            handleKeyEnter: handleKeyEnter,
            startAnalysis: startAnalysis,
            onChartAnswerFinish: onChartAnswerFinish,
            onChartAnswerError: onChartAnswerError,
            onAnalysisAnswerFinish: onAnalysisAnswerFinish,
            onAnalysisAnswerError: onAnalysisAnswerError,
            onChatStop: onChatStop,
            scrollToBottom: scrollToBottom,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
