import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Search, Refresh, List, Plus, Document } from '@element-plus/icons-vue';
import { skillManagerApi } from '@/api/skillManager';
// 当前激活的标签页
const activeTab = ref('list');
// 技能列表
const skills = ref([]);
const filteredSkills = ref([]);
const selectedSkill = ref(null);
const searchKeyword = ref('');
const layerFilter = ref('');
const isLoading = ref(false);
// 执行相关
const currentParams = ref({});
const currentExecutingSkill = ref(null);
const executionResult = ref(null);
const showResultDialog = ref(false);
const showParamsDialog = ref(false);
const isExecuting = ref(false);
// 意图识别相关
const intentQuery = ref('');
const intentMatches = ref([]);
const intentExamples = [
    '开展滨州到晋城线路五环节时限对标分析',
    '生成滨州到烟台线路的五环节分析报告',
    '分析滨州到菏泽线路的五环节时限',
    '开展线路五环节时限对标分析',
    '分析收寄环节的问题机构'
];
// 可用线路列表（从数据文件中读取）
const availableRoutes = ref([
    '滨州市晋城市',
    '滨州市烟台市',
    '滨州市菏泽市',
]);
// 可用机构列表
const availableInstitutions = ref([
    '博兴二部',
    '滨州市分公司',
    '晋城市分公司',
]);
// 工作流相关（保留但不再使用）
const workflows = ref([]);
// 技能详情弹窗
const showSkillDetailDialog = ref(false);
const historyRecords = ref([]);
// 获取层级标签类型
const getLayerTagType = (layer) => {
    const types = {
        'overview': 'success',
        'stage': 'primary',
        'institution': 'warning'
    };
    return types[layer] || 'info';
};
// 获取层级标签
const getLayerLabel = (layer) => {
    const labels = {
        'overview': '全景分析层',
        'stage': '环节分析层',
        'institution': '机构下钻层'
    };
    return labels[layer] || layer;
};
// 加载技能列表
const loadSkills = async () => {
    isLoading.value = true;
    try {
        console.log('开始加载技能...');
        const skillData = await skillManagerApi.getAllSkills();
        console.log('技能数据:', skillData);
        skills.value = skillData;
        filteredSkills.value = skillData;
        if (skillData && skillData.length > 0) {
            console.log(`成功加载 ${skillData.length} 个技能`);
        }
        else {
            console.warn('没有加载到技能数据');
        }
    }
    catch (error) {
        console.error('加载技能列表错误:', error);
        ElMessage.error('加载技能列表失败');
    }
    finally {
        isLoading.value = false;
    }
};
// 搜索技能
const handleSearch = () => {
    let result = skills.value;
    if (searchKeyword.value) {
        const keyword = searchKeyword.value.toLowerCase();
        result = result.filter(skill => skill.name.toLowerCase().includes(keyword) ||
            skill.description.toLowerCase().includes(keyword) ||
            skill.short_id.toLowerCase().includes(keyword));
    }
    if (layerFilter.value) {
        result = result.filter(skill => skill.layer === layerFilter.value);
    }
    filteredSkills.value = result;
};
// 选择技能（打开弹窗）
const selectSkill = (skill) => {
    selectedSkill.value = skill;
    // 初始化参数
    currentParams.value = {};
    skill.input_params.forEach(param => {
        if (param.default !== undefined) {
            currentParams.value[param.name] = param.default;
        }
    });
    showSkillDetailDialog.value = true;
};
// 根据ID选择技能
const selectSkillById = async (skillId) => {
    try {
        const skill = await skillManagerApi.getSkill(skillId);
        selectedSkill.value = skill;
        currentParams.value = {};
        skill.input_params.forEach(param => {
            if (param.default !== undefined) {
                currentParams.value[param.name] = param.default;
            }
        });
        showSkillDetailDialog.value = true;
    }
    catch (error) {
        ElMessage.error('获取技能详情失败');
        console.error('获取技能详情错误:', error);
    }
};
// 获取文件名（从完整路径中提取）
const getFileName = (filePath) => {
    return filePath.replace(/\\/g, '/').split('/').pop() || filePath;
};
// 判断是否为HTML文件
const isHtmlFile = (filePath) => {
    return filePath.toLowerCase().endsWith('.html') || filePath.toLowerCase().endsWith('.htm');
};
// HTML预览相关
const showPreviewDialog = ref(false);
const previewUrl = ref('');
const previewHtml = (filePath) => {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8002/api/v1';
    const baseUrl = apiBaseUrl.replace('/api/v1', '');
    previewUrl.value = `${baseUrl}/api/v1/skill-manager/files/preview?file_path=${encodeURIComponent(filePath)}`;
    showPreviewDialog.value = true;
};
const downloadFile = async (filePath) => {
    try {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8002/api/v1';
        const baseUrl = apiBaseUrl.replace('/api/v1', '');
        const url = `${baseUrl}/api/v1/skill-manager/files/preview?file_path=${encodeURIComponent(filePath)}`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('下载失败');
        }
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = getFileName(filePath);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(downloadUrl);
        ElMessage.success('下载成功');
    }
    catch (error) {
        console.error('下载错误:', error);
        ElMessage.error('下载失败，请稍后重试');
    }
};
// 打开参数输入对话框
const openParamsDialog = (skill) => {
    currentExecutingSkill.value = skill;
    currentParams.value = {};
    skill.input_params.forEach(param => {
        if (param.default !== undefined) {
            currentParams.value[param.name] = param.default;
        }
    });
    showParamsDialog.value = true;
};
// 确认执行（从参数对话框）
const confirmExecute = async () => {
    if (!currentExecutingSkill.value)
        return;
    showParamsDialog.value = false;
    await executeSkill(currentExecutingSkill.value.skill_id);
};
// 直接执行技能
const executeSkillDirectly = async (skill) => {
    currentExecutingSkill.value = skill;
    currentParams.value = {};
    // 检查是否有必填参数需要用户输入
    const requiredParams = skill.input_params.filter(p => p.required && !p.default);
    if (requiredParams.length > 0) {
        // 需要先填写参数，显示技能详情弹窗让用户填写
        selectedSkill.value = skill;
        skill.input_params.forEach(param => {
            if (param.default !== undefined) {
                currentParams.value[param.name] = param.default;
            }
        });
        showSkillDetailDialog.value = true;
        return;
    }
    // 所有参数都有默认值，可以直接执行
    skill.input_params.forEach(param => {
        if (param.default !== undefined) {
            currentParams.value[param.name] = param.default;
        }
    });
    await executeSkill(skill.skill_id);
};
// 执行选中的技能
const executeSelectedSkill = async () => {
    if (!selectedSkill.value)
        return;
    currentExecutingSkill.value = selectedSkill.value;
    await executeSkill(selectedSkill.value.skill_id);
};
// 执行技能
const executeSkill = async (skillId) => {
    isExecuting.value = true;
    showResultDialog.value = true;
    // 清空之前的执行结果，确保显示最新结果
    executionResult.value = null;
    try {
        const result = await skillManagerApi.executeSkill(skillId, currentParams.value);
        console.log('技能执行结果:', result);
        executionResult.value = result;
        if (result.success) {
            ElMessage.success('技能执行成功');
            if (result.output_files && result.output_files.length > 0) {
                console.log('输出文件:', result.output_files);
            }
            else {
                console.log('没有输出文件');
            }
        }
        else {
            ElMessage.error(result.error_message || '技能执行失败');
        }
        // 保存到历史记录
        const skillName = currentExecutingSkill.value?.name || skillId;
        saveToHistory(skillId, skillName, { ...currentParams.value }, result);
    }
    catch (error) {
        ElMessage.error('执行技能时发生错误');
        console.error('执行技能错误:', error);
        executionResult.value = {
            skill_id: skillId,
            success: false,
            output_files: [],
            execution_time: 0,
            error_message: '执行技能时发生错误'
        };
        // 保存失败记录到历史
        const skillName = currentExecutingSkill.value?.name || skillId;
        saveToHistory(skillId, skillName, { ...currentParams.value }, executionResult.value);
    }
    finally {
        isExecuting.value = false;
    }
};
// 根据意图识别结果执行技能
const executeSkillById = async (skillId) => {
    try {
        const skill = await skillManagerApi.getSkill(skillId);
        currentExecutingSkill.value = skill;
        currentParams.value = {};
        skill.input_params.forEach(param => {
            if (param.default !== undefined) {
                currentParams.value[param.name] = param.default;
            }
        });
        await executeSkill(skillId);
    }
    catch (error) {
        ElMessage.error('获取技能信息失败');
        console.error('获取技能信息错误:', error);
    }
};
// 解析用户意图
const parseIntent = async () => {
    if (!intentQuery.value.trim()) {
        ElMessage.warning('请输入分析需求');
        return;
    }
    try {
        const matches = await skillManagerApi.parseIntent(intentQuery.value);
        intentMatches.value = matches;
        if (matches.length === 0) {
            ElMessage.info('未找到匹配的技能');
        }
    }
    catch (error) {
        ElMessage.error('意图识别失败');
        console.error('意图识别错误:', error);
    }
};
// 确认链式执行
const confirmChainExecution = async () => {
    if (!executionResult.value?.pending_confirmation || !currentExecutingSkill.value)
        return;
    try {
        const result = await skillManagerApi.confirmChain(currentExecutingSkill.value.skill_id, executionResult.value.pending_confirmation);
        executionResult.value = result;
        currentExecutingSkill.value = await skillManagerApi.getSkill(result.skill_id);
        if (result.success) {
            ElMessage.success('链式触发执行成功');
        }
    }
    catch (error) {
        ElMessage.error('链式触发执行失败');
        console.error('链式触发错误:', error);
    }
};
// 执行工作流
const executeWorkflow = async (workflow) => {
    ElMessage.info(`执行工作流: ${workflow.name}`);
};
// 加载工作流列表（保留但不再使用）
const loadWorkflows = async () => {
    try {
        const response = await skillManagerApi.listWorkflows();
        workflows.value = response;
    }
    catch (error) {
        console.error('加载工作流列表错误:', error);
    }
};
// 加载历史记录
const loadHistory = async () => {
    try {
        const history = localStorage.getItem('skill_execution_history');
        if (history) {
            historyRecords.value = JSON.parse(history);
        }
        else {
            historyRecords.value = [];
        }
    }
    catch (error) {
        console.error('加载历史记录错误:', error);
        historyRecords.value = [];
    }
};
// 保存执行记录到历史
const saveToHistory = (skillId, skillName, params, result) => {
    const record = {
        skill_id: skillId,
        skill_name: skillName,
        params: { ...params },
        success: result.success,
        execution_time: result.execution_time,
        output_files: result.output_files || [],
        created_at: new Date().toLocaleString('zh-CN')
    };
    historyRecords.value.unshift(record);
    if (historyRecords.value.length > 50) {
        historyRecords.value = historyRecords.value.slice(0, 50);
    }
    try {
        localStorage.setItem('skill_execution_history', JSON.stringify(historyRecords.value));
    }
    catch (error) {
        console.error('保存历史记录错误:', error);
    }
};
// 重新执行历史记录
const reExecute = async (record) => {
    currentParams.value = { ...record.params };
    currentExecutingSkill.value = await skillManagerApi.getSkill(record.skill_id);
    await executeSkill(record.skill_id);
};
// 页面加载时获取数据
onMounted(async () => {
    await loadSkills();
    await loadWorkflows();
    await loadHistory();
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "skill-manager-container" },
});
const __VLS_0 = {}.ElCard;
/** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ class: "skill-card" },
}));
const __VLS_2 = __VLS_1({
    ...{ class: "skill-card" },
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
        ...{ class: "skill-tabs" },
    }));
    const __VLS_6 = __VLS_5({
        modelValue: (__VLS_ctx.activeTab),
        ...{ class: "skill-tabs" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_5));
    __VLS_7.slots.default;
    const __VLS_8 = {}.ElTabPane;
    /** @type {[typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
        label: "技能列表",
        name: "list",
    }));
    const __VLS_10 = __VLS_9({
        label: "技能列表",
        name: "list",
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    const __VLS_12 = {}.ElTabPane;
    /** @type {[typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, ]} */ ;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
        label: "智能分析",
        name: "intent",
    }));
    const __VLS_14 = __VLS_13({
        label: "智能分析",
        name: "intent",
    }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    const __VLS_16 = {}.ElTabPane;
    /** @type {[typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, ]} */ ;
    // @ts-ignore
    const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
        label: "历史记录",
        name: "history",
    }));
    const __VLS_18 = __VLS_17({
        label: "历史记录",
        name: "history",
    }, ...__VLS_functionalComponentArgsRest(__VLS_17));
    var __VLS_7;
}
if (__VLS_ctx.activeTab === 'list') {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "skill-list-container" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "search-section" },
    });
    const __VLS_20 = {}.ElInput;
    /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
        ...{ 'onInput': {} },
        modelValue: (__VLS_ctx.searchKeyword),
        placeholder: "搜索技能名称或描述...",
        ...{ class: "search-input" },
    }));
    const __VLS_22 = __VLS_21({
        ...{ 'onInput': {} },
        modelValue: (__VLS_ctx.searchKeyword),
        placeholder: "搜索技能名称或描述...",
        ...{ class: "search-input" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_21));
    let __VLS_24;
    let __VLS_25;
    let __VLS_26;
    const __VLS_27 = {
        onInput: (__VLS_ctx.handleSearch)
    };
    __VLS_23.slots.default;
    {
        const { append: __VLS_thisSlot } = __VLS_23.slots;
        const __VLS_28 = {}.ElIcon;
        /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
        // @ts-ignore
        const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({}));
        const __VLS_30 = __VLS_29({}, ...__VLS_functionalComponentArgsRest(__VLS_29));
        __VLS_31.slots.default;
        const __VLS_32 = {}.Search;
        /** @type {[typeof __VLS_components.Search, ]} */ ;
        // @ts-ignore
        const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({}));
        const __VLS_34 = __VLS_33({}, ...__VLS_functionalComponentArgsRest(__VLS_33));
        var __VLS_31;
    }
    var __VLS_23;
    const __VLS_36 = {}.ElSelect;
    /** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
    // @ts-ignore
    const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
        ...{ 'onChange': {} },
        modelValue: (__VLS_ctx.layerFilter),
        placeholder: "选择层级",
        ...{ class: "layer-select" },
    }));
    const __VLS_38 = __VLS_37({
        ...{ 'onChange': {} },
        modelValue: (__VLS_ctx.layerFilter),
        placeholder: "选择层级",
        ...{ class: "layer-select" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_37));
    let __VLS_40;
    let __VLS_41;
    let __VLS_42;
    const __VLS_43 = {
        onChange: (__VLS_ctx.handleSearch)
    };
    __VLS_39.slots.default;
    const __VLS_44 = {}.ElOption;
    /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
    // @ts-ignore
    const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
        label: "全部",
        value: "",
    }));
    const __VLS_46 = __VLS_45({
        label: "全部",
        value: "",
    }, ...__VLS_functionalComponentArgsRest(__VLS_45));
    const __VLS_48 = {}.ElOption;
    /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
    // @ts-ignore
    const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
        label: "全景分析层",
        value: "overview",
    }));
    const __VLS_50 = __VLS_49({
        label: "全景分析层",
        value: "overview",
    }, ...__VLS_functionalComponentArgsRest(__VLS_49));
    const __VLS_52 = {}.ElOption;
    /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
    // @ts-ignore
    const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
        label: "环节分析层",
        value: "stage",
    }));
    const __VLS_54 = __VLS_53({
        label: "环节分析层",
        value: "stage",
    }, ...__VLS_functionalComponentArgsRest(__VLS_53));
    const __VLS_56 = {}.ElOption;
    /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
    // @ts-ignore
    const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
        label: "机构下钻层",
        value: "institution",
    }));
    const __VLS_58 = __VLS_57({
        label: "机构下钻层",
        value: "institution",
    }, ...__VLS_functionalComponentArgsRest(__VLS_57));
    var __VLS_39;
    const __VLS_60 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
        ...{ 'onClick': {} },
        type: "primary",
        ...{ class: "refresh-btn" },
    }));
    const __VLS_62 = __VLS_61({
        ...{ 'onClick': {} },
        type: "primary",
        ...{ class: "refresh-btn" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_61));
    let __VLS_64;
    let __VLS_65;
    let __VLS_66;
    const __VLS_67 = {
        onClick: (__VLS_ctx.loadSkills)
    };
    __VLS_63.slots.default;
    const __VLS_68 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({}));
    const __VLS_70 = __VLS_69({}, ...__VLS_functionalComponentArgsRest(__VLS_69));
    __VLS_71.slots.default;
    const __VLS_72 = {}.Refresh;
    /** @type {[typeof __VLS_components.Refresh, ]} */ ;
    // @ts-ignore
    const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({}));
    const __VLS_74 = __VLS_73({}, ...__VLS_functionalComponentArgsRest(__VLS_73));
    var __VLS_71;
    var __VLS_63;
    if (__VLS_ctx.isLoading) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "loading-container" },
        });
        const __VLS_76 = {}.ElSkeleton;
        /** @type {[typeof __VLS_components.ElSkeleton, typeof __VLS_components.elSkeleton, ]} */ ;
        // @ts-ignore
        const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
            rows: (5),
            animated: true,
        }));
        const __VLS_78 = __VLS_77({
            rows: (5),
            animated: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_77));
    }
    else if (__VLS_ctx.filteredSkills.length === 0) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "empty-container" },
        });
        const __VLS_80 = {}.ElEmpty;
        /** @type {[typeof __VLS_components.ElEmpty, typeof __VLS_components.elEmpty, typeof __VLS_components.ElEmpty, typeof __VLS_components.elEmpty, ]} */ ;
        // @ts-ignore
        const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
            description: (__VLS_ctx.searchKeyword || __VLS_ctx.layerFilter ? '未找到匹配的技能' : '暂无技能'),
        }));
        const __VLS_82 = __VLS_81({
            description: (__VLS_ctx.searchKeyword || __VLS_ctx.layerFilter ? '未找到匹配的技能' : '暂无技能'),
        }, ...__VLS_functionalComponentArgsRest(__VLS_81));
        __VLS_83.slots.default;
        const __VLS_84 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({
            ...{ 'onClick': {} },
            type: "primary",
        }));
        const __VLS_86 = __VLS_85({
            ...{ 'onClick': {} },
            type: "primary",
        }, ...__VLS_functionalComponentArgsRest(__VLS_85));
        let __VLS_88;
        let __VLS_89;
        let __VLS_90;
        const __VLS_91 = {
            onClick: (__VLS_ctx.loadSkills)
        };
        __VLS_87.slots.default;
        const __VLS_92 = {}.ElIcon;
        /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
        // @ts-ignore
        const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({}));
        const __VLS_94 = __VLS_93({}, ...__VLS_functionalComponentArgsRest(__VLS_93));
        __VLS_95.slots.default;
        const __VLS_96 = {}.Refresh;
        /** @type {[typeof __VLS_components.Refresh, ]} */ ;
        // @ts-ignore
        const __VLS_97 = __VLS_asFunctionalComponent(__VLS_96, new __VLS_96({}));
        const __VLS_98 = __VLS_97({}, ...__VLS_functionalComponentArgsRest(__VLS_97));
        var __VLS_95;
        var __VLS_87;
        var __VLS_83;
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "skills-grid" },
        });
        for (const [skill] of __VLS_getVForSourceType((__VLS_ctx.filteredSkills))) {
            const __VLS_100 = {}.ElCard;
            /** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
            // @ts-ignore
            const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({
                ...{ 'onClick': {} },
                key: (skill.skill_id),
                ...{ class: "skill-item" },
                ...{ class: ({ 'is-selected': __VLS_ctx.selectedSkill?.skill_id === skill.skill_id }) },
            }));
            const __VLS_102 = __VLS_101({
                ...{ 'onClick': {} },
                key: (skill.skill_id),
                ...{ class: "skill-item" },
                ...{ class: ({ 'is-selected': __VLS_ctx.selectedSkill?.skill_id === skill.skill_id }) },
            }, ...__VLS_functionalComponentArgsRest(__VLS_101));
            let __VLS_104;
            let __VLS_105;
            let __VLS_106;
            const __VLS_107 = {
                onClick: (...[$event]) => {
                    if (!(__VLS_ctx.activeTab === 'list'))
                        return;
                    if (!!(__VLS_ctx.isLoading))
                        return;
                    if (!!(__VLS_ctx.filteredSkills.length === 0))
                        return;
                    __VLS_ctx.selectSkill(skill);
                }
            };
            __VLS_103.slots.default;
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "skill-header" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "skill-name" },
            });
            (skill.name);
            const __VLS_108 = {}.ElTag;
            /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
            // @ts-ignore
            const __VLS_109 = __VLS_asFunctionalComponent(__VLS_108, new __VLS_108({
                type: (__VLS_ctx.getLayerTagType(skill.layer)),
                size: "small",
            }));
            const __VLS_110 = __VLS_109({
                type: (__VLS_ctx.getLayerTagType(skill.layer)),
                size: "small",
            }, ...__VLS_functionalComponentArgsRest(__VLS_109));
            __VLS_111.slots.default;
            (__VLS_ctx.getLayerLabel(skill.layer));
            var __VLS_111;
            __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
                ...{ class: "skill-description" },
            });
            (skill.description);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "skill-info" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "info-item" },
            });
            const __VLS_112 = {}.ElIcon;
            /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
            // @ts-ignore
            const __VLS_113 = __VLS_asFunctionalComponent(__VLS_112, new __VLS_112({}));
            const __VLS_114 = __VLS_113({}, ...__VLS_functionalComponentArgsRest(__VLS_113));
            __VLS_115.slots.default;
            const __VLS_116 = {}.Document;
            /** @type {[typeof __VLS_components.Document, ]} */ ;
            // @ts-ignore
            const __VLS_117 = __VLS_asFunctionalComponent(__VLS_116, new __VLS_116({}));
            const __VLS_118 = __VLS_117({}, ...__VLS_functionalComponentArgsRest(__VLS_117));
            var __VLS_115;
            (skill.language);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "info-item" },
            });
            const __VLS_120 = {}.ElIcon;
            /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
            // @ts-ignore
            const __VLS_121 = __VLS_asFunctionalComponent(__VLS_120, new __VLS_120({}));
            const __VLS_122 = __VLS_121({}, ...__VLS_functionalComponentArgsRest(__VLS_121));
            __VLS_123.slots.default;
            const __VLS_124 = {}.List;
            /** @type {[typeof __VLS_components.List, ]} */ ;
            // @ts-ignore
            const __VLS_125 = __VLS_asFunctionalComponent(__VLS_124, new __VLS_124({}));
            const __VLS_126 = __VLS_125({}, ...__VLS_functionalComponentArgsRest(__VLS_125));
            var __VLS_123;
            (skill.input_params.length);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "skill-tags" },
            });
            for (const [pattern, index] of __VLS_getVForSourceType((skill.trigger_patterns.slice(0, 3)))) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                    key: (index),
                    ...{ class: "trigger-tag" },
                });
                (pattern);
            }
            const __VLS_128 = {}.ElButton;
            /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
            // @ts-ignore
            const __VLS_129 = __VLS_asFunctionalComponent(__VLS_128, new __VLS_128({
                ...{ 'onClick': {} },
                type: "primary",
                size: "small",
                ...{ class: "execute-btn" },
            }));
            const __VLS_130 = __VLS_129({
                ...{ 'onClick': {} },
                type: "primary",
                size: "small",
                ...{ class: "execute-btn" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_129));
            let __VLS_132;
            let __VLS_133;
            let __VLS_134;
            const __VLS_135 = {
                onClick: (...[$event]) => {
                    if (!(__VLS_ctx.activeTab === 'list'))
                        return;
                    if (!!(__VLS_ctx.isLoading))
                        return;
                    if (!!(__VLS_ctx.filteredSkills.length === 0))
                        return;
                    __VLS_ctx.openParamsDialog(skill);
                }
            };
            __VLS_131.slots.default;
            const __VLS_136 = {}.ElIcon;
            /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
            // @ts-ignore
            const __VLS_137 = __VLS_asFunctionalComponent(__VLS_136, new __VLS_136({}));
            const __VLS_138 = __VLS_137({}, ...__VLS_functionalComponentArgsRest(__VLS_137));
            __VLS_139.slots.default;
            const __VLS_140 = {}.Plus;
            /** @type {[typeof __VLS_components.Plus, ]} */ ;
            // @ts-ignore
            const __VLS_141 = __VLS_asFunctionalComponent(__VLS_140, new __VLS_140({}));
            const __VLS_142 = __VLS_141({}, ...__VLS_functionalComponentArgsRest(__VLS_141));
            var __VLS_139;
            var __VLS_131;
            var __VLS_103;
        }
    }
}
if (__VLS_ctx.activeTab === 'intent') {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "intent-container" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "intent-input-section" },
    });
    const __VLS_144 = {}.ElInput;
    /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
    // @ts-ignore
    const __VLS_145 = __VLS_asFunctionalComponent(__VLS_144, new __VLS_144({
        ...{ 'onKeyup': {} },
        modelValue: (__VLS_ctx.intentQuery),
        placeholder: "请输入您的分析需求，例如：分析进口环节时限",
        ...{ class: "intent-input" },
    }));
    const __VLS_146 = __VLS_145({
        ...{ 'onKeyup': {} },
        modelValue: (__VLS_ctx.intentQuery),
        placeholder: "请输入您的分析需求，例如：分析进口环节时限",
        ...{ class: "intent-input" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_145));
    let __VLS_148;
    let __VLS_149;
    let __VLS_150;
    const __VLS_151 = {
        onKeyup: (__VLS_ctx.parseIntent)
    };
    __VLS_147.slots.default;
    {
        const { append: __VLS_thisSlot } = __VLS_147.slots;
        const __VLS_152 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_153 = __VLS_asFunctionalComponent(__VLS_152, new __VLS_152({
            ...{ 'onClick': {} },
            type: "primary",
        }));
        const __VLS_154 = __VLS_153({
            ...{ 'onClick': {} },
            type: "primary",
        }, ...__VLS_functionalComponentArgsRest(__VLS_153));
        let __VLS_156;
        let __VLS_157;
        let __VLS_158;
        const __VLS_159 = {
            onClick: (__VLS_ctx.parseIntent)
        };
        __VLS_155.slots.default;
        const __VLS_160 = {}.ElIcon;
        /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
        // @ts-ignore
        const __VLS_161 = __VLS_asFunctionalComponent(__VLS_160, new __VLS_160({}));
        const __VLS_162 = __VLS_161({}, ...__VLS_functionalComponentArgsRest(__VLS_161));
        __VLS_163.slots.default;
        const __VLS_164 = {}.Search;
        /** @type {[typeof __VLS_components.Search, ]} */ ;
        // @ts-ignore
        const __VLS_165 = __VLS_asFunctionalComponent(__VLS_164, new __VLS_164({}));
        const __VLS_166 = __VLS_165({}, ...__VLS_functionalComponentArgsRest(__VLS_165));
        var __VLS_163;
        var __VLS_155;
    }
    var __VLS_147;
    if (__VLS_ctx.intentMatches.length > 0) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "intent-results" },
        });
        const __VLS_168 = {}.ElDivider;
        /** @type {[typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, ]} */ ;
        // @ts-ignore
        const __VLS_169 = __VLS_asFunctionalComponent(__VLS_168, new __VLS_168({
            contentPosition: "left",
        }));
        const __VLS_170 = __VLS_169({
            contentPosition: "left",
        }, ...__VLS_functionalComponentArgsRest(__VLS_169));
        __VLS_171.slots.default;
        var __VLS_171;
        const __VLS_172 = {}.ElTable;
        /** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
        // @ts-ignore
        const __VLS_173 = __VLS_asFunctionalComponent(__VLS_172, new __VLS_172({
            data: (__VLS_ctx.intentMatches),
            border: true,
        }));
        const __VLS_174 = __VLS_173({
            data: (__VLS_ctx.intentMatches),
            border: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_173));
        __VLS_175.slots.default;
        const __VLS_176 = {}.ElTableColumn;
        /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
        // @ts-ignore
        const __VLS_177 = __VLS_asFunctionalComponent(__VLS_176, new __VLS_176({
            prop: "skill_id",
            label: "技能ID",
        }));
        const __VLS_178 = __VLS_177({
            prop: "skill_id",
            label: "技能ID",
        }, ...__VLS_functionalComponentArgsRest(__VLS_177));
        const __VLS_180 = {}.ElTableColumn;
        /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
        // @ts-ignore
        const __VLS_181 = __VLS_asFunctionalComponent(__VLS_180, new __VLS_180({
            prop: "confidence",
            label: "置信度",
        }));
        const __VLS_182 = __VLS_181({
            prop: "confidence",
            label: "置信度",
        }, ...__VLS_functionalComponentArgsRest(__VLS_181));
        __VLS_183.slots.default;
        {
            const { default: __VLS_thisSlot } = __VLS_183.slots;
            const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
            const __VLS_184 = {}.ElProgress;
            /** @type {[typeof __VLS_components.ElProgress, typeof __VLS_components.elProgress, ]} */ ;
            // @ts-ignore
            const __VLS_185 = __VLS_asFunctionalComponent(__VLS_184, new __VLS_184({
                percentage: (scope.row.confidence * 100),
                showText: (false),
            }));
            const __VLS_186 = __VLS_185({
                percentage: (scope.row.confidence * 100),
                showText: (false),
            }, ...__VLS_functionalComponentArgsRest(__VLS_185));
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "confidence-text" },
            });
            ((scope.row.confidence * 100).toFixed(0));
        }
        var __VLS_183;
        const __VLS_188 = {}.ElTableColumn;
        /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
        // @ts-ignore
        const __VLS_189 = __VLS_asFunctionalComponent(__VLS_188, new __VLS_188({
            prop: "reason",
            label: "匹配原因",
        }));
        const __VLS_190 = __VLS_189({
            prop: "reason",
            label: "匹配原因",
        }, ...__VLS_functionalComponentArgsRest(__VLS_189));
        const __VLS_192 = {}.ElTableColumn;
        /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
        // @ts-ignore
        const __VLS_193 = __VLS_asFunctionalComponent(__VLS_192, new __VLS_192({
            label: "操作",
        }));
        const __VLS_194 = __VLS_193({
            label: "操作",
        }, ...__VLS_functionalComponentArgsRest(__VLS_193));
        __VLS_195.slots.default;
        {
            const { default: __VLS_thisSlot } = __VLS_195.slots;
            const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
            const __VLS_196 = {}.ElButton;
            /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
            // @ts-ignore
            const __VLS_197 = __VLS_asFunctionalComponent(__VLS_196, new __VLS_196({
                ...{ 'onClick': {} },
                size: "small",
            }));
            const __VLS_198 = __VLS_197({
                ...{ 'onClick': {} },
                size: "small",
            }, ...__VLS_functionalComponentArgsRest(__VLS_197));
            let __VLS_200;
            let __VLS_201;
            let __VLS_202;
            const __VLS_203 = {
                onClick: (...[$event]) => {
                    if (!(__VLS_ctx.activeTab === 'intent'))
                        return;
                    if (!(__VLS_ctx.intentMatches.length > 0))
                        return;
                    __VLS_ctx.selectSkillById(scope.row.skill_id);
                }
            };
            __VLS_199.slots.default;
            var __VLS_199;
            const __VLS_204 = {}.ElButton;
            /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
            // @ts-ignore
            const __VLS_205 = __VLS_asFunctionalComponent(__VLS_204, new __VLS_204({
                ...{ 'onClick': {} },
                size: "small",
                type: "primary",
            }));
            const __VLS_206 = __VLS_205({
                ...{ 'onClick': {} },
                size: "small",
                type: "primary",
            }, ...__VLS_functionalComponentArgsRest(__VLS_205));
            let __VLS_208;
            let __VLS_209;
            let __VLS_210;
            const __VLS_211 = {
                onClick: (...[$event]) => {
                    if (!(__VLS_ctx.activeTab === 'intent'))
                        return;
                    if (!(__VLS_ctx.intentMatches.length > 0))
                        return;
                    __VLS_ctx.executeSkillById(scope.row.skill_id);
                }
            };
            __VLS_207.slots.default;
            var __VLS_207;
        }
        var __VLS_195;
        var __VLS_175;
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "intent-examples" },
    });
    const __VLS_212 = {}.ElDivider;
    /** @type {[typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, ]} */ ;
    // @ts-ignore
    const __VLS_213 = __VLS_asFunctionalComponent(__VLS_212, new __VLS_212({
        contentPosition: "left",
    }));
    const __VLS_214 = __VLS_213({
        contentPosition: "left",
    }, ...__VLS_functionalComponentArgsRest(__VLS_213));
    __VLS_215.slots.default;
    var __VLS_215;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "examples-list" },
    });
    for (const [example, index] of __VLS_getVForSourceType((__VLS_ctx.intentExamples))) {
        const __VLS_216 = {}.ElTag;
        /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
        // @ts-ignore
        const __VLS_217 = __VLS_asFunctionalComponent(__VLS_216, new __VLS_216({
            ...{ 'onClick': {} },
            key: (index),
            ...{ class: "example-tag" },
        }));
        const __VLS_218 = __VLS_217({
            ...{ 'onClick': {} },
            key: (index),
            ...{ class: "example-tag" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_217));
        let __VLS_220;
        let __VLS_221;
        let __VLS_222;
        const __VLS_223 = {
            onClick: (...[$event]) => {
                if (!(__VLS_ctx.activeTab === 'intent'))
                    return;
                __VLS_ctx.intentQuery = example;
            }
        };
        __VLS_219.slots.default;
        (example);
        var __VLS_219;
    }
}
if (__VLS_ctx.activeTab === 'history') {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "history-container" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "history-header" },
    });
    const __VLS_224 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_225 = __VLS_asFunctionalComponent(__VLS_224, new __VLS_224({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_226 = __VLS_225({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_225));
    let __VLS_228;
    let __VLS_229;
    let __VLS_230;
    const __VLS_231 = {
        onClick: (__VLS_ctx.loadHistory)
    };
    __VLS_227.slots.default;
    const __VLS_232 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_233 = __VLS_asFunctionalComponent(__VLS_232, new __VLS_232({}));
    const __VLS_234 = __VLS_233({}, ...__VLS_functionalComponentArgsRest(__VLS_233));
    __VLS_235.slots.default;
    const __VLS_236 = {}.Refresh;
    /** @type {[typeof __VLS_components.Refresh, ]} */ ;
    // @ts-ignore
    const __VLS_237 = __VLS_asFunctionalComponent(__VLS_236, new __VLS_236({}));
    const __VLS_238 = __VLS_237({}, ...__VLS_functionalComponentArgsRest(__VLS_237));
    var __VLS_235;
    var __VLS_227;
    if (__VLS_ctx.historyRecords.length > 0) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "history-list" },
        });
        const __VLS_240 = {}.ElTable;
        /** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
        // @ts-ignore
        const __VLS_241 = __VLS_asFunctionalComponent(__VLS_240, new __VLS_240({
            data: (__VLS_ctx.historyRecords),
            border: true,
        }));
        const __VLS_242 = __VLS_241({
            data: (__VLS_ctx.historyRecords),
            border: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_241));
        __VLS_243.slots.default;
        const __VLS_244 = {}.ElTableColumn;
        /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
        // @ts-ignore
        const __VLS_245 = __VLS_asFunctionalComponent(__VLS_244, new __VLS_244({
            prop: "skill_name",
            label: "技能名称",
        }));
        const __VLS_246 = __VLS_245({
            prop: "skill_name",
            label: "技能名称",
        }, ...__VLS_functionalComponentArgsRest(__VLS_245));
        const __VLS_248 = {}.ElTableColumn;
        /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
        // @ts-ignore
        const __VLS_249 = __VLS_asFunctionalComponent(__VLS_248, new __VLS_248({
            prop: "params",
            label: "输入参数",
        }));
        const __VLS_250 = __VLS_249({
            prop: "params",
            label: "输入参数",
        }, ...__VLS_functionalComponentArgsRest(__VLS_249));
        __VLS_251.slots.default;
        {
            const { default: __VLS_thisSlot } = __VLS_251.slots;
            const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
            (JSON.stringify(scope.row.params || {}));
        }
        var __VLS_251;
        const __VLS_252 = {}.ElTableColumn;
        /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
        // @ts-ignore
        const __VLS_253 = __VLS_asFunctionalComponent(__VLS_252, new __VLS_252({
            prop: "success",
            label: "执行状态",
        }));
        const __VLS_254 = __VLS_253({
            prop: "success",
            label: "执行状态",
        }, ...__VLS_functionalComponentArgsRest(__VLS_253));
        __VLS_255.slots.default;
        {
            const { default: __VLS_thisSlot } = __VLS_255.slots;
            const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
            const __VLS_256 = {}.ElTag;
            /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
            // @ts-ignore
            const __VLS_257 = __VLS_asFunctionalComponent(__VLS_256, new __VLS_256({
                type: (scope.row.success ? 'success' : 'danger'),
            }));
            const __VLS_258 = __VLS_257({
                type: (scope.row.success ? 'success' : 'danger'),
            }, ...__VLS_functionalComponentArgsRest(__VLS_257));
            __VLS_259.slots.default;
            (scope.row.success ? '成功' : '失败');
            var __VLS_259;
        }
        var __VLS_255;
        const __VLS_260 = {}.ElTableColumn;
        /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
        // @ts-ignore
        const __VLS_261 = __VLS_asFunctionalComponent(__VLS_260, new __VLS_260({
            prop: "execution_time",
            label: "耗时(秒)",
        }));
        const __VLS_262 = __VLS_261({
            prop: "execution_time",
            label: "耗时(秒)",
        }, ...__VLS_functionalComponentArgsRest(__VLS_261));
        __VLS_263.slots.default;
        {
            const { default: __VLS_thisSlot } = __VLS_263.slots;
            const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
            (typeof scope.row.execution_time === 'number' ? scope.row.execution_time.toFixed(2) : '-');
        }
        var __VLS_263;
        const __VLS_264 = {}.ElTableColumn;
        /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
        // @ts-ignore
        const __VLS_265 = __VLS_asFunctionalComponent(__VLS_264, new __VLS_264({
            prop: "output_files",
            label: "输出文件数",
        }));
        const __VLS_266 = __VLS_265({
            prop: "output_files",
            label: "输出文件数",
        }, ...__VLS_functionalComponentArgsRest(__VLS_265));
        __VLS_267.slots.default;
        {
            const { default: __VLS_thisSlot } = __VLS_267.slots;
            const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
            (scope.row.output_files?.length || 0);
        }
        var __VLS_267;
        const __VLS_268 = {}.ElTableColumn;
        /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
        // @ts-ignore
        const __VLS_269 = __VLS_asFunctionalComponent(__VLS_268, new __VLS_268({
            prop: "created_at",
            label: "执行时间",
        }));
        const __VLS_270 = __VLS_269({
            prop: "created_at",
            label: "执行时间",
        }, ...__VLS_functionalComponentArgsRest(__VLS_269));
        const __VLS_272 = {}.ElTableColumn;
        /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
        // @ts-ignore
        const __VLS_273 = __VLS_asFunctionalComponent(__VLS_272, new __VLS_272({
            label: "操作",
        }));
        const __VLS_274 = __VLS_273({
            label: "操作",
        }, ...__VLS_functionalComponentArgsRest(__VLS_273));
        __VLS_275.slots.default;
        {
            const { default: __VLS_thisSlot } = __VLS_275.slots;
            const [scope] = __VLS_getSlotParams(__VLS_thisSlot);
            const __VLS_276 = {}.ElButton;
            /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
            // @ts-ignore
            const __VLS_277 = __VLS_asFunctionalComponent(__VLS_276, new __VLS_276({
                ...{ 'onClick': {} },
                size: "small",
            }));
            const __VLS_278 = __VLS_277({
                ...{ 'onClick': {} },
                size: "small",
            }, ...__VLS_functionalComponentArgsRest(__VLS_277));
            let __VLS_280;
            let __VLS_281;
            let __VLS_282;
            const __VLS_283 = {
                onClick: (...[$event]) => {
                    if (!(__VLS_ctx.activeTab === 'history'))
                        return;
                    if (!(__VLS_ctx.historyRecords.length > 0))
                        return;
                    __VLS_ctx.reExecute(scope.row);
                }
            };
            __VLS_279.slots.default;
            var __VLS_279;
        }
        var __VLS_275;
        var __VLS_243;
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "empty-history" },
        });
        const __VLS_284 = {}.ElEmpty;
        /** @type {[typeof __VLS_components.ElEmpty, typeof __VLS_components.elEmpty, ]} */ ;
        // @ts-ignore
        const __VLS_285 = __VLS_asFunctionalComponent(__VLS_284, new __VLS_284({
            description: "暂无历史记录",
        }));
        const __VLS_286 = __VLS_285({
            description: "暂无历史记录",
        }, ...__VLS_functionalComponentArgsRest(__VLS_285));
    }
}
const __VLS_288 = {}.ElDialog;
/** @type {[typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ]} */ ;
// @ts-ignore
const __VLS_289 = __VLS_asFunctionalComponent(__VLS_288, new __VLS_288({
    modelValue: (__VLS_ctx.showSkillDetailDialog),
    title: (`技能详情 - ${__VLS_ctx.selectedSkill?.name}`),
    width: "700px",
    destroyOnClose: true,
}));
const __VLS_290 = __VLS_289({
    modelValue: (__VLS_ctx.showSkillDetailDialog),
    title: (`技能详情 - ${__VLS_ctx.selectedSkill?.name}`),
    width: "700px",
    destroyOnClose: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_289));
