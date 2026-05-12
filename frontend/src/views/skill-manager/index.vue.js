import { ref, computed, nextTick, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Search, List, Setting, Refresh, User, Cpu, Document } from '@element-plus/icons-vue';
import { skillManagerApi } from '@/api/skillManager';
const searchKeyword = ref('');
const skills = ref([]);
const selectedSkill = ref(null);
const messages = ref([]);
const inputMessage = ref('');
const chatHistoryRef = ref(null);
const quickExamples = [
 '开展滨州到晋城线路五环节时限对标分析',
 '分析进口环节时限',
 '生成线路分析报告',
];
const currentParams = ref({});
const currentExecutingSkill = ref(null);
const showParamsDialog = ref(false);
const availableRoutes = ref(['滨州市晋城市', '滨州市烟台市', '滨州市菏泽市', '滨州市大同市']);
const availableInstitutions = ref(['博兴二部', '滨州市分公司', '晋城市分公司', '济南齐河']);
const filteredSkills = computed(() => {
 if (!searchKeyword.value)
 return skills.value;
 const keyword = searchKeyword.value.toLowerCase();
 return skills.value.filter(skill => skill.name.toLowerCase().includes(keyword) ||
 skill.description.toLowerCase().includes(keyword) ||
 skill.trigger_patterns.some(p => p.toLowerCase().includes(keyword)));
});
const getLayerTagType = (layer) => {
 const types = {
 overview: 'success',
 stage: 'primary',
 institution: 'warning',
 };
 return types[layer] || 'info';
};
const getLayerLabel = (layer) => {
 const labels = {
 overview: '全景分析层',
 stage: '环节分析层',
 institution: '机构下钻层',
 };
 return labels[layer] || layer;
};
const getSkillName = (skillId) => {
 const skill = skills.value.find(s => s.skill_id === skillId);
 return skill?.name || skillId;
};
const getFileName = (filePath) => {
 return filePath.split('/').pop() || filePath;
};
const handleSearch = () => { };
const loadSkills = async () => {
 try {
 const result = await skillManagerApi.getAllSkills();
 skills.value = result;
 }
 catch (error) {
 ElMessage.error('加载技能列表失败');
 console.error('加载技能错误:', error);
 }
};
const selectSkill = (skill) => {
 selectedSkill.value = skill;
};
const selectSkillById = async (skillId) => {
 try {
 const skill = await skillManagerApi.getSkill(skillId);
 selectedSkill.value = skill;
 currentExecutingSkill.value = skill;
 const cards = document.querySelectorAll('.skill-card-item');
 cards.forEach((card) => {
 if (card.getAttribute('data-skill-id') === skillId) {
 card.scrollIntoView({ behavior: 'smooth', block: 'center' });
 }
 });
 }
 catch (error) {
 ElMessage.error('获取技能详情失败');
 }
};
const openParamsDialog = (skill) => {
 currentExecutingSkill.value = skill;
 currentParams.value = {};
 skill.input_params.forEach((param) => {
 if (param.default !== undefined) {
 currentParams.value[param.name] = param.default;
 }
 });
 showParamsDialog.value = true;
};
const sendMessage = async (message) => {
 if (!message.trim())
 return;
 messages.value.push({
 type: 'user',
 content: message.trim(),
 time: new Date().toLocaleTimeString(),
 });
 inputMessage.value = '';
 await nextTick();
 scrollToBottom();
 try {
 const matches = await skillManagerApi.parseIntent(message.trim());
 messages.value.push({
 type: 'bot',
 content: `已识别您的需求，匹配到 ${matches.length} 个技能`,
 time: new Date().toLocaleTimeString(),
 matches,
 });
 }
 catch (error) {
 messages.value.push({
 type: 'bot',
 content: '抱歉，识别失败，请重试',
 time: new Date().toLocaleTimeString(),
 });
 console.error('意图识别错误:', error);
 }
 await nextTick();
 scrollToBottom();
};
const scrollToBottom = () => {
 if (chatHistoryRef.value) {
 chatHistoryRef.value.scrollTop = chatHistoryRef.value.scrollHeight;
 }
};
const executeSkillById = async (skillId) => {
 try {
 const skill = await skillManagerApi.getSkill(skillId);
 currentExecutingSkill.value = skill;
 currentParams.value = {};
 skill.input_params.forEach((param) => {
 if (param.default !== undefined) {
 currentParams.value[param.name] = param.default;
 }
 });
 const missingRequiredParams = skill.input_params.filter(param => param.required && !currentParams.value[param.name]);
 if (missingRequiredParams.length > 0) {
 showParamsDialog.value = true;
 ElMessage.warning('请填写必填参数');
 return;
 }
 await executeSkill(skillId);
 }
 catch (error) {
 ElMessage.error('获取技能信息失败');
 console.error('获取技能信息错误:', error);
 }
};
const executeSkill = async (skillId) => {
 try {
 const result = await skillManagerApi.executeSkill(skillId, currentParams.value);
 messages.value.push({
 type: 'bot',
 content: result.success ? '技能执行完成' : '技能执行失败',
 time: new Date().toLocaleTimeString(),
 result,
 });
 await nextTick();
 scrollToBottom();
 if (!result.success) {
 ElMessage.error('技能执行失败');
 }
 else {
 ElMessage.success('技能执行成功');
 }
 }
 catch (error) {
 messages.value.push({
 type: 'bot',
 content: '技能执行失败: ' + (error.message || '未知错误'),
 time: new Date().toLocaleTimeString(),
 result: {
 success: false,
 execution_time: 0,
 error_message: error.message || '未知错误',
 output_files: [],
 },
 });
 await nextTick();
 scrollToBottom();
 ElMessage.error('技能执行失败');
 console.error('执行技能错误:', error);
 }
};
const confirmExecute = async () => {
 if (!currentExecutingSkill.value)
 return;
 showParamsDialog.value = false;
 try {
 const result = await skillManagerApi.executeSkill(currentExecutingSkill.value.skill_id, currentParams.value);
 messages.value.push({
 type: 'bot',
 content: result.success ? '技能执行完成' : '技能执行失败',
 time: new Date().toLocaleTimeString(),
 result,
 });
 await nextTick();
 scrollToBottom();
 if (!result.success) {
 ElMessage.error('技能执行失败');
 }
 else {
 ElMessage.success('技能执行成功');
 }
 }
 catch (error) {
 messages.value.push({
 type: 'bot',
 content: '技能执行失败: ' + (error.message || '未知错误'),
 time: new Date().toLocaleTimeString(),
 result: {
 success: false,
 execution_time: 0,
 error_message: error.message || '未知错误',
 output_files: [],
 },
 });
 await nextTick();
 scrollToBottom();
 ElMessage.error('技能执行失败');
 console.error('执行技能错误:', error);
 }
};
const downloadFile = (filePath) => {
 window.open(`${import.meta.env.VITE_API_URL}/api/v1/skill-manager/files/${encodeURIComponent(filePath)}`, '_blank');
};
onMounted(() => {
 loadSkills();
});