__VLS_291.slots.default;
if (__VLS_ctx.selectedSkill) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "skill-detail-content" },
    });
    const __VLS_292 = {}.ElDescriptions;
    /** @type {[typeof __VLS_components.ElDescriptions, typeof __VLS_components.elDescriptions, typeof __VLS_components.ElDescriptions, typeof __VLS_components.elDescriptions, ]} */ ;
    // @ts-ignore
    const __VLS_293 = __VLS_asFunctionalComponent(__VLS_292, new __VLS_292({
        column: (2),
        border: true,
        ...{ class: "detail-descriptions" },
    }));
    const __VLS_294 = __VLS_293({
        column: (2),
        border: true,
        ...{ class: "detail-descriptions" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_293));
    __VLS_295.slots.default;
    const __VLS_296 = {}.ElDescriptionsItem;
    /** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
    // @ts-ignore
    const __VLS_297 = __VLS_asFunctionalComponent(__VLS_296, new __VLS_296({
        label: "技能名称",
    }));
    const __VLS_298 = __VLS_297({
        label: "技能名称",
    }, ...__VLS_functionalComponentArgsRest(__VLS_297));
    __VLS_299.slots.default;
    (__VLS_ctx.selectedSkill.name);
    var __VLS_299;
    const __VLS_300 = {}.ElDescriptionsItem;
    /** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
    // @ts-ignore
    const __VLS_301 = __VLS_asFunctionalComponent(__VLS_300, new __VLS_300({
        label: "技能ID",
    }));
    const __VLS_302 = __VLS_301({
        label: "技能ID",
    }, ...__VLS_functionalComponentArgsRest(__VLS_301));
    __VLS_303.slots.default;
    (__VLS_ctx.selectedSkill.short_id);
    var __VLS_303;
    const __VLS_304 = {}.ElDescriptionsItem;
    /** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
    // @ts-ignore
    const __VLS_305 = __VLS_asFunctionalComponent(__VLS_304, new __VLS_304({
        label: "层级",
    }));
    const __VLS_306 = __VLS_305({
        label: "层级",
    }, ...__VLS_functionalComponentArgsRest(__VLS_305));
    __VLS_307.slots.default;
    (__VLS_ctx.getLayerLabel(__VLS_ctx.selectedSkill.layer));
    var __VLS_307;
    const __VLS_308 = {}.ElDescriptionsItem;
    /** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
    // @ts-ignore
    const __VLS_309 = __VLS_asFunctionalComponent(__VLS_308, new __VLS_308({
        label: "语言",
    }));
    const __VLS_310 = __VLS_309({
        label: "语言",
    }, ...__VLS_functionalComponentArgsRest(__VLS_309));
    __VLS_311.slots.default;
    (__VLS_ctx.selectedSkill.language);
    var __VLS_311;
    const __VLS_312 = {}.ElDescriptionsItem;
    /** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
    // @ts-ignore
    const __VLS_313 = __VLS_asFunctionalComponent(__VLS_312, new __VLS_312({
        label: "描述",
        span: (2),
    }));
    const __VLS_314 = __VLS_313({
        label: "描述",
        span: (2),
    }, ...__VLS_functionalComponentArgsRest(__VLS_313));
    __VLS_315.slots.default;
    (__VLS_ctx.selectedSkill.description);
    var __VLS_315;
    var __VLS_295;
    if (__VLS_ctx.selectedSkill.input_params.length > 0) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "params-section" },
        });
        const __VLS_316 = {}.ElDivider;
        /** @type {[typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, ]} */ ;
        // @ts-ignore
        const __VLS_317 = __VLS_asFunctionalComponent(__VLS_316, new __VLS_316({
            contentPosition: "left",
        }));
        const __VLS_318 = __VLS_317({
            contentPosition: "left",
        }, ...__VLS_functionalComponentArgsRest(__VLS_317));
        __VLS_319.slots.default;
        var __VLS_319;
        const __VLS_320 = {}.ElForm;
        /** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
        // @ts-ignore
        const __VLS_321 = __VLS_asFunctionalComponent(__VLS_320, new __VLS_320({
            model: (__VLS_ctx.currentParams),
            labelWidth: "120px",
            ...{ class: "params-form" },
        }));
        const __VLS_322 = __VLS_321({
            model: (__VLS_ctx.currentParams),
            labelWidth: "120px",
            ...{ class: "params-form" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_321));
        __VLS_323.slots.default;
        for (const [param] of __VLS_getVForSourceType((__VLS_ctx.selectedSkill.input_params))) {
            const __VLS_324 = {}.ElFormItem;
            /** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
            // @ts-ignore
            const __VLS_325 = __VLS_asFunctionalComponent(__VLS_324, new __VLS_324({
                key: (param.name),
                label: (param.description),
                required: (param.required),
            }));
            const __VLS_326 = __VLS_325({
                key: (param.name),
                label: (param.description),
                required: (param.required),
            }, ...__VLS_functionalComponentArgsRest(__VLS_325));
            __VLS_327.slots.default;
            const __VLS_328 = {}.ElInput;
            /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
            // @ts-ignore
            const __VLS_329 = __VLS_asFunctionalComponent(__VLS_328, new __VLS_328({
                modelValue: (__VLS_ctx.currentParams[param.name]),
                placeholder: (`请输入${param.description}`),
                ...{ class: "param-input" },
            }));
            const __VLS_330 = __VLS_329({
                modelValue: (__VLS_ctx.currentParams[param.name]),
                placeholder: (`请输入${param.description}`),
                ...{ class: "param-input" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_329));
            if (param.default !== undefined) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                    ...{ class: "default-hint" },
                });
                (param.default);
            }
            if (param.name === 'route_name') {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                    ...{ class: "example-hint" },
                });
            }
            if (param.name === 'institution_name') {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                    ...{ class: "example-hint" },
                });
            }
            var __VLS_327;
        }
        var __VLS_323;
    }
    if (__VLS_ctx.selectedSkill.trigger_patterns.length > 0) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "patterns-section" },
        });
        const __VLS_332 = {}.ElDivider;
        /** @type {[typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, ]} */ ;
        // @ts-ignore
        const __VLS_333 = __VLS_asFunctionalComponent(__VLS_332, new __VLS_332({
            contentPosition: "left",
        }));
        const __VLS_334 = __VLS_333({
            contentPosition: "left",
        }, ...__VLS_functionalComponentArgsRest(__VLS_333));
        __VLS_335.slots.default;
        var __VLS_335;
        for (const [pattern, index] of __VLS_getVForSourceType((__VLS_ctx.selectedSkill.trigger_patterns))) {
            const __VLS_336 = {}.ElTag;
            /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
            // @ts-ignore
            const __VLS_337 = __VLS_asFunctionalComponent(__VLS_336, new __VLS_336({
                key: (index),
                ...{ class: "pattern-tag" },
            }));
            const __VLS_338 = __VLS_337({
                key: (index),
                ...{ class: "pattern-tag" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_337));
            __VLS_339.slots.default;
            (pattern);
            var __VLS_339;
        }
    }
}
{
    const { footer: __VLS_thisSlot } = __VLS_291.slots;
    const __VLS_340 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_341 = __VLS_asFunctionalComponent(__VLS_340, new __VLS_340({
        ...{ 'onClick': {} },
    }));
    const __VLS_342 = __VLS_341({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_341));
    let __VLS_344;
    let __VLS_345;
    let __VLS_346;
    const __VLS_347 = {
        onClick: (...[$event]) => {
            __VLS_ctx.showSkillDetailDialog = false;
        }
    };
    __VLS_343.slots.default;
    var __VLS_343;
    const __VLS_348 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_349 = __VLS_asFunctionalComponent(__VLS_348, new __VLS_348({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_350 = __VLS_349({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_349));
    let __VLS_352;
    let __VLS_353;
    let __VLS_354;
    const __VLS_355 = {
        onClick: (__VLS_ctx.executeSelectedSkill)
    };
    __VLS_351.slots.default;
    const __VLS_356 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_357 = __VLS_asFunctionalComponent(__VLS_356, new __VLS_356({}));
    const __VLS_358 = __VLS_357({}, ...__VLS_functionalComponentArgsRest(__VLS_357));
    __VLS_359.slots.default;
    const __VLS_360 = {}.Plus;
    /** @type {[typeof __VLS_components.Plus, ]} */ ;
    // @ts-ignore
    const __VLS_361 = __VLS_asFunctionalComponent(__VLS_360, new __VLS_360({}));
    const __VLS_362 = __VLS_361({}, ...__VLS_functionalComponentArgsRest(__VLS_361));
    var __VLS_359;
    var __VLS_351;
}
var __VLS_291;
const __VLS_364 = {}.ElDialog;
/** @type {[typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ]} */ ;
// @ts-ignore
const __VLS_365 = __VLS_asFunctionalComponent(__VLS_364, new __VLS_364({
    modelValue: (__VLS_ctx.showParamsDialog),
    title: (`执行技能 - ${__VLS_ctx.currentExecutingSkill?.name}`),
    width: "500px",
    destroyOnClose: true,
}));
const __VLS_366 = __VLS_365({
    modelValue: (__VLS_ctx.showParamsDialog),
    title: (`执行技能 - ${__VLS_ctx.currentExecutingSkill?.name}`),
    width: "500px",
    destroyOnClose: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_365));
__VLS_367.slots.default;
if (__VLS_ctx.currentExecutingSkill) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    const __VLS_368 = {}.ElForm;
    /** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
    // @ts-ignore
    const __VLS_369 = __VLS_asFunctionalComponent(__VLS_368, new __VLS_368({
        model: (__VLS_ctx.currentParams),
        labelWidth: "120px",
    }));
    const __VLS_370 = __VLS_369({
        model: (__VLS_ctx.currentParams),
        labelWidth: "120px",
    }, ...__VLS_functionalComponentArgsRest(__VLS_369));
    __VLS_371.slots.default;
    for (const [param] of __VLS_getVForSourceType((__VLS_ctx.currentExecutingSkill.input_params))) {
        const __VLS_372 = {}.ElFormItem;
        /** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
        // @ts-ignore
        const __VLS_373 = __VLS_asFunctionalComponent(__VLS_372, new __VLS_372({
            key: (param.name),
            label: (param.description),
            required: (param.required),
        }));
        const __VLS_374 = __VLS_373({
            key: (param.name),
            label: (param.description),
            required: (param.required),
        }, ...__VLS_functionalComponentArgsRest(__VLS_373));
        __VLS_375.slots.default;
        if (param.name === 'route_name') {
            const __VLS_376 = {}.ElSelect;
            /** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
            // @ts-ignore
            const __VLS_377 = __VLS_asFunctionalComponent(__VLS_376, new __VLS_376({
                modelValue: (__VLS_ctx.currentParams[param.name]),
                placeholder: (`请选择${param.description}`),
                disabled: (param.readonly),
                ...{ class: "param-select" },
            }));
            const __VLS_378 = __VLS_377({
                modelValue: (__VLS_ctx.currentParams[param.name]),
                placeholder: (`请选择${param.description}`),
                disabled: (param.readonly),
                ...{ class: "param-select" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_377));
            __VLS_379.slots.default;
            for (const [route] of __VLS_getVForSourceType((__VLS_ctx.availableRoutes))) {
                const __VLS_380 = {}.ElOption;
                /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
                // @ts-ignore
                const __VLS_381 = __VLS_asFunctionalComponent(__VLS_380, new __VLS_380({
                    key: (route),
                    label: (route),
                    value: (route),
                }));
                const __VLS_382 = __VLS_381({
                    key: (route),
                    label: (route),
                    value: (route),
                }, ...__VLS_functionalComponentArgsRest(__VLS_381));
            }
            var __VLS_379;
        }
        else if (param.name === 'institution_name') {
            const __VLS_384 = {}.ElSelect;
            /** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
            // @ts-ignore
            const __VLS_385 = __VLS_asFunctionalComponent(__VLS_384, new __VLS_384({
                modelValue: (__VLS_ctx.currentParams[param.name]),
                placeholder: (`请选择${param.description}`),
                disabled: (param.readonly),
                ...{ class: "param-select" },
            }));
            const __VLS_386 = __VLS_385({
                modelValue: (__VLS_ctx.currentParams[param.name]),
                placeholder: (`请选择${param.description}`),
                disabled: (param.readonly),
                ...{ class: "param-select" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_385));
            __VLS_387.slots.default;
            for (const [institution] of __VLS_getVForSourceType((__VLS_ctx.availableInstitutions))) {
                const __VLS_388 = {}.ElOption;
                /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
                // @ts-ignore
                const __VLS_389 = __VLS_asFunctionalComponent(__VLS_388, new __VLS_388({
                    key: (institution),
                    label: (institution),
                    value: (institution),
                }));
                const __VLS_390 = __VLS_389({
                    key: (institution),
                    label: (institution),
                    value: (institution),
                }, ...__VLS_functionalComponentArgsRest(__VLS_389));
            }
            const __VLS_392 = {}.ElOption;
            /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
            // @ts-ignore
            const __VLS_393 = __VLS_asFunctionalComponent(__VLS_392, new __VLS_392({
                label: "其他",
                value: "",
            }));
            const __VLS_394 = __VLS_393({
                label: "其他",
                value: "",
            }, ...__VLS_functionalComponentArgsRest(__VLS_393));
            var __VLS_387;
        }
        else {
            const __VLS_396 = {}.ElInput;
            /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
            // @ts-ignore
            const __VLS_397 = __VLS_asFunctionalComponent(__VLS_396, new __VLS_396({
                modelValue: (__VLS_ctx.currentParams[param.name]),
                placeholder: (`请输入${param.description}`),
                disabled: (param.readonly),
            }));
            const __VLS_398 = __VLS_397({
                modelValue: (__VLS_ctx.currentParams[param.name]),
                placeholder: (`请输入${param.description}`),
                disabled: (param.readonly),
            }, ...__VLS_functionalComponentArgsRest(__VLS_397));
        }
        var __VLS_375;
    }
    var __VLS_371;
}
{
    const { footer: __VLS_thisSlot } = __VLS_367.slots;
    const __VLS_400 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_401 = __VLS_asFunctionalComponent(__VLS_400, new __VLS_400({
        ...{ 'onClick': {} },
    }));
    const __VLS_402 = __VLS_401({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_401));
    let __VLS_404;
    let __VLS_405;
    let __VLS_406;
    const __VLS_407 = {
        onClick: (...[$event]) => {
            __VLS_ctx.showParamsDialog = false;
        }
    };
    __VLS_403.slots.default;
    var __VLS_403;
    const __VLS_408 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_409 = __VLS_asFunctionalComponent(__VLS_408, new __VLS_408({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_410 = __VLS_409({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_409));
    let __VLS_412;
    let __VLS_413;
    let __VLS_414;
    const __VLS_415 = {
        onClick: (__VLS_ctx.confirmExecute)
    };
    __VLS_411.slots.default;
    var __VLS_411;
}
var __VLS_367;
const __VLS_416 = {}.ElDialog;
/** @type {[typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ]} */ ;
// @ts-ignore
const __VLS_417 = __VLS_asFunctionalComponent(__VLS_416, new __VLS_416({
    modelValue: (__VLS_ctx.showResultDialog),
    title: (`执行结果 - ${__VLS_ctx.currentExecutingSkill?.name}`),
    width: "600px",
    destroyOnClose: true,
}));
const __VLS_418 = __VLS_417({
    modelValue: (__VLS_ctx.showResultDialog),
    title: (`执行结果 - ${__VLS_ctx.currentExecutingSkill?.name}`),
    width: "600px",
    destroyOnClose: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_417));
__VLS_419.slots.default;
if (__VLS_ctx.executionResult) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "result-container" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: (['result-status', __VLS_ctx.executionResult.success ? 'success' : 'error']) },
    });
    const __VLS_420 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_421 = __VLS_asFunctionalComponent(__VLS_420, new __VLS_420({
        size: (48),
    }));
    const __VLS_422 = __VLS_421({
        size: (48),
    }, ...__VLS_functionalComponentArgsRest(__VLS_421));
    __VLS_423.slots.default;
    if (__VLS_ctx.executionResult.success) {
        const __VLS_424 = {}.Plus;
        /** @type {[typeof __VLS_components.Plus, ]} */ ;
        // @ts-ignore
        const __VLS_425 = __VLS_asFunctionalComponent(__VLS_424, new __VLS_424({}));
        const __VLS_426 = __VLS_425({}, ...__VLS_functionalComponentArgsRest(__VLS_425));
    }
    else {
        const __VLS_428 = {}.Search;
        /** @type {[typeof __VLS_components.Search, ]} */ ;
        // @ts-ignore
        const __VLS_429 = __VLS_asFunctionalComponent(__VLS_428, new __VLS_428({}));
        const __VLS_430 = __VLS_429({}, ...__VLS_functionalComponentArgsRest(__VLS_429));
    }
    var __VLS_423;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "status-info" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    (__VLS_ctx.executionResult.success ? '执行成功' : '执行失败');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    (__VLS_ctx.executionResult.execution_time.toFixed(2));
    if (!__VLS_ctx.executionResult.success && __VLS_ctx.executionResult.error_message) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "error-hint" },
        });
        const __VLS_432 = {}.ElAlert;
        /** @type {[typeof __VLS_components.ElAlert, typeof __VLS_components.elAlert, ]} */ ;
        // @ts-ignore
        const __VLS_433 = __VLS_asFunctionalComponent(__VLS_432, new __VLS_432({
            message: (__VLS_ctx.executionResult.error_message),
            type: "error",
            showIcon: true,
            closable: (false),
        }));
        const __VLS_434 = __VLS_433({
            message: (__VLS_ctx.executionResult.error_message),
            type: "error",
            showIcon: true,
            closable: (false),
        }, ...__VLS_functionalComponentArgsRest(__VLS_433));
    }
    if (__VLS_ctx.executionResult.success && __VLS_ctx.executionResult.output_files && __VLS_ctx.executionResult.output_files.length > 0) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "output-section" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "files-grid" },
        });
        for (const [file, index] of __VLS_getVForSourceType((__VLS_ctx.executionResult.output_files))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                key: (index),
                ...{ class: "file-item" },
            });
            const __VLS_436 = {}.ElIcon;
            /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
            // @ts-ignore
            const __VLS_437 = __VLS_asFunctionalComponent(__VLS_436, new __VLS_436({
                size: (32),
                ...{ class: "file-icon" },
            }));
            const __VLS_438 = __VLS_437({
                size: (32),
                ...{ class: "file-icon" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_437));
            __VLS_439.slots.default;
            const __VLS_440 = {}.Document;
            /** @type {[typeof __VLS_components.Document, ]} */ ;
            // @ts-ignore
            const __VLS_441 = __VLS_asFunctionalComponent(__VLS_440, new __VLS_440({}));
            const __VLS_442 = __VLS_441({}, ...__VLS_functionalComponentArgsRest(__VLS_441));
            var __VLS_439;
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "file-info" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "file-name" },
            });
            (__VLS_ctx.getFileName(file));
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "file-actions" },
            });
            if (__VLS_ctx.isHtmlFile(file)) {
                const __VLS_444 = {}.ElLink;
                /** @type {[typeof __VLS_components.ElLink, typeof __VLS_components.elLink, typeof __VLS_components.ElLink, typeof __VLS_components.elLink, ]} */ ;
                // @ts-ignore
                const __VLS_445 = __VLS_asFunctionalComponent(__VLS_444, new __VLS_444({
                    ...{ 'onClick': {} },
                    type: "primary",
                    size: "small",
                }));
                const __VLS_446 = __VLS_445({
                    ...{ 'onClick': {} },
                    type: "primary",
                    size: "small",
                }, ...__VLS_functionalComponentArgsRest(__VLS_445));
                let __VLS_448;
                let __VLS_449;
                let __VLS_450;
                const __VLS_451 = {
                    onClick: (...[$event]) => {
                        if (!(__VLS_ctx.executionResult))
                            return;
                        if (!(__VLS_ctx.executionResult.success && __VLS_ctx.executionResult.output_files && __VLS_ctx.executionResult.output_files.length > 0))
                            return;
                        if (!(__VLS_ctx.isHtmlFile(file)))
                            return;
                        __VLS_ctx.previewHtml(file);
                    }
                };
                __VLS_447.slots.default;
                var __VLS_447;
            }
            const __VLS_452 = {}.ElLink;
            /** @type {[typeof __VLS_components.ElLink, typeof __VLS_components.elLink, typeof __VLS_components.ElLink, typeof __VLS_components.elLink, ]} */ ;
            // @ts-ignore
            const __VLS_453 = __VLS_asFunctionalComponent(__VLS_452, new __VLS_452({
                ...{ 'onClick': {} },
                type: "primary",
                size: "small",
            }));
            const __VLS_454 = __VLS_453({
                ...{ 'onClick': {} },
                type: "primary",
                size: "small",
            }, ...__VLS_functionalComponentArgsRest(__VLS_453));
            let __VLS_456;
            let __VLS_457;
            let __VLS_458;
            const __VLS_459 = {
                onClick: (...[$event]) => {
                    if (!(__VLS_ctx.executionResult))
                        return;
                    if (!(__VLS_ctx.executionResult.success && __VLS_ctx.executionResult.output_files && __VLS_ctx.executionResult.output_files.length > 0))
                        return;
                    __VLS_ctx.downloadFile(file);
                }
            };
            __VLS_455.slots.default;
            var __VLS_455;
        }
    }
    const __VLS_460 = {}.ElDialog;
    /** @type {[typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ]} */ ;
    // @ts-ignore
    const __VLS_461 = __VLS_asFunctionalComponent(__VLS_460, new __VLS_460({
        modelValue: (__VLS_ctx.showPreviewDialog),
        title: "结果预览",
        width: "800px",
        destroyOnClose: true,
    }));
    const __VLS_462 = __VLS_461({
        modelValue: (__VLS_ctx.showPreviewDialog),
        title: "结果预览",
        width: "800px",
        destroyOnClose: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_461));
    __VLS_463.slots.default;
    if (__VLS_ctx.previewUrl) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.iframe)({
            src: (__VLS_ctx.previewUrl),
            ...{ class: "preview-iframe" },
            sandbox: "allow-scripts allow-same-origin",
        });
    }
    var __VLS_463;
    if (__VLS_ctx.executionResult.success && (!__VLS_ctx.executionResult.output_files || __VLS_ctx.executionResult.output_files.length === 0)) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "success-hint" },
        });
        const __VLS_464 = {}.ElAlert;
        /** @type {[typeof __VLS_components.ElAlert, typeof __VLS_components.elAlert, ]} */ ;
        // @ts-ignore
        const __VLS_465 = __VLS_asFunctionalComponent(__VLS_464, new __VLS_464({
            message: "技能执行成功，无输出文件",
            type: "success",
            showIcon: true,
            closable: (false),
        }));
        const __VLS_466 = __VLS_465({
            message: "技能执行成功，无输出文件",
            type: "success",
            showIcon: true,
            closable: (false),
        }, ...__VLS_functionalComponentArgsRest(__VLS_465));
    }
}
var __VLS_419;
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['skill-manager-container']} */ ;
/** @type {__VLS_StyleScopedClasses['skill-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-header']} */ ;
/** @type {__VLS_StyleScopedClasses['skill-tabs']} */ ;
/** @type {__VLS_StyleScopedClasses['skill-list-container']} */ ;
/** @type {__VLS_StyleScopedClasses['search-section']} */ ;
/** @type {__VLS_StyleScopedClasses['search-input']} */ ;
/** @type {__VLS_StyleScopedClasses['layer-select']} */ ;
/** @type {__VLS_StyleScopedClasses['refresh-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-container']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-container']} */ ;
/** @type {__VLS_StyleScopedClasses['skills-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['skill-item']} */ ;
/** @type {__VLS_StyleScopedClasses['is-selected']} */ ;
/** @type {__VLS_StyleScopedClasses['skill-header']} */ ;
/** @type {__VLS_StyleScopedClasses['skill-name']} */ ;
/** @type {__VLS_StyleScopedClasses['skill-description']} */ ;
/** @type {__VLS_StyleScopedClasses['skill-info']} */ ;
/** @type {__VLS_StyleScopedClasses['info-item']} */ ;
/** @type {__VLS_StyleScopedClasses['info-item']} */ ;
/** @type {__VLS_StyleScopedClasses['skill-tags']} */ ;
/** @type {__VLS_StyleScopedClasses['trigger-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['execute-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['intent-container']} */ ;
/** @type {__VLS_StyleScopedClasses['intent-input-section']} */ ;
/** @type {__VLS_StyleScopedClasses['intent-input']} */ ;
/** @type {__VLS_StyleScopedClasses['intent-results']} */ ;
/** @type {__VLS_StyleScopedClasses['confidence-text']} */ ;
/** @type {__VLS_StyleScopedClasses['intent-examples']} */ ;
/** @type {__VLS_StyleScopedClasses['examples-list']} */ ;
/** @type {__VLS_StyleScopedClasses['example-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['history-container']} */ ;
/** @type {__VLS_StyleScopedClasses['history-header']} */ ;
/** @type {__VLS_StyleScopedClasses['history-list']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-history']} */ ;
/** @type {__VLS_StyleScopedClasses['skill-detail-content']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-descriptions']} */ ;
/** @type {__VLS_StyleScopedClasses['params-section']} */ ;
/** @type {__VLS_StyleScopedClasses['params-form']} */ ;
/** @type {__VLS_StyleScopedClasses['param-input']} */ ;
/** @type {__VLS_StyleScopedClasses['default-hint']} */ ;
/** @type {__VLS_StyleScopedClasses['example-hint']} */ ;
/** @type {__VLS_StyleScopedClasses['example-hint']} */ ;
/** @type {__VLS_StyleScopedClasses['patterns-section']} */ ;
/** @type {__VLS_StyleScopedClasses['pattern-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['param-select']} */ ;
/** @type {__VLS_StyleScopedClasses['param-select']} */ ;
/** @type {__VLS_StyleScopedClasses['result-container']} */ ;
/** @type {__VLS_StyleScopedClasses['result-status']} */ ;
/** @type {__VLS_StyleScopedClasses['status-info']} */ ;
/** @type {__VLS_StyleScopedClasses['error-hint']} */ ;
/** @type {__VLS_StyleScopedClasses['output-section']} */ ;
/** @type {__VLS_StyleScopedClasses['files-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['file-item']} */ ;
/** @type {__VLS_StyleScopedClasses['file-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['file-info']} */ ;
/** @type {__VLS_StyleScopedClasses['file-name']} */ ;
/** @type {__VLS_StyleScopedClasses['file-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-iframe']} */ ;
/** @type {__VLS_StyleScopedClasses['success-hint']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            Search: Search,
            Refresh: Refresh,
            List: List,
            Plus: Plus,
            Document: Document,
            activeTab: activeTab,
            filteredSkills: filteredSkills,
            selectedSkill: selectedSkill,
            searchKeyword: searchKeyword,
            layerFilter: layerFilter,
            isLoading: isLoading,
            currentParams: currentParams,
            currentExecutingSkill: currentExecutingSkill,
            executionResult: executionResult,
            showResultDialog: showResultDialog,
            showParamsDialog: showParamsDialog,
            intentQuery: intentQuery,
            intentMatches: intentMatches,
            intentExamples: intentExamples,
            availableRoutes: availableRoutes,
            availableInstitutions: availableInstitutions,
            showSkillDetailDialog: showSkillDetailDialog,
            historyRecords: historyRecords,
            getLayerTagType: getLayerTagType,
            getLayerLabel: getLayerLabel,
            loadSkills: loadSkills,
            handleSearch: handleSearch,
            selectSkill: selectSkill,
            selectSkillById: selectSkillById,
            getFileName: getFileName,
            isHtmlFile: isHtmlFile,
            showPreviewDialog: showPreviewDialog,
            previewUrl: previewUrl,
            previewHtml: previewHtml,
            downloadFile: downloadFile,
            openParamsDialog: openParamsDialog,
            confirmExecute: confirmExecute,
            executeSelectedSkill: executeSelectedSkill,
            executeSkillById: executeSkillById,
            parseIntent: parseIntent,
            loadHistory: loadHistory,
            reExecute: reExecute,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
